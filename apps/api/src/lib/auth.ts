import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@gymsaas/database";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",

  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias
    updateAge: 60 * 60 * 24,     // atualiza a cada 24h
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // cache de 5 minutos
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        fieldName: "role",
      },
      gymId: {
        type: "string",
        required: false,
        fieldName: "gymId",
      },
      groupId: {
        type: "string",
        required: false,
        fieldName: "groupId",
      },
    },
  },

  trustedOrigins: [
    process.env.FRONTEND_URL ?? "http://localhost:3000",
  ],
});

export type Auth = typeof auth;
