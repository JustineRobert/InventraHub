import { useEffect, useState } from 'react';
import axios from 'axios';

type Stats = { title: string; value: string | number }[];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>([]);

  useEffect(() => {
    async function load() {
      try {
        const sales = await axios.get('/api/reports/sales');
        const valuation = await axios.get('/api/reports/inventory');
        setStats([
          { title: 'Sales categories', value: sales.data.summary.length },
          { title: 'Inventory valuation', value: valuation.data.valuation._sum.purchaseCost ?? 0 },
          { title: 'Profit estimate', value: 'N/A' }
        ]);
      } catch (err) {
        setStats([]);
      }
    }
    load();
  }, []);

  return (
    <section className="page">
      <div className="card">
        <h1>Dashboard</h1>
        <p>Hardware operations, mobile money readiness, and stock overview in one place.</p>
      </div>
      <div className="grid grid-3">
        {stats.map((stat) => (
          <div key={stat.title} className="card">
            <h3>{stat.title}</h3>
            <p style={{ fontSize: '2rem', margin: '16px 0 0' }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
