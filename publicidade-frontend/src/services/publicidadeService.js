import api from '../services/api';

export const PublicidadeService = {
  getDashboard: () => api.get('/admin/publicidade/dashboard'),
  
  listSquads: () => api.get('/admin/publicidade/squads'),
  getSquad: (id) => api.get(`/admin/publicidade/squads/${id}`),
  runSquad: (squadName, input) => api.post('/admin/publicidade/squads/run', { squadName, input }),
  getExecution: (executionId) => api.get(`/admin/publicidade/squads/execution/${executionId}`),
  
  listSkills: () => api.get('/admin/publicidade/skills'),
  installSkill: (skillName) => api.post('/admin/publicidade/skills/install', { skillName }),
  uninstallSkill: (skillName) => api.delete(`/admin/publicidade/skills/${skillName}`),
  
  getLogs: (limit = 100, offset = 0) => api.get('/admin/publicidade/logs', { params: { limit, offset } }),
  getExecutionLogs: (executionId) => api.get(`/admin/publicidade/logs/execution/${executionId}`),
  
  getDashboardInfo: (squadName) => api.get(`/admin/publicidade/dashboard/${squadName}`),
  getDashboardUrl: (squadName) => api.get(`/admin/publicidade/dashboard/${squadName}/url`)
};
