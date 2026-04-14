import { ChangeEvent, useState } from 'react';
import api from '../services/api';

export default function Notifications() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Your order is ready for pickup.');
  const [status, setStatus] = useState<string | null>(null);

  const sendNotification = async () => {
    try {
      const response = await api.post('/notifications/whatsapp', { phone, message });
      setStatus(response.data.message || 'Notification sent');
    } catch (error) {
      setStatus('Failed to send notification');
    }
  };

  return (
    <section className="page">
      <div className="card">
        <h1>WhatsApp Notifications</h1>
        <p>Send order updates, receipts, and reminders directly to customer WhatsApp.</p>
        <div className="form-field">
          <label htmlFor="phone">Phone number</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
            placeholder="+256700000000"
          />
        </div>
        <div className="form-field">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            rows={4}
          />
        </div>
        <button type="button" onClick={sendNotification}>Send WhatsApp Notification</button>
        {status && <p>{status}</p>}
      </div>
    </section>
  );
}
