import { EventEmitter } from 'node:events';
import { getDb } from '../db.js';
import { getProviderCredentials } from '../routes/providers.js';
import { getSquadFull } from '../routes/squads.js';
import { analyzeReference } from '../instagram/scraper.js';
import { publishToInstagram } from '../instagram/publisher.js';
import {
  runResearcher, runStrategist, runWriter, runDesigner, runReviewer,
} from './agents.js';

export const runEmitters = new Map();

export async function startRun(squadId, topic, additionalContext = '') {
  const squad = getSquadFull(squadId);
  if (!squad) throw new Error('Squad não encontrado');
  if (!squad.provider_id) throw new Error('Nenhum provedor LLM configurado para este squad');

  const db = getDb();
  const { lastInsertRowid: runId } = db
    .prepare("INSERT INTO runs (squad_id, topic, status, started_at) VALUES (?, ?, 'running', datetime('now'))")
    .run(squadId, topic);

  const emitter = new EventEmitter();
  runEmitters.set(runId, emitter);

  // Fire-and-forget — don't await so HTTP response returns immediately
  execute(runId, squad, topic, additionalContext, emitter).catch(err => {
    getDb()
      .prepare("UPDATE runs SET status='failed', error=?, completed_at=datetime('now') WHERE id=?")
      .run(err.message, runId);
    emitter.emit('event', { type: 'error', message: err.message });
    runEmitters.delete(runId);
  });

  return runId;
}

async function execute(runId, squad, topic, additionalContext, emitter) {
  const db   = getDb();
  const creds = getProviderCredentials(squad.provider_id);
  const llm  = { provider: creds.name, model: squad.model, api_key: creds.api_key };

  const emit = (step, status, extra = {}) =>
    emitter.emit('event', { type: 'progress', step, status, ...extra });

  const save = (type, filename, content) =>
    db.prepare('INSERT INTO outputs (run_id, type, filename, content) VALUES (?, ?, ?, ?)')
      .run(runId, type, filename, content);

  // Build context brief
  const brief = [
    `Squad: ${squad.name}`,
    squad.description?.trim()
      ? `Brief fixo do squad (objetivo, marca, regras que valem em toda execução): ${squad.description.trim()}`
      : '',
    `Tópico desta execução: ${topic}`,
    `Segmento: ${squad.domain}`,
    `Plataformas: ${(squad.platforms || []).join(', ')}`,
    additionalContext ? `Contexto adicional só desta execução: ${additionalContext}` : '',
  ].filter(Boolean).join('\n');

  // 1. Analyze reference links
  let refContext = '';
  if (squad.ref_links?.length > 0) {
    emit('references', 'running', { message: 'Analisando referências de estilo...' });
    for (const link of squad.ref_links.filter(l => l?.trim())) {
      try { refContext += `\n${await analyzeReference(link)}`; } catch { /* non-fatal */ }
    }
    if (squad.ref_notes) refContext += `\nNotas: ${squad.ref_notes}`;
    emit('references', 'done');
  }

  const context = { brief: brief + (refContext ? `\n\nEstilo de referência:\n${refContext}` : ''), domain: squad.domain, platforms: squad.platforms };

  // 2. Researcher
  let research = '';
  if (squad.agents.includes('pesquisador')) {
    emit('pesquisador', 'running', { message: 'Pesquisando tendências e dados...' });
    research = await runResearcher(llm, context.brief);
    save('text', 'research.txt', research);
    emit('pesquisador', 'done', { preview: research.slice(0, 200) });
  }

  // 3. Strategist
  let strategy = '';
  if (squad.agents.includes('estrategista')) {
    emit('estrategista', 'running', { message: 'Definindo estratégia editorial...' });
    strategy = await runStrategist(llm, context, research);
    save('text', 'strategy.txt', strategy);
    emit('estrategista', 'done', { preview: strategy.slice(0, 200) });
  }

  // 4. Writer
  let copy = null;
  if (squad.agents.includes('redator')) {
    emit('redator', 'running', { message: 'Criando copy e legendas...' });
    copy = await runWriter(llm, context, strategy || research);
    save('text', 'copy.json', JSON.stringify(copy, null, 2));
    emit('redator', 'done', { preview: copy.caption?.slice(0, 200) });
  }

  // 5. Designer — OpenAI (DALL-E) ou Google (Gemini imagem), mesma chave do provedor
  let images = [];
  if (squad.agents.includes('designer') && copy?.slides?.length > 0 && (creds.name === 'openai' || creds.name === 'google')) {
    const msg = creds.name === 'openai' ? 'Gerando imagens com DALL-E...' : 'Gerando imagens com Gemini...';
    emit('designer', 'running', { message: msg });
    images = await runDesigner(llm, copy, refContext || squad.ref_notes || '');
    for (const img of images) {
      if (img.b64) {
        save('image', `slide-${img.slide}.png`, img.b64);
        emit('designer', 'running', { message: `Slide ${img.slide} gerado ✓` });
      }
    }
    emit('designer', 'done', { imageCount: images.filter(i => i.b64).length });
  } else if (squad.agents.includes('designer') && copy?.slides?.length > 0) {
    emit('designer', 'skipped', { message: 'Designer requer provedor OpenAI ou Google (Gemini).' });
  }

  // 6. Reviewer
  let finalCopy = copy;
  if (squad.agents.includes('revisor') && copy) {
    emit('revisor', 'running', { message: 'Revisando conteúdo...' });
    finalCopy = await runReviewer(llm, copy);
    save('text', 'copy-final.json', JSON.stringify(finalCopy, null, 2));
    emit('revisor', 'done');
  }

  // 7. Publisher
  if (squad.auto_publish && squad.agents.includes('publisher') && squad.ig_token && finalCopy) {
    emit('publisher', 'running', { message: 'Publicando no Instagram...' });
    try {
      const imageB64s = images.filter(i => i.b64).map(i => i.b64);
      await publishToInstagram({
        token:    squad.ig_token,
        userId:   squad.ig_user_id,
        imgbbKey: squad.imgbb_key,
        caption:  `${finalCopy.caption || ''}\n\n${(finalCopy.hashtags || []).join(' ')}`,
        imagesB64: imageB64s,
      });
      emit('publisher', 'done', { message: 'Publicado com sucesso! 🎉' });
    } catch (err) {
      emit('publisher', 'error', { message: `Falha ao publicar: ${err.message}` });
    }
  }

  db.prepare("UPDATE runs SET status='completed', completed_at=datetime('now') WHERE id=?").run(runId);

  const outputs = db.prepare('SELECT id, type, filename FROM outputs WHERE run_id = ?').all(runId);
  emitter.emit('event', { type: 'complete', runId, outputs });
  runEmitters.delete(runId);
}
