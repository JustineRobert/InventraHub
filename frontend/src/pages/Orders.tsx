import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (error) {
        setOrders([]);
      }
    }
    fetchOrders();
  }, []);

  return (
    <section className="page">
      <div className="card">
        <h1>Orders</h1>
        <p>Create customer orders, track statuses, and manage invoices.</p>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.reference}</td>
                <td>{order.customer?.name || 'N/A'}</td>
                <td>{order.status}</td>
                <td>{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
