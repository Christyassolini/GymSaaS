import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@gymsaas/database";
import { authenticate, requireRole } from "../../middlewares/authenticate.js";

const createPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  durationDays: z.number().int().positive(),
  prices: z.array(
    z.object({
      gymId: z.string(),
      price: z.number().positive(),
    })
  ).optional(),
});

const createSubscriptionSchema = z.object({
  studentId: z.string(),
  planId: z.string(),
  startDate: z.string().datetime(),
  price: z.number().positive(),
  notes: z.string().optional(),
});

export async function plansRoutes(app: FastifyInstance) {
  // GET /plans
  app.get("/plans", { preHandler: authenticate }, async (request, reply) => {
    const { groupId } = request.currentUser!;
    if (!groupId) return reply.status(400).send({ error: "Usuário não vinculado a um grupo." });

    const plans = await prisma.plan.findMany({
      where: { groupId, active: true },
      include: { prices: true },
      orderBy: { name: "asc" },
    });

    return reply.send(plans);
  });

  // POST /plans
  app.post("/plans", { preHandler: requireRole("ADMIN", "FINANCIAL") }, async (request, reply) => {
    const body = createPlanSchema.parse(request.body);
    const { groupId } = request.currentUser!;
    if (!groupId) return reply.status(400).send({ error: "Usuário não vinculado a um grupo." });

    const plan = await prisma.plan.create({
      data: {
        name: body.name,
        description: body.description,
        durationDays: body.durationDays,
        groupId,
        prices: body.prices
          ? { create: body.prices }
          : undefined,
      },
      include: { prices: true },
    });

    return reply.status(201).send(plan);
  });

  // POST /subscriptions
  app.post("/subscriptions", { preHandler: authenticate }, async (request, reply) => {
    const body = createSubscriptionSchema.parse(request.body);

    const plan = await prisma.plan.findUnique({ where: { id: body.planId } });
    if (!plan) return reply.status(404).send({ error: "Plano não encontrado." });

    const startDate = new Date(body.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const subscription = await prisma.subscription.create({
      data: {
        studentId: body.studentId,
        planId: body.planId,
        startDate,
        endDate,
        price: body.price,
        notes: body.notes,
        status: "ACTIVE",
      },
      include: { plan: true, student: true },
    });

    return reply.status(201).send(subscription);
  });
}
