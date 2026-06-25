import { z } from "zod";

export const createStudentStep1Schema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos").regex(/^\d+$/, "CPF deve conter apenas números"),
  birthDate: z.string().datetime(),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

export const updateStudentStep2Schema = z.object({
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  injuries: z.string().optional(),
  restrictions: z.string().optional(),
  medicalNotes: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export const listStudentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  active: z.enum(["true", "false"]).optional(),
});

export type CreateStudentStep1 = z.infer<typeof createStudentStep1Schema>;
export type UpdateStudentStep2 = z.infer<typeof updateStudentStep2Schema>;
export type ListStudentsParams = z.infer<typeof listStudentsSchema>;
