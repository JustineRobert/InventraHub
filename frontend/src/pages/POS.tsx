import { useEffect, useState } from 'react';
import api from '../services/api';
import BarcodeScanner from '../components/BarcodeScanner';

export default function POS() {
  const [items, setItems] = useState<any[]>([]);
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    async function loadInventory() {
      try {
        const response = await api.get('/inventory');
        setItems(response.data);
      } catch (_err) {
        setItems([]);
      }
    }

    loadInventory();
  }, []);

  return (
    <section className="page">
      <div className="card">
        <h1>Point of Sale</h1>
        <p>Offline-first sales and barcode scanning for fast checkout.</p>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h2>Barcode Scanner</h2>
          <BarcodeScanner onDetected={(code) => setScanResult(code)} />
          <p>{scanResult ? `Detected SKU: ${scanResult}` : 'Scan a barcode to lookup inventory.'}</p>
        </div>
        <div className="card">
          <h2>Recent items</h2>
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
              {items.slice(0, 10).map((item) => (
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
      </div>
    </section>
  );
}
