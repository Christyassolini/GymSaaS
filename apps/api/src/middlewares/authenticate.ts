import type { FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../lib/auth.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  gymId: string | null;
  groupId: string | null;
}

declare module "fastify" {
  interface FastifyRequest {
    currentUser?: AuthenticatedUser;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const session = await auth.api.getSession({
    headers: request.headers as unknown as Headers,
  });

  if (!session?.user) {
    return reply.status(401).send({ error: "Não autenticado." });
  }

  request.currentUser = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as Record<string, unknown>).role as string ?? "RECEPTIONIST",
    gymId: (session.user as Record<string, unknown>).gymId as string | null ?? null,
    groupId: (session.user as Record<string, unknown>).groupId as string | null ?? null,
  };
}

export function requireRole(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply);

    if (reply.sent) return;

    if (!roles.includes(request.currentUser!.role)) {
      return reply.status(403).send({ error: "Acesso negado." });
    }
  };
}
