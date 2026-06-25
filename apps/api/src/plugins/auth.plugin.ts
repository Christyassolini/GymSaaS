import type { FastifyInstance } from "fastify";
import { auth } from "../lib/auth.js";

export async function authPlugin(app: FastifyInstance) {
  app.all("/api/auth/*", async (request, reply) => {
    // Constrói URL absoluta a partir do request do Fastify
    const host = request.headers.host ?? "localhost:3001";
    const protocol = request.protocol ?? "http";
    const url = new URL(request.url, `${protocol}://${host}`);

    // Converte os headers para o formato Web API
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    }

    // Usa o body já parseado pelo Fastify e re-serializa para o handler
    const hasBody = request.method !== "GET" && request.method !== "HEAD" && request.body;
    const body = hasBody ? JSON.stringify(request.body) : undefined;

    // Cria Web API Request compatível com Better Auth
    const webRequest = new Request(url.toString(), {
      method: request.method,
      headers,
      body,
    });

    const response = await auth.handler(webRequest);

    reply.status(response.status);
    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });

    const text = await response.text();
    return reply.send(text || null);
  });
}
