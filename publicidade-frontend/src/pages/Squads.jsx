import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicidadeService } from '../services/publicidadeService';

export default function Squads() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState({});

  useEffect(() => {
    loadSquads();
  }, []);

  const loadSquads = async () => {
    try {
      const { data } = await PublicidadeService.listSquads();
      setSquads(data.squads || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (squadName) => {
    setRunning(prev => ({ ...prev, [squadName]: true }));
    try {
      await PublicidadeService.runSquad(squadName);
      alert(`Execução iniciada: ${squadName}`);
    } catch (err) {
      alert(`Erro: ${err.message}`);
    } finally {
      setRunning(prev => ({ ...prev, [squadName]: false }));
    }
  };

  if (loading) return <div className="loading">Carregando squads...</div>;
  if (error) return <div className="error">Erro: {error}</div>;

  return (
    <div className="squads-page">
      <div className="page-header">
        <h2>Squads</h2>
        <span className="count">{squads.length} squads</span>
      </div>

      {squads.length > 0 ? (
        <div className="squads-grid">
          {squads.map((squad) => (
            <div key={squad.name} className="squad-card">
              <div className="squad-header">
                <h3>{squad.name}</h3>
                {squad.hasDashboard && <span className="badge">Dashboard</span>}
              </div>
              
              <p className="squad-description">{squad.description || 'Sem descrição'}</p>
              
              {squad.agents?.length > 0 && (
                <div className="squad-agents">
                  <strong>Agentes:</strong>
                  <div className="agents-list">
                    {squad.agents.map((agent, i) => (
                      <span key={i} className="agent-tag">{agent}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="squad-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleRun(squad.name)}
                  disabled={running[squad.name]}
                >
                  {running[squad.name] ? 'Executando...' : '▶ Executar'}
                </button>
                <Link to={`/squads/${squad.name}`} className="btn btn-secondary">
                  Detalhes
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Nenhum squad encontrado</p>
          <p className="hint">Crie squads usando o CLI: npx opensquad create</p>
        </div>
      )}
    </div>
  );
}
