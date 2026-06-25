# 🏋️ GymSaaS — Prompt de Desenvolvimento

## Contexto Geral

Você é um engenheiro de software sênior especializado em arquiteturas SaaS escaláveis. Vamos desenvolver juntos o **GymSaaS**, um sistema completo de gestão para academias e redes de franquias.

O repositório já está criado e contém apenas o `README.md`. Vamos construir o projeto do zero, de forma organizada, etapa por etapa.

---

## Regra Principal — Muito Importante

**Nunca execute comandos no terminal por conta própria.**

Toda vez que for necessário rodar qualquer comando no console (instalação de dependências, migrations, configurações, etc.), você deve:

1. Parar o desenvolvimento
2. Me mostrar exatamente o comando que precisa ser rodado
3. Explicar brevemente o que aquele comando faz
4. Aguardar eu responder que já executei
5. Só então continuar o desenvolvimento

**Exemplo do formato esperado:**

> ⚙️ **Comando necessário:**
> ```bash
> npm install
> ```
> Esse comando instala todas as dependências listadas no `package.json`. Execute-o na raiz do projeto e me avise quando terminar.

---

## Regra de Ferramentas Externas

Sempre que o projeto precisar de alguma ferramenta externa instalada na máquina (como MySQL, Node.js, etc.) ou de alguma configuração em serviços externos (como criar uma conta no Asaas, configurar a Meta API, etc.), você deve:

1. Me notificar claramente sobre o que precisa ser feito
2. Me dar instruções de como fazer, se necessário
3. Aguardar minha confirmação antes de continuar

**Exemplo do formato esperado:**

> 🔧 **Ferramenta externa necessária: MySQL**
> Você precisa ter o MySQL 8+ instalado e rodando na sua máquina. Caso ainda não tenha, acesse https://dev.mysql.com/downloads/ e instale. Depois crie um banco de dados chamado `gymsaas` e me informe as credenciais (usuário e senha) para configurarmos o `.env`. Me avise quando estiver pronto.

---

## Regra de Confirmação

Toda vez que eu responder algo como:
- "Feito"
- "Pronto"
- "Já executei"
- "Ok, concluído"
- Ou qualquer variação indicando que completei o que foi pedido

Você deve continuar o desenvolvimento normalmente a partir do ponto onde parou, sem precisar repetir o que já foi explicado.

---

## Sobre o Projeto

### Descrição
O GymSaaS é uma plataforma SaaS para gestão completa de academias, com suporte a redes de franquias. Ele centraliza controle de alunos, financeiro, treinos e agendamento de aulas.

### Arquitetura Multi-Tenant
O sistema adota um modelo híbrido onde existe uma camada de Grupo/Franquia acima das academias. O aluno pertence ao grupo e tem acesso às academias vinculadas ao seu plano.

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

### Perfis de Acesso
- **Administrador / Financeiro** — acesso total ao sistema
- **Personal Trainer** — treinos e agendamento de aulas
- **Recepcionista** — cadastro de alunos e agendamento (sem editar treinos)
- **Aluno** — fora do escopo da v1, será implementado na v2

---

## Stack Tecnológica

### Frontend
- Next.js 14+ (App Router, SSR, RSC)
- React 18+
- Tailwind CSS 3+
- shadcn/ui

### Backend
- Node.js 20+
- Fastify 4+
- Prisma ORM (latest)
- Better Auth (latest)

### Banco de Dados e Serviços
- MySQL 8+
- Cloudinary (mídia e uploads)
- Resend (e-mails transacionais)
- Asaas (gateway de pagamento — boleto, Pix, cartão)
- Meta API Oficial (notificações WhatsApp)
- Vercel (hospedagem frontend)
- Railway (hospedagem backend e MySQL)

---

## Estrutura de Pastas do Projeto

Organize o projeto como um **monorepo** com a seguinte estrutura:

```
gymsaas/
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend Fastify
├── packages/
│   ├── database/     # Schema Prisma e migrations
│   ├── types/        # Tipos TypeScript compartilhados
│   └── utils/        # Utilitários compartilhados
├── docs/
├── .env.example
├── .gitignore
├── package.json      # Root package.json do monorepo
└── README.md
```

---

## Funcionalidades da Versão 1

### Cadastro de Alunos
- Etapa 1 obrigatória: nome, CPF, data de nascimento, telefone, e-mail, endereço
- Etapa 2 opcional: altura, peso, lesões, restrições físicas, observações médicas, foto

### Planos e Assinaturas
- Planos cadastráveis por academia (mensal, trimestral, anual, etc.)
- Valores personalizados por unidade
- Controle de vigência e renovação

### Financeiro
- Controle de mensalidades e vencimentos
- Integração com Asaas (boleto, Pix, cartão)
- Registro manual de pagamentos (maquininha, dinheiro)
- Fluxo de caixa por academia e por franquia
- Notificações automáticas de vencimento
- Dashboard financeiro + exportação Excel

### Aulas
- Aulas individuais (acesso livre aos aparelhos)
- Aulas em grupo com limite de vagas por modalidade definido pelo professor
- Agendamento por recepcionista ou personal trainer
- Controle de presença

### Treinos
- Banco de exercícios reutilizável
- Montagem de treinos com exercícios, séries e repetições
- Vinculação do treino ao aluno
- Histórico de treinos por aluno

### Notificações
- E-mail via Resend
- WhatsApp via Meta API Oficial
- Canal configurável por academia
- Casos de uso: vencimento de mensalidade, lembretes de aula, comunicados

---

## Ordem de Desenvolvimento

Siga rigorosamente essa ordem:

1. **Configuração do monorepo** — estrutura de pastas, root package.json, workspaces
2. **Banco de dados** — schema completo no Prisma com todas as entidades e relacionamentos
3. **Autenticação** — configuração do Better Auth com os perfis de acesso
4. **Backend (Fastify)** — rotas, controllers e regras de negócio por módulo
5. **Frontend (Next.js)** — páginas e componentes consumindo a API
6. **Integrações externas** — Asaas, WhatsApp, Resend, Cloudinary

---

## Como Iniciar

Comece pela **etapa 1: configuração do monorepo**.

Explique o que vai ser feito, crie os arquivos necessários e, quando precisar de qualquer comando ou ferramenta externa, siga as regras descritas no início deste prompt.

Vamos começar!
