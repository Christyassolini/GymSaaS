# 🏋️ GymSaaS

> Sistema SaaS completo para gestão de academias — controle financeiro, alunos, treinos e aulas em uma única plataforma.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Versão](https://img.shields.io/badge/versão-1.0.0-blue)
![Licença](https://img.shields.io/badge/licença-privado-red)

---

## 📋 Sobre o Projeto

O **GymSaaS** é uma plataforma SaaS voltada para a gestão completa de academias e redes de franquias. O sistema centraliza o controle de alunos, financeiro, treinos e agendamento de aulas, oferecendo diferentes níveis de acesso para cada perfil de usuário.

### Principais funcionalidades

- 🏢 **Multi-tenant** com suporte a redes de franquias
- 💰 **Gestão financeira** integrada com gateway de pagamento Asaas
- 📅 **Agendamento** de aulas individuais e em grupo
- 🏃 **Controle de treinos** com banco de exercícios reutilizável
- 🔔 **Notificações automáticas** via E-mail e WhatsApp
- 📊 **Dashboard financeiro** com exportação para Excel
- 🔐 **Controle de acesso** por perfis de usuário

---

## 🏗️ Arquitetura

O sistema adota um modelo **híbrido multi-tenant**, onde a hierarquia é organizada da seguinte forma:

```
Grupo / Franquia
├── Academia A
│   ├── Alunos
│   ├── Aulas
│   ├── Treinos
│   └── Financeiro
├── Academia B
└── Academia C
```

> O aluno pertence ao **Grupo/Franquia** e tem acesso a todas as academias vinculadas ao seu plano de assinatura.

---

## 👥 Perfis de Acesso

| Perfil | Permissões |
|---|---|
| **Administrador / Financeiro** | Acesso total, controle financeiro, relatórios e configurações |
| **Personal Trainer** | Montagem de treinos e agendamento de aulas |
| **Recepcionista** | Cadastro de alunos e agendamento (sem editar treinos) |
| **Aluno** *(v2)* | Portal do aluno — fora do escopo da v1 |

---

## 🛠️ Stack Tecnológica

### Frontend
| Tecnologia | Versão | Descrição |
|---|---|---|
| [Next.js](https://nextjs.org/) | 14+ | Framework React com App Router e SSR |
| [React](https://react.dev/) | 18+ | Biblioteca de interface de usuário |
| [Tailwind CSS](https://tailwindcss.com/) | 3+ | Estilização utilitária e responsividade |
| [shadcn/ui](https://ui.shadcn.com/) | latest | Componentes acessíveis baseados em Radix UI |

### Backend
| Tecnologia | Versão | Descrição |
|---|---|---|
| [Node.js](https://nodejs.org/) | 20+ | Runtime JavaScript |
| [Fastify](https://fastify.dev/) | 4+ | Framework HTTP de alta performance |
| [Prisma](https://www.prisma.io/) | latest | ORM para modelagem e acesso ao banco |
| [Better Auth](https://www.better-auth.com/) | latest | Autenticação com JWT, OAuth2 e 2FA |

### Banco de Dados e Infraestrutura
| Tecnologia | Descrição |
|---|---|
| [MySQL](https://www.mysql.com/) | Banco de dados relacional principal |
| [Cloudinary](https://cloudinary.com/) | Gestão de mídia e uploads |
| [Resend](https://resend.com/) | Envio transacional de e-mails |
| [Asaas](https://www.asaas.com/) | Gateway de pagamento (boleto, Pix, cartão) |
| [Meta API Oficial](https://developers.facebook.com/docs/whatsapp) | Notificações via WhatsApp |
| [Vercel](https://vercel.com/) | Hospedagem do frontend |
| [Railway](https://railway.app/) | Hospedagem do backend e banco MySQL |

---

## 📁 Estrutura do Projeto

```
gymsaas/
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend Fastify
├── packages/
│   ├── database/     # Schema Prisma e migrations
│   ├── types/        # Tipos compartilhados TypeScript
│   └── utils/        # Utilitários compartilhados
├── docs/             # Documentação do projeto
└── README.md
```

---

## 🚀 Como rodar o projeto

### Pré-requisitos

- Node.js 20+
- MySQL 8+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/gymsaas.git

# Acesse a pasta do projeto
cd gymsaas

# Instale as dependências
npm install
```

### Configuração das variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

Preencha as variáveis no arquivo `.env`:

```env
# Banco de dados
DATABASE_URL="mysql://user:password@localhost:3306/gymsaas"

# Auth
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL=""

# Asaas
ASAAS_API_KEY=""
ASAAS_ENV="sandbox" # ou "production"

# Resend
RESEND_API_KEY=""

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# WhatsApp (Meta API)
WHATSAPP_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
```

### Rodando em desenvolvimento

```bash
# Rodar o frontend
cd apps/web
npm run dev

# Rodar o backend (em outro terminal)
cd apps/api
npm run dev

# Rodar as migrations do banco
cd packages/database
npx prisma migrate dev
```

---

## 📦 Funcionalidades por Módulo

### 💰 Financeiro
- Controle de mensalidades e vencimentos
- Geração automática de cobranças via Asaas
- Suporte a boleto, Pix e cartão de crédito
- Registro manual de pagamentos
- Fluxo de caixa por academia e por franquia
- Dashboard financeiro e exportação Excel

### 📅 Aulas
- Aulas individuais com controle de presença
- Aulas em grupo com limite de vagas por modalidade
- Agendamento por recepcionista ou personal trainer

### 🏃 Treinos
- Banco de exercícios reutilizável
- Montagem de treinos com séries e repetições
- Histórico de treinos por aluno

### 🔔 Notificações
- Alertas de vencimento de mensalidade
- Lembretes de aula agendada
- Comunicados gerais da academia
- Canais: E-mail (Resend) e WhatsApp (Meta API Oficial)

---

## 🗺️ Roadmap

### v1.0 — Em desenvolvimento
- [x] Definição da arquitetura e stack
- [ ] Modelagem do banco de dados
- [ ] Autenticação e controle de acesso
- [ ] Módulo de cadastro de alunos
- [ ] Módulo financeiro com Asaas
- [ ] Módulo de aulas e agendamento
- [ ] Módulo de treinos
- [ ] Notificações por e-mail e WhatsApp
- [ ] Dashboard e exportação Excel

### v2.0 — Planejado
- [ ] Portal do aluno
- [ ] Aplicativo mobile
- [ ] Notificações em tempo real
- [ ] Integração com catracas e equipamentos
- [ ] Relatórios avançados de evolução física

---

## 📄 Licença

Este projeto é **privado e confidencial**. Todos os direitos reservados.

---

<div align="center">
  Desenvolvido com 💙
</div>