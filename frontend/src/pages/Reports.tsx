import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Reports() {
  const [summary, setSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const [salesRes, analyticsRes] = await Promise.all([
          api.get('/reports/sales'),
          api.get('/reports/analytics')
        ]);
        setSummary(salesRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        setSummary(null);
        setAnalytics(null);
      }
    }
    fetchReports();
  }, []);

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const response = await api.get(`/reports/export/${format}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'csv' ? 'sales-export.csv' : 'sales-export.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <section className="page">
      <div className="card">
        <h1>Reports</h1>
        <p>Export dashboards for sales, inventory valuation, profit, and reconciliation.</p>
        <div className="button-group">
          <button type="button" onClick={() => exportData('csv')}>Export CSV</button>
          <button type="button" onClick={() => exportData('json')}>Export JSON</button>
        </div>
      </div>
      <div className="card">
        <h2>Sales summary</h2>
        <pre>{JSON.stringify(summary, null, 2)}</pre>
      </div>
      <div className="card">
        <h2>Analytics snapshot</h2>
        <pre>{JSON.stringify(analytics, null, 2)}</pre>
      </div>
    </section>
  );
}
