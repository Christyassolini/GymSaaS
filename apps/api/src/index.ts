import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { authPlugin } from "./plugins/auth.plugin.js";
import { studentsRoutes } from "./modules/students/students.routes.js";
import { plansRoutes } from "./modules/plans/plans.routes.js";
import { paymentsRoutes } from "./modules/payments/payments.routes.js";
import { classesRoutes } from "./modules/classes/classes.routes.js";
import { workoutsRoutes } from "./modules/workouts/workouts.routes.js";

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty" }
        : undefined,
  },
});

// Plugins de segurança e infraestrutura
await app.register(helmet);
await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  credentials: true,
});
await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});

// Autenticação (Better Auth — todas as rotas /api/auth/*)
await app.register(authPlugin);

// Módulos da aplicação
await app.register(studentsRoutes, { prefix: "/api" });
await app.register(plansRoutes, { prefix: "/api" });
await app.register(paymentsRoutes, { prefix: "/api" });
await app.register(classesRoutes, { prefix: "/api" });
await app.register(workoutsRoutes, { prefix: "/api" });

// Health check
app.get("/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Error handler global
app.setErrorHandler((error, _request, reply) => {
  if (error.name === "ZodError") {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: JSON.parse(error.message),
    });
  }

  if (error.message === "CPF já cadastrado." || error.message.includes("não encontrado")) {
    return reply.status(400).send({ error: error.message });
  }

  app.log.error(error);
  return reply.status(500).send({ error: "Erro interno do servidor." });
});

// Start
const start = async () => {
  try {
    const port = Number(process.env.API_PORT) || 3001;
    const host = process.env.API_HOST ?? "0.0.0.0";

    await app.listen({ port, host });
    console.log(`GymSaaS API rodando em http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
