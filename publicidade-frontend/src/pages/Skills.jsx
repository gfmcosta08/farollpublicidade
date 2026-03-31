import { useState, useEffect } from 'react';
import { PublicidadeService } from '../services/publicidadeService';

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [installing, setInstalling] = useState(null);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const { data } = await PublicidadeService.listSkills();
      setSkills(data.skills || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    if (!newSkill.trim()) return;
    setInstalling(newSkill);
    try {
      await PublicidadeService.installSkill(newSkill);
      alert(`Skill ${newSkill} instalada!`);
      setNewSkill('');
      loadSkills();
    } catch (err) {
      alert(`Erro: ${err.message}`);
    } finally {
      setInstalling(null);
    }
  };

  const handleUninstall = async (skillName) => {
    if (!confirm(`Remover skill ${skillName}?`)) return;
    try {
      await PublicidadeService.uninstallSkill(skillName);
      alert(`Skill ${skillName} removida!`);
      loadSkills();
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  if (loading) return <div className="loading">Carregando skills...</div>;
  if (error) return <div className="error">Erro: {error}</div>;

  return (
    <div className="skills-page">
      <div className="page-header">
        <h2>Skills</h2>
        <span className="count">{skills.length} skills</span>
      </div>

      <div className="install-section">
        <input
          type="text"
          placeholder="Nome da skill para instalar..."
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          className="input"
        />
        <button
          onClick={handleInstall}
          disabled={installing || !newSkill.trim()}
          className="btn btn-primary"
        >
          {installing ? 'Instalando...' : '+ Instalar Skill'}
        </button>
      </div>

      {skills.length > 0 ? (
        <div className="skills-grid">
          {skills.map((skill) => (
            <div key={skill.name} className="skill-card">
              <div className="skill-header">
                <h3>{skill.name}</h3>
              </div>
              <p className="skill-description">{skill.description || 'Sem descrição'}</p>
              {skill.version && <span className="version">v{skill.version}</span>}
              <button
                onClick={() => handleUninstall(skill.name)}
                className="btn btn-danger btn-small"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Nenhuma skill instalada</p>
          <p className="hint">Instale skills usando npx opensquad install</p>
        </div>
      )}
    </div>
  );
}
