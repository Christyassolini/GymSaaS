import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@gymsaas/database";
import { authenticate, requireRole } from "../../middlewares/authenticate.js";

const createClassSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["INDIVIDUAL", "GROUP"]),
  description: z.string().optional(),
  maxStudents: z.number().int().positive().optional(),
  scheduledAt: z.string().datetime(),
  durationMin: z.number().int().positive().default(60),
  location: z.string().optional(),
  trainerId: z.string().optional(),
});

const enrollSchema = z.object({
  studentId: z.string(),
});

export async function classesRoutes(app: FastifyInstance) {
  // GET /classes
  app.get("/classes", { preHandler: authenticate }, async (request, reply) => {
    const gymId = request.currentUser!.gymId!;
    const { from, to } = z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    }).parse(request.query);

    const classes = await prisma.class.findMany({
      where: {
        gymId,
        cancelled: false,
        ...(from || to ? {
          scheduledAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        } : {}),
      },
      include: {
        trainer: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return reply.send(classes);
  });

  // POST /classes
  app.post("/classes", { preHandler: requireRole("ADMIN", "PERSONAL_TRAINER") }, async (request, reply) => {
    const gymId = request.currentUser!.gymId!;
    const body = createClassSchema.parse(request.body);

    const gymClass = await prisma.class.create({
      data: {
        ...body,
        gymId,
        scheduledAt: new Date(body.scheduledAt),
      },
    });

    return reply.status(201).send(gymClass);
  });

  // POST /classes/:id/enroll
  app.post("/classes/:id/enroll", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { studentId } = enrollSchema.parse(request.body);

    const gymClass = await prisma.class.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true } } },
    });

    if (!gymClass) return reply.status(404).send({ error: "Aula não encontrada." });
    if (gymClass.cancelled) return reply.status(400).send({ error: "Aula cancelada." });

    if (gymClass.maxStudents && gymClass._count.enrollments >= gymClass.maxStudents) {
      return reply.status(400).send({ error: "Aula sem vagas disponíveis." });
    }

    const enrollment = await prisma.classEnrollment.create({
      data: { classId: id, studentId },
    });

    return reply.status(201).send(enrollment);
  });

  // PATCH /classes/:id/attendance — marcar presença
  app.patch("/classes/:id/attendance", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { studentId, attended } = z.object({
      studentId: z.string(),
      attended: z.boolean(),
    }).parse(request.body);

    const updated = await prisma.classEnrollment.updateMany({
      where: { classId: id, studentId },
      data: { attended },
    });

    return reply.send({ updated: updated.count });
  });

  // DELETE /classes/:id — cancelar aula
  app.delete("/classes/:id", { preHandler: requireRole("ADMIN", "PERSONAL_TRAINER") }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.class.update({
      where: { id },
      data: { cancelled: true },
    });

    return reply.status(204).send();
  });
}
