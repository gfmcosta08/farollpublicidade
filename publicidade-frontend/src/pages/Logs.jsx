import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicidadeService } from '../services/publicidadeService';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data } = await PublicidadeService.getLogs(50, 0);
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando logs...</div>;
  if (error) return <div className="error">Erro: {error}</div>;

  return (
    <div className="logs-page">
      <div className="page-header">
        <h2>Logs de Execução</h2>
        <button onClick={loadLogs} className="btn btn-secondary">Atualizar</button>
      </div>

      {logs.length > 0 ? (
        <div className="logs-table">
          <div className="table-header">
            <span>Status</span>
            <span>Squad</span>
            <span>Data</span>
            <span>Duração</span>
            <span>Ações</span>
          </div>
          {logs.map((log) => (
            <div key={log.id} className="table-row">
              <span className={`status status-${log.status}`}>{log.status}</span>
              <span className="squad-name">{log.squadName}</span>
              <span className="date">{new Date(log.startedAt).toLocaleString()}</span>
              <span className="duration">{log.duration ? `${Math.round(log.duration / 1000)}s` : '-'}</span>
              <Link to={`/execution/${log.id}`} className="btn-link">
                Ver Detalhes
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Nenhuma execução registrada</p>
        </div>
      )}
    </div>
  );
}
