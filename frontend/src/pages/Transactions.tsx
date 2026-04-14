import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    async function loadTransactions() {
      try {
        const response = await api.get('/transactions');
        setTransactions(response.data);
      } catch (error) {
        setTransactions([]);
      }
    }
    loadTransactions();
  }, []);

  return (
    <section className="page">
      <div className="card">
        <h1>Transactions</h1>
        <p>Trace all order and payment activity across your business.</p>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Type</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.reference}</td>
                <td>{tx.type}</td>
                <td>{tx.status}</td>
                <td>{tx.amount}</td>
                <td>{tx.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
