import axios from 'axios';
import { env } from '../config/env';
import { logger } from './logger';

const isWhatsAppEnabled = () => {
  return !!(env.META_WHATSAPP_PHONE_NUMBER_ID && env.META_WHATSAPP_ACCESS_TOKEN);
};

const getWhatsAppUrl = () => {
  return `https://graph.facebook.com/${env.META_WHATSAPP_API_VERSION}/${env.META_WHATSAPP_PHONE_NUMBER_ID}/messages`;
};

// Send a pre-approved template message
export const sendWhatsAppTemplate = async (
  to: string,           // patient phone e.g. 9876543210
  templateName: string, // approved template name
  parameters: string[]  // dynamic values in the template
) => {
  if (!isWhatsAppEnabled()) {
    logger.info(`[WhatsApp Disabled] Would have sent template '${templateName}' to ${to} with params: ${parameters.join(', ')}`);
    return;
  }

  await axios.post(
    getWhatsAppUrl(),
    {
      messaging_product: 'whatsapp',
      to: `91${to}`,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: parameters.map(text => ({ type: 'text', text })),
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${env.META_WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

// Send a plain text message (only to users who messaged you first within 24hrs)
export const sendWhatsAppText = async (to: string, message: string) => {
  if (!isWhatsAppEnabled()) {
    logger.info(`[WhatsApp Disabled] Would have sent text message to ${to}: ${message}`);
    return;
  }

  await axios.post(
    getWhatsAppUrl(),
    {
      messaging_product: 'whatsapp',
      to: `91${to}`,
      type: 'text',
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${env.META_WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

// Usage — send payment QR link to patient
export const sendPaymentWhatsApp = async (patientPhone: string, patientName: string, amount: string, qrLink: string) => {
  await sendWhatsAppTemplate(patientPhone, 'payment_request', [patientName, amount, qrLink]);
};
