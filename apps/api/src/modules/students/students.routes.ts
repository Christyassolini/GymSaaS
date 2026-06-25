import type { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  createStudentStep1Schema,
  updateStudentStep2Schema,
  listStudentsSchema,
} from "./students.schema.js";
import * as service from "./students.service.js";

export async function studentsRoutes(app: FastifyInstance) {
  // GET /students
  app.get("/students", { preHandler: authenticate }, async (request, reply) => {
    const params = listStudentsSchema.parse(request.query);
    const gymId = request.currentUser!.gymId!;

    const result = await service.listStudents(gymId, params);
    return reply.send(result);
  });

  // GET /students/:id
  app.get("/students/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const gymId = request.currentUser!.gymId!;

    const student = await service.getStudentById(id, gymId);
    if (!student) return reply.status(404).send({ error: "Aluno não encontrado." });

    return reply.send(student);
  });

  // POST /students — Etapa 1
  app.post("/students", { preHandler: authenticate }, async (request, reply) => {
    const body = createStudentStep1Schema.parse(request.body);
    const gymId = request.currentUser!.gymId!;

    const student = await service.createStudent(gymId, body);
    return reply.status(201).send(student);
  });

  // PATCH /students/:id/profile — Etapa 2
  app.patch("/students/:id/profile", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const gymId = request.currentUser!.gymId!;
    const body = updateStudentStep2Schema.parse(request.body);

    const student = await service.updateStudentStep2(id, gymId, body);
    return reply.send(student);
  });

  // DELETE /students/:id (soft delete)
  app.delete("/students/:id", { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const gymId = request.currentUser!.gymId!;

    await service.deactivateStudent(id, gymId);
    return reply.status(204).send();
  });
}
