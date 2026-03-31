import api from '../services/api';

const API = '/api/admin/publicidade';

export const PublicidadeService = {
  getDashboard: () => api.get(`${API}/dashboard`),

  listSquads: () => api.get(`${API}/squads`),
  getSquad: (id) => api.get(`${API}/squads/${id}`),
  runSquad: (squadName, input) =>
    api.post(`${API}/squads/run`, { squadName, input }),
  getExecution: (executionId) =>
    api.get(`${API}/squads/execution/${executionId}`),

  listSkills: () => api.get(`${API}/skills`),
  installSkill: (skillName) =>
    api.post(`${API}/skills/install`, { skillName }),
  uninstallSkill: (skillName) =>
    api.delete(`${API}/skills/${skillName}`),

  getLogs: (limit = 100, offset = 0) =>
    api.get(`${API}/logs`, { params: { limit, offset } }),
  getExecutionLogs: (executionId) =>
    api.get(`${API}/logs/execution/${executionId}`),

  getDashboardInfo: (squadName) =>
    api.get(`${API}/dashboard/${squadName}`),
  getDashboardUrl: (squadName) =>
    api.get(`${API}/dashboard/${squadName}/url`),
};
