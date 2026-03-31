import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Squads from './pages/Squads';
import SquadDetail from './pages/SquadDetail';
import Execution from './pages/Execution';
import Logs from './pages/Logs';
import Skills from './pages/Skills';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/admin/publicidade" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="squads" element={<Squads />} />
        <Route path="squads/:id" element={<SquadDetail />} />
        <Route path="execution/:executionId" element={<Execution />} />
        <Route path="logs" element={<Logs />} />
        <Route path="skills" element={<Skills />} />
      </Route>
    </Routes>
  );
}

export default App;
