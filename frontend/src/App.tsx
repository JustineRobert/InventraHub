import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import NavBar from './components/NavBar';

function App() {
  const token = localStorage.getItem('inventrahub_token');
  const [authenticated, setAuthenticated] = useState(Boolean(token));

  const layout = useMemo(
    () => (
      <div className="app-shell">
        <NavBar authenticated={authenticated} onLogout={() => {
          localStorage.removeItem('inventrahub_token');
          setAuthenticated(false);
        }}/>
        <main className="content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    ),
    [authenticated]
  );

  return authenticated ? layout : <Login onLogin={() => setAuthenticated(true)} />;
}

export default App;
