import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Reports() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await api.get('/reports/sales');
        setReport(response.data);
      } catch (error) {
        setReport(null);
      }
    }
    fetchReport();
  }, []);

  return (
    <section className="page">
      <div className="card">
        <h1>Reports</h1>
        <p>Export dashboards for sales, inventory valuation, profit, and reconciliation.</p>
      </div>
      <div className="card">
        <pre>{JSON.stringify(report, null, 2)}</pre>
      </div>
    </section>
  );
}
