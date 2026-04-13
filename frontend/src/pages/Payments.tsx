import { useState } from 'react';

export default function Payments() {
  const [paymentNotes] = useState([
    'MTN MoMo and Airtel Money payment flow endpoints are implemented on the backend.',
    'Use /api/payments to initiate mobile money payment flow.',
    'Verify payments with /api/payments/verify/:reference after provider callback.'
  ]);

  return (
    <section className="page">
      <div className="card">
        <h1>Payments</h1>
        <p>Mobile money, partial payments, and payment reconciliation dashboards.</p>
      </div>
      <div className="card">
        <ul>
          {paymentNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
