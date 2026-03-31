import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicidadeService } from '../services/publicidadeService';

export default function Execution() {
  const { executionId } = useParams();
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    loadExecution();
    
    const interval = setInterval(() => {
      if (execution?.status === 'running') {
        loadExecution();
      } else {
        setPolling(false);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [executionId]);

  const loadExecution = async () => {
    try {
      const { data } = await PublicidadeService.getExecution(executionId);
      setExecution(data.execution || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando execução...</div>;
  if (error) return <div className="error">Erro: {error}</div>;
  if (!execution) return <div className="error">Execução não encontrada</div>;

  return (
    <div className="execution-page">
      <Link to="/admin/publicidade/logs" className="back-link">← Voltar aos Logs</Link>
      
      <div className="execution-header">
        <h2>Execução: {execution.squadName}</h2>
        <span className={`status status-${execution.status}`}>{execution.status}</span>
      </div>

      <div className="execution-info">
        <div className="info-item">
          <strong>Início:</strong>
          <span>{new Date(execution.startedAt).toLocaleString()}</span>
        </div>
        {execution.finishedAt && (
          <div className="info-item">
            <strong>Fim:</strong>
            <span>{new Date(execution.finishedAt).toLocaleString()}</span>
          </div>
        )}
        {execution.duration && (
          <div className="info-item">
            <strong>Duração:</strong>
            <span>{Math.round(execution.duration / 1000)}s</span>
          </div>
        )}
      </div>

      <div className="logs-container">
        <h3>Logs</h3>
        <div className="logs-output">
          {execution.logs?.length > 0 ? (
            execution.logs.map((log, i) => (
              <div key={i} className={`log-line ${log.type}`}>
                <span className="log-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))
          ) : (
            <p className="empty">Nenhum log disponível</p>
          )}
        </div>
      </div>

      {execution.error && (
        <div className="error-box">
          <h3>Erro</h3>
          <pre>{execution.error}</pre>
        </div>
      )}
    </div>
  );
}
