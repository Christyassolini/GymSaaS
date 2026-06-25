import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, requireRole } from "../../middlewares/authenticate.js";
import {
  createPaymentSchema,
  recordManualPaymentSchema,
  listPayments,
  createPayment,
  recordManualPayment,
  getDashboardFinancial,
} from "./payments.service.js";

export async function paymentsRoutes(app: FastifyInstance) {
  // GET /payments/dashboard
  app.get("/payments/dashboard", { preHandler: requireRole("ADMIN", "FINANCIAL") }, async (request, reply) => {
    const gymId = request.currentUser!.gymId!;
    const data = await getDashboardFinancial(gymId);
    return reply.send(data);
  });

  // GET /payments
  app.get("/payments", { preHandler: requireRole("ADMIN", "FINANCIAL") }, async (request, reply) => {
    const gymId = request.currentUser!.gymId!;
    const query = z.object({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(20),
      studentId: z.string().optional(),
      status: z.string().optional(),
    }).parse(request.query);

    const result = await listPayments(gymId, query);
    return reply.send(result);
  });

  // POST /payments
  app.post("/payments", { preHandler: requireRole("ADMIN", "FINANCIAL") }, async (request, reply) => {
    const gymId = request.currentUser!.gymId!;
    const body = createPaymentSchema.parse(request.body);
    const payment = await createPayment(gymId, body);
    return reply.status(201).send(payment);
  });

  // PATCH /payments/:id/pay — pagamento manual (maquininha/dinheiro)
  app.patch("/payments/:id/pay", { preHandler: requireRole("ADMIN", "FINANCIAL") }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const gymId = request.currentUser!.gymId!;
    const body = recordManualPaymentSchema.parse(request.body);

    const payment = await recordManualPayment(id, gymId, body);
    return reply.send(payment);
  });
}
