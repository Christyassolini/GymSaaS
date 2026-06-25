// Script de seed — cria o primeiro Grupo, Academia e usuários de teste por perfil
// Usa Better Auth diretamente (não precisa do servidor rodando)
// Execute com: npm run db:seed (na raiz do projeto)

import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

// =============================================
// CONFIGURE AQUI ANTES DE RODAR
// =============================================
const CONFIG = {
  group: {
    name: "Minha Academia",
    slug: "minha-academia",
  },
  gym: {
    name: "Minha Academia — Unidade Central",
    city: "São Paulo",
    state: "SP",
  },
};

const TEST_USERS = [
  {
    name: "Administrador",
    email: "admin@gymsaas.com",
    password: "Admin@123456",
    role: "ADMIN" as const,
  },
  {
    name: "Financeiro Teste",
    email: "financeiro@gymsaas.com",
    password: "Financeiro@123",
    role: "FINANCIAL" as const,
  },
  {
    name: "Personal Teste",
    email: "personal@gymsaas.com",
    password: "Personal@123",
    role: "PERSONAL_TRAINER" as const,
  },
  {
    name: "Recepção Teste",
    email: "recepcao@gymsaas.com",
    password: "Recepcao@123",
    role: "RECEPTIONIST" as const,
  },
];
// =============================================

// Instância mínima do Better Auth apenas para criar usuários
const auth = betterAuth({
  baseURL: "http://localhost:3001",
  database: prismaAdapter(prisma, { provider: "mysql" }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  user: {
    additionalFields: {
      role: { type: "string", required: false, fieldName: "role" },
      gymId: { type: "string", required: false, fieldName: "gymId" },
      groupId: { type: "string", required: false, fieldName: "groupId" },
    },
  },
});

async function createOrUpdateUser(
  name: string,
  email: string,
  password: string,
  role: string,
  groupId: string,
  gymId: string
) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role, groupId, gymId },
    });
    console.log(`   ⚠️  Já existe — role atualizado: ${email}`);
    return existing;
  }

  const result = await auth.api.signUpEmail({
    body: { name, email, password },
  });

  if (!result?.user?.id) {
    throw new Error(`Falha ao criar usuário: ${email}`);
  }

  await prisma.user.update({
    where: { id: result.user.id },
    data: { role, groupId, gymId },
  });

  return result.user;
}

async function main() {
  console.log("🌱 Iniciando seed...\n");

  // 1. Criar Grupo
  const existingGroup = await prisma.group.findUnique({
    where: { slug: CONFIG.group.slug },
  });

  const group = existingGroup ?? (await prisma.group.create({
    data: {
      name: CONFIG.group.name,
      slug: CONFIG.group.slug,
    },
  }));

  console.log(`✅ Grupo: ${group.name} (${group.id})`);

  // 2. Criar Academia
  const gymSlug = `${CONFIG.group.slug}-central`;
  const existingGym = await prisma.gym.findUnique({ where: { slug: gymSlug } });

  const gym = existingGym ?? (await prisma.gym.create({
    data: {
      name: CONFIG.gym.name,
      slug: gymSlug,
      city: CONFIG.gym.city,
      state: CONFIG.gym.state,
      groupId: group.id,
    },
  }));

  console.log(`✅ Academia: ${gym.name} (${gym.id})\n`);

  // 3. Criar usuários de teste por perfil
  console.log("👥 Criando usuários de teste:");

  for (const u of TEST_USERS) {
    await createOrUpdateUser(u.name, u.email, u.password, u.role, group.id, gym.id);
    console.log(`   ✅ [${u.role.padEnd(16)}] ${u.email} — senha: ${u.password}`);
  }

  console.log("\n🎉 Seed concluído!");
  console.log("   Acesse: http://localhost:3000/login\n");
  console.log("   Credenciais de teste:");
  for (const u of TEST_USERS) {
    console.log(`   ${u.role.padEnd(16)} → ${u.email} / ${u.password}`);
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error("❌ Erro no seed:", err.message ?? err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
