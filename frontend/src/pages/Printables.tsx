import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Printables() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    async function loadRecords() {
      try {
        const response = await api.get('/printables');
        setRecords(response.data);
      } catch (error) {
        setRecords([]);
      }
    }
    loadRecords();
  }, []);

  return (
    <section className="page">
      <div className="card">
        <h1>Printables</h1>
        <p>Review generated invoices, receipts, delivery notes, and print status.</p>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Format</th>
              <th>Printed At</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{record.title}</td>
                <td>{record.recordType}</td>
                <td>{record.format}</td>
                <td>{record.printedAt ? new Date(record.printedAt).toLocaleString() : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
