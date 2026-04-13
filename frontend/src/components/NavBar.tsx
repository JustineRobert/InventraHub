import { Link, useLocation } from 'react-router-dom';

type NavBarProps = {
  authenticated: boolean;
  onLogout: () => void;
};

export default function NavBar({ authenticated, onLogout }: NavBarProps) {
  const location = useLocation();
  const active = (path: string) => (location.pathname === path ? 'nav-link active' : 'nav-link');

  return (
    <nav className="navbar">
      <div className="nav-brand">InventraHub</div>
      {authenticated ? (
        <>
          <Link to="/dashboard" className={active('/dashboard')}>Dashboard</Link>
          <Link to="/inventory" className={active('/inventory')}>Inventory</Link>
          <Link to="/orders" className={active('/orders')}>Orders</Link>
          <Link to="/payments" className={active('/payments')}>Payments</Link>
          <Link to="/reports" className={active('/reports')}>Reports</Link>
          <button className="button secondary" onClick={onLogout} style={{ marginTop: 'auto' }}>
            Logout
          </button>
        </>
      ) : null}
    </nav>
  );
}
