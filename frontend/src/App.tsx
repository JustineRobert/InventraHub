import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import api from './services/api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import POS from './pages/POS';
import Branches from './pages/Branches';
import Forecast from './pages/Forecast';
import Notifications from './pages/Notifications';
import Transactions from './pages/Transactions';
import Printables from './pages/Printables';
import NavBar from './components/NavBar';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      try {
        await api.get('/auth/profile');
        setAuthenticated(true);
      } catch (_err) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, []);

  const layout = useMemo(
    () => (
      <div className="app-shell">
        <NavBar authenticated={authenticated} onLogout={async () => {
          await api.post('/auth/logout');
          setAuthenticated(false);
        }}/>
        <main className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/printables" element={<Printables />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    ),
    [authenticated]
  );

  if (loading) {
    return <div className="loading-shell">Loading...</div>;
  }

  return authenticated ? layout : <Login onLogin={() => setAuthenticated(true)} />;
}

export default App;
