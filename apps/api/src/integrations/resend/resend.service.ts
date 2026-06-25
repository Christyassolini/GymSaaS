// Resend — E-mails transacionais

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "noreply@gymsaas.com.br",
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export function paymentDueEmailTemplate(params: {
  studentName: string;
  gymName: string;
  amount: number;
  dueDate: string;
  paymentLink?: string;
}) {
  const { studentName, gymName, amount, dueDate, paymentLink } = params;
  const formattedAmount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #2563eb;">GymSaaS — Lembrete de Mensalidade</h2>
      <p>Olá, <strong>${studentName}</strong>!</p>
      <p>Sua mensalidade na <strong>${gymName}</strong> vence em <strong>${dueDate}</strong>.</p>
      <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; font-size: 18px;">Valor: <strong>${formattedAmount}</strong></p>
      </div>
      ${paymentLink ? `<a href="${paymentLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Pagar Agora</a>` : ""}
      <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">
        Em caso de dúvidas, entre em contato com a academia.
      </p>
    </body>
    </html>
  `;
}

export function paymentConfirmedEmailTemplate(params: {
  studentName: string;
  gymName: string;
  amount: number;
}) {
  const { studentName, gymName, amount } = params;
  const formattedAmount = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #16a34a;">Pagamento Confirmado!</h2>
      <p>Olá, <strong>${studentName}</strong>!</p>
      <p>Seu pagamento de <strong>${formattedAmount}</strong> na <strong>${gymName}</strong> foi confirmado com sucesso.</p>
      <p>Obrigado e bons treinos!</p>
    </body>
    </html>
  `;
}
