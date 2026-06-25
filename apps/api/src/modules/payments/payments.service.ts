import { prisma } from "@gymsaas/database";
import { z } from "zod";

export const createPaymentSchema = z.object({
  studentId: z.string(),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  description: z.string().optional(),
});

export const recordManualPaymentSchema = z.object({
  method: z.enum(["CASH", "MACHINE", "PIX", "CREDIT_CARD", "DEBIT_CARD"]),
  paidAt: z.string().datetime().optional(),
});

export type CreatePayment = z.infer<typeof createPaymentSchema>;
export type RecordManualPayment = z.infer<typeof recordManualPaymentSchema>;

export async function listPayments(gymId: string, params: {
  page: number;
  limit: number;
  studentId?: string;
  status?: string;
}) {
  const { page, limit, studentId, status } = params;
  const skip = (page - 1) * limit;

  const where = {
    gymId,
    ...(studentId ? { studentId } : {}),
    ...(status ? { status: status as "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dueDate: "desc" },
      include: {
        student: { select: { id: true, name: true, cpf: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createPayment(gymId: string, data: CreatePayment) {
  return prisma.payment.create({
    data: {
      gymId,
      studentId: data.studentId,
      amount: data.amount,
      dueDate: new Date(data.dueDate),
      description: data.description,
      status: "PENDING",
    },
  });
}

export async function recordManualPayment(
  id: string,
  gymId: string,
  data: RecordManualPayment
) {
  const payment = await prisma.payment.findFirst({ where: { id, gymId } });
  if (!payment) throw new Error("Pagamento não encontrado.");

  const updated = await prisma.payment.update({
    where: { id },
    data: {
      status: "PAID",
      method: data.method as "CASH" | "MACHINE" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD",
      paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
    },
  });

  // Registra no fluxo de caixa
  await prisma.cashFlow.create({
    data: {
      gymId,
      type: "INCOME",
      amount: payment.amount,
      description: payment.description ?? `Pagamento manual — aluno #${payment.studentId}`,
      category: "MENSALIDADE",
      date: updated.paidAt ?? new Date(),
    },
  });

  return updated;
}

export async function getDashboardFinancial(gymId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [totalPaid, totalPending, totalOverdue, recentPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: { gymId, status: "PAID", paidAt: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { gymId, status: "PENDING" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { gymId, status: "OVERDUE" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.findMany({
      where: { gymId, status: "PAID", paidAt: { gte: startOfMonth } },
      orderBy: { paidAt: "desc" },
      take: 5,
      include: { student: { select: { name: true } } },
    }),
  ]);

  return {
    totalPaidThisMonth: totalPaid._sum.amount ?? 0,
    totalPending: { amount: totalPending._sum.amount ?? 0, count: totalPending._count },
    totalOverdue: { amount: totalOverdue._sum.amount ?? 0, count: totalOverdue._count },
    recentPayments,
  };
}
