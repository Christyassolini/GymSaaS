import { prisma } from "@gymsaas/database";
import type { CreateStudentStep1, UpdateStudentStep2, ListStudentsParams } from "./students.schema.js";

export async function listStudents(gymId: string, params: ListStudentsParams) {
  const { page, limit, search, active } = params;
  const skip = (page - 1) * limit;

  const where = {
    gymId,
    ...(active !== undefined ? { active: active === "true" } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { cpf: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.student.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getStudentById(id: string, gymId: string) {
  return prisma.student.findFirst({
    where: { id, gymId },
    include: {
      subscriptions: {
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      },
      payments: {
        orderBy: { dueDate: "desc" },
        take: 10,
      },
      workouts: {
        where: { active: true },
        include: {
          items: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
}

export async function createStudent(gymId: string, data: CreateStudentStep1) {
  const existing = await prisma.student.findUnique({ where: { cpf: data.cpf } });
  if (existing) {
    throw new Error("CPF já cadastrado.");
  }

  return prisma.student.create({
    data: {
      ...data,
      gymId,
      birthDate: new Date(data.birthDate),
    },
  });
}

export async function updateStudentStep2(id: string, gymId: string, data: UpdateStudentStep2) {
  const student = await prisma.student.findFirst({ where: { id, gymId } });
  if (!student) throw new Error("Aluno não encontrado.");

  return prisma.student.update({
    where: { id },
    data,
  });
}

export async function deactivateStudent(id: string, gymId: string) {
  const student = await prisma.student.findFirst({ where: { id, gymId } });
  if (!student) throw new Error("Aluno não encontrado.");

  return prisma.student.update({
    where: { id },
    data: { active: false },
  });
}
