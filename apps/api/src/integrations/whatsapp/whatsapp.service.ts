// Meta WhatsApp Business API — Notificações

const META_BASE_URL = "https://graph.facebook.com/v19.0";

async function metaRequest<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`${META_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Meta API error ${response.status}: ${JSON.stringify(error)}`);
  }

  return response.json() as Promise<T>;
}

function formatPhone(phone: string): string {
  // Remove tudo que não for número e garante formato internacional (55 + DDD + número)
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("55") && cleaned.length >= 12) return cleaned;
  return `55${cleaned}`;
}

export async function sendWhatsAppMessage(to: string, text: string) {
  const phoneId = process.env.META_PHONE_NUMBER_ID!;

  return metaRequest("POST", `/${phoneId}/messages`, {
    messaging_product: "whatsapp",
    to: formatPhone(to),
    type: "text",
    text: { body: text },
  });
}

export async function sendPaymentDueWhatsApp(params: {
  to: string;
  studentName: string;
  gymName: string;
  amount: number;
  dueDate: string;
  paymentLink?: string;
}) {
  const { to, studentName, gymName, amount, dueDate, paymentLink } = params;
  const formattedAmount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

  let message = `Olá, *${studentName}*! 👋\n\n`;
  message += `Sua mensalidade na *${gymName}* vence em *${dueDate}*.\n`;
  message += `Valor: *${formattedAmount}*\n\n`;

  if (paymentLink) {
    message += `Pague agora: ${paymentLink}\n\n`;
  }

  message += `Em caso de dúvidas, entre em contato com a academia. 🏋️`;

  return sendWhatsAppMessage(to, message);
}

export async function sendPaymentConfirmedWhatsApp(params: {
  to: string;
  studentName: string;
  gymName: string;
  amount: number;
}) {
  const { to, studentName, gymName, amount } = params;
  const formattedAmount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

  const message =
    `✅ *Pagamento confirmado!*\n\n` +
    `Olá, *${studentName}*!\n` +
    `Seu pagamento de *${formattedAmount}* na *${gymName}* foi confirmado.\n\n` +
    `Bons treinos! 💪`;

  return sendWhatsAppMessage(to, message);
}

// Webhook verification (Meta exige esse handshake)
export function verifyWebhook(
  mode: string,
  token: string,
  challenge: string
): string | null {
  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}
