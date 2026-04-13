import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Inventory() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await api.get('/inventory');
        setItems(response.data);
      } catch (error) {
        setItems([]);
      }
    }
    fetchItems();
  }, []);

  return (
    <section className="page">
      <div className="card">
        <h1>Inventory</h1>
        <p>Manage hardware stock, categories, and low-stock alerts.</p>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.sku}</td>
                <td>{item.quantity}</td>
                <td>{item.sellingPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
