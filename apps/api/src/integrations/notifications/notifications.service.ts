// Serviço central de notificações
// Orquestra envio por e-mail e/ou WhatsApp com base nas configurações da academia

import { prisma } from "@gymsaas/database";
import { sendEmail, paymentDueEmailTemplate, paymentConfirmedEmailTemplate } from "../resend/resend.service.js";
import { sendPaymentDueWhatsApp, sendPaymentConfirmedWhatsApp } from "../whatsapp/whatsapp.service.js";

export async function notifyPaymentDue(params: {
  studentId: string;
  gymId: string;
  paymentId: string;
}) {
  const [student, gym, payment] = await Promise.all([
    prisma.student.findUnique({ where: { id: params.studentId } }),
    prisma.gym.findUnique({ where: { id: params.gymId } }),
    prisma.payment.findUnique({ where: { id: params.paymentId } }),
  ]);

  if (!student || !gym || !payment) return;

  const dueDate = payment.dueDate.toLocaleDateString("pt-BR");
  const amount = Number(payment.amount);
  const paymentLink = payment.asaasInvoiceUrl ?? undefined;

  const errors: string[] = [];

  // E-mail
  if (gym.notifyEmail && student.email) {
    try {
      await sendEmail({
        to: student.email,
        subject: `Mensalidade vencendo em ${dueDate} — ${gym.name}`,
        html: paymentDueEmailTemplate({
          studentName: student.name,
          gymName: gym.name,
          amount,
          dueDate,
          paymentLink,
        }),
      });

      await prisma.notification.create({
        data: {
          studentId: student.id,
          type: "PAYMENT_DUE",
          channel: "EMAIL",
          title: "Lembrete de mensalidade",
          body: `Mensalidade de R$ ${amount} vence em ${dueDate}`,
          sentAt: new Date(),
        },
      });
    } catch (err) {
      errors.push(`Email: ${(err as Error).message}`);
    }
  }

  // WhatsApp
  if (gym.notifyWhatsapp) {
    try {
      await sendPaymentDueWhatsApp({
        to: student.phone,
        studentName: student.name,
        gymName: gym.name,
        amount,
        dueDate,
        paymentLink,
      });

      await prisma.notification.create({
        data: {
          studentId: student.id,
          type: "PAYMENT_DUE",
          channel: "WHATSAPP",
          title: "Lembrete de mensalidade",
          body: `Mensalidade de R$ ${amount} vence em ${dueDate}`,
          sentAt: new Date(),
        },
      });
    } catch (err) {
      errors.push(`WhatsApp: ${(err as Error).message}`);
    }
  }

  if (errors.length > 0) {
    console.error("[Notification Error]", errors);
  }
}

export async function notifyPaymentConfirmed(params: {
  studentId: string;
  gymId: string;
  amount: number;
}) {
  const [student, gym] = await Promise.all([
    prisma.student.findUnique({ where: { id: params.studentId } }),
    prisma.gym.findUnique({ where: { id: params.gymId } }),
  ]);

  if (!student || !gym) return;

  if (gym.notifyEmail && student.email) {
    await sendEmail({
      to: student.email,
      subject: `Pagamento confirmado — ${gym.name}`,
      html: paymentConfirmedEmailTemplate({
        studentName: student.name,
        gymName: gym.name,
        amount: params.amount,
      }),
    }).catch(console.error);
  }

  if (gym.notifyWhatsapp) {
    await sendPaymentConfirmedWhatsApp({
      to: student.phone,
      studentName: student.name,
      gymName: gym.name,
      amount: params.amount,
    }).catch(console.error);
  }
}
