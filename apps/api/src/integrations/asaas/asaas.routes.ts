import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@gymsaas/database";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  getOrCreateAsaasCustomer,
  createAsaasPayment,
  getPixQrCode,
  type AsaasWebhookPayload,
} from "./asaas.service.js";

const createAsaasChargeSchema = z.object({
  paymentId: z.string(),
  billingType: z.enum(["BOLETO", "PIX", "CREDIT_CARD"]),
});

export async function asaasRoutes(app: FastifyInstance) {
  // POST /payments/asaas/charge — Gera cobrança Asaas a partir de um payment existente
  app.post("/payments/asaas/charge", { preHandler: authenticate }, async (request, reply) => {
    const { paymentId, billingType } = createAsaasChargeSchema.parse(request.body);

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { student: true },
    });

    if (!payment) return reply.status(404).send({ error: "Pagamento não encontrado." });
    if (payment.asaasPaymentId) return reply.status(400).send({ error: "Cobrança já criada no Asaas." });

    // Cria ou recupera cliente Asaas
    const customer = await getOrCreateAsaasCustomer({
      id: payment.student.id,
      name: payment.student.name,
      email: payment.student.email,
      cpf: payment.student.cpf,
      phone: payment.student.phone,
    });

    // Cria cobrança
    const asaasPayment = await createAsaasPayment({
      customerId: customer.id,
      billingType,
      value: Number(payment.amount),
      dueDate: payment.dueDate.toISOString().split("T")[0],
      description: payment.description ?? "Mensalidade GymSaaS",
    });

    // Atualiza pagamento com dados do Asaas
    const updateData: Record<string, unknown> = {
      asaasPaymentId: asaasPayment.id,
      asaasInvoiceUrl: asaasPayment.invoiceUrl,
      method: billingType === "CREDIT_CARD" ? "CREDIT_CARD" : billingType,
    };

    if (billingType === "PIX" && asaasPayment.pixQrCodeId) {
      const pix = await getPixQrCode(asaasPayment.id);
      updateData.asaasPixCode = pix.payload;
    }

    if (billingType === "BOLETO") {
      updateData.asaasBoletoCode = asaasPayment.bankSlipUrl;
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
    });

    return reply.send(updated);
  });

  // POST /webhooks/asaas — Webhook do Asaas
  app.post("/webhooks/asaas", async (request, reply) => {
    const payload = request.body as AsaasWebhookPayload;

    if (!payload?.payment?.id) {
      return reply.status(400).send({ error: "Payload inválido." });
    }

    const payment = await prisma.payment.findFirst({
      where: { asaasPaymentId: payload.payment.id },
    });

    if (!payment) return reply.status(200).send({ ok: true });

    if (
      payload.event === "PAYMENT_RECEIVED" ||
      payload.event === "PAYMENT_CONFIRMED"
    ) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", paidAt: new Date() },
      });

      // Registra no fluxo de caixa
      await prisma.cashFlow.create({
        data: {
          gymId: payment.gymId,
          type: "INCOME",
          amount: payment.amount,
          description: payment.description ?? "Mensalidade via Asaas",
          category: "MENSALIDADE",
          date: new Date(),
        },
      });
    }

    if (payload.event === "PAYMENT_OVERDUE") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "OVERDUE" },
      });
    }

    return reply.status(200).send({ ok: true });
  });
}
