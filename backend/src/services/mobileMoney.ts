type MobileMoneyPayload = {
  orderId: string;
  amount: number;
  provider: string;
  reference: string;
};

export async function createMobileMoneyPayment(payload: MobileMoneyPayload) {
  // Production: plug in MTN MoMo / Airtel Money provider API here.
  return {
    status: 'PENDING',
    reference: payload.reference,
    receiptUrl: null,
    provider: payload.provider,
    amount: payload.amount,
    details: `Queued ${payload.provider} payment for order ${payload.orderId}`
  };
}

export async function verifyMobileMoneyPayment(reference: string) {
  // Production: call provider verification endpoint and reconcile payment status.
  return {
    status: 'PAID',
    details: `Payment ${reference} verified using mock mobile money stub.`
  };
}
