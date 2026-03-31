import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicidadeService } from '../services/publicidadeService';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await PublicidadeService.getDashboard();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">Erro: {error}</div>;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.total_squads || 0}</div>
          <div className="stat-label">Total Squads</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.stats?.completed || 0}</div>
          <div className="stat-label">Executados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.stats?.running || 0}</div>
          <div className="stat-label">Em Execução</div>
        </div>
        <div className="stat-card error">
          <div className="stat-value">{stats?.stats?.failed || 0}</div>
          <div className="stat-label">Falhas</div>
        </div>
      </div>

      <div className="section">
        <h3>Execuções Recentes</h3>
        {stats?.recent_executions?.length > 0 ? (
          <div className="executions-list">
            {stats.recent_executions.map((exec) => (
              <Link
                key={exec.id}
                to={`/admin/publicidade/execution/${exec.id}`}
                className="execution-item"
              >
                <span className={`status status-${exec.status}`}>{exec.status}</span>
                <span className="squad-name">{exec.squadName}</span>
                <span className="date">{new Date(exec.startedAt).toLocaleString()}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="empty">Nenhuma execução recente</p>
        )}
      </div>

      <div className="actions">
        <Link to="/admin/publicidade/squads" className="btn btn-primary">
          Ver Todos os Squads
        </Link>
      </div>
    </div>
  );
}
