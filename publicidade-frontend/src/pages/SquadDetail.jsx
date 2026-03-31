import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicidadeService } from '../services/publicidadeService';

export default function SquadDetail() {
  const { id } = useParams();
  const [squad, setSquad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadSquad();
  }, [id]);

  const loadSquad = async () => {
    try {
      const { data } = await PublicidadeService.getSquad(id);
      setSquad(data.squad || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    try {
      const { data } = await PublicidadeService.runSquad(id);
      alert(`Execução iniciada! ID: ${data.executionId}`);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">Erro: {error}</div>;
  if (!squad) return <div className="error">Squad não encontrado</div>;

  return (
    <div className="squad-detail">
      <div className="page-header">
        <Link to="/admin/publicidade/squads" className="back-link">← Voltar</Link>
        <h2>{squad.name}</h2>
      </div>

      <div className="detail-card">
        <p className="description">{squad.description || 'Sem descrição'}</p>
        
        {squad.agents?.length > 0 && (
          <div className="section">
            <h3>Agentes</h3>
            <div className="tags">
              {squad.agents.map((agent, i) => (
                <span key={i} className="tag">{agent}</span>
              ))}
            </div>
          </div>
        )}

        {squad.tasks?.length > 0 && (
          <div className="section">
            <h3>Tarefas</h3>
            <div className="tasks-list">
              {squad.tasks.map((task, i) => (
                <div key={i} className="task-item">{task}</div>
              ))}
            </div>
          </div>
        )}

        <div className="actions">
          <button
            className="btn btn-primary btn-large"
            onClick={handleRun}
            disabled={running}
          >
            {running ? 'Executando...' : '▶ Executar Squad'}
          </button>
          
          {squad.hasDashboard && (
            <button
              className="btn btn-secondary"
              onClick={async () => {
                const { data } = await PublicidadeService.getDashboardUrl(id);
                alert(`Execute: npx serve squads/${id}/dashboard\nOu abra: http://localhost:3000`);
              }}
            >
              📊 Ver Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
