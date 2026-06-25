import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@gymsaas/database";
import { authenticate, requireRole } from "../../middlewares/authenticate.js";

const createExerciseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  muscleGroup: z.string().optional(),
  videoUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
});

const createWorkoutSchema = z.object({
  studentId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  items: z.array(z.object({
    exerciseId: z.string(),
    sets: z.number().int().positive(),
    reps: z.string(),
    weight: z.string().optional(),
    restSeconds: z.number().int().nonnegative().optional(),
    notes: z.string().optional(),
    order: z.number().int().nonnegative().default(0),
  })),
});

export async function workoutsRoutes(app: FastifyInstance) {
  // GET /exercises — banco de exercícios
  app.get("/exercises", { preHandler: authenticate }, async (request, reply) => {
    const gymId = request.currentUser!.gymId!;

    const exercises = await prisma.exercise.findMany({
      where: { OR: [{ gymId }, { gymId: null }] },
      orderBy: [{ gymId: "asc" }, { name: "asc" }],
    });

    return reply.send(exercises);
  });

  // POST /exercises
  app.post("/exercises", { preHandler: requireRole("ADMIN", "PERSONAL_TRAINER") }, async (request, reply) => {
    const gymId = request.currentUser!.gymId!;
    const body = createExerciseSchema.parse(request.body);

    const exercise = await prisma.exercise.create({
      data: { ...body, gymId },
    });

    return reply.status(201).send(exercise);
  });

  // GET /workouts?studentId=xxx
  app.get("/workouts", { preHandler: authenticate }, async (request, reply) => {
    const { studentId } = z.object({
      studentId: z.string().optional(),
    }).parse(request.query);

    const workouts = await prisma.workout.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        active: true,
      },
      include: {
        items: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
        student: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send(workouts);
  });

  // GET /workouts/:id
  app.get("/workouts/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        items: {
          include: { exercise: true },
          orderBy: { order: "asc" },
        },
        student: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!workout) return reply.status(404).send({ error: "Treino não encontrado." });
    return reply.send(workout);
  });

  // POST /workouts
  app.post("/workouts", { preHandler: requireRole("ADMIN", "PERSONAL_TRAINER") }, async (request, reply) => {
    const body = createWorkoutSchema.parse(request.body);
    const createdById = request.currentUser!.id;

    const workout = await prisma.workout.create({
      data: {
        studentId: body.studentId,
        createdById,
        name: body.name,
        description: body.description,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        items: {
          create: body.items,
        },
      },
      include: {
        items: { include: { exercise: true } },
      },
    });

    return reply.status(201).send(workout);
  });

  // DELETE /workouts/:id — inativar treino
  app.delete("/workouts/:id", { preHandler: requireRole("ADMIN", "PERSONAL_TRAINER") }, async (request, reply) => {
    const { id } = request.params as { id: string };

    await prisma.workout.update({
      where: { id },
      data: { active: false },
    });

    return reply.status(204).send();
  });
}
