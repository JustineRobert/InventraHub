import config from '../config';

export async function sendWhatsAppMessage(phone: string, message: string, orderId?: string) {
  if (config.whatsappApiUrl && config.whatsappToken && config.whatsappPhoneNumberId) {
    const url = `${config.whatsappApiUrl}/${config.whatsappPhoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: message }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.whatsappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`WhatsApp Business API error: ${JSON.stringify(result)}`);
    }

    return {
      phone,
      message,
      orderId,
      status: 'sent',
      provider: 'WhatsApp Business API',
      providerResult: result
    };
  }

  return {
    phone,
    message,
    orderId,
    status: 'queued',
    note: 'WhatsApp Business API is not configured. Set WHATSAPP_BUSINESS_API_URL, WHATSAPP_BUSINESS_TOKEN, and WHATSAPP_BUSINESS_PHONE_NUMBER_ID.'
  };
}
