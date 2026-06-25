// Asaas — Gateway de Pagamento
// Docs: https://docs.asaas.com

const ASAAS_BASE_URL =
  process.env.ASAAS_ENVIRONMENT === "production"
    ? "https://api.asaas.com/v3"
    : "https://sandbox.asaas.com/api/v3";

const API_KEY = process.env.ASAAS_API_KEY!;

async function asaasRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`${ASAAS_BASE_URL}${path}`, {
    method,
    headers: {
      "access_token": API_KEY,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Asaas error ${response.status}: ${JSON.stringify(error)}`);
  }

  return response.json() as Promise<T>;
}

// Cria ou recupera um cliente no Asaas
export async function getOrCreateAsaasCustomer(student: {
  id: string;
  name: string;
  email: string | null;
  cpf: string;
  phone: string;
}) {
  // Tenta buscar por CPF
  const existing = await asaasRequest<{ data: Array<{ id: string }> }>(
    "GET",
    `/customers?cpfCnpj=${student.cpf}`
  );

  if (existing.data.length > 0) {
    return existing.data[0];
  }

  // Cria novo cliente
  return asaasRequest<{ id: string }>("POST", "/customers", {
    name: student.name,
    email: student.email,
    cpfCnpj: student.cpf,
    mobilePhone: student.phone,
    externalReference: student.id,
  });
}

export interface AsaasPaymentInput {
  customerId: string;
  billingType: "BOLETO" | "PIX" | "CREDIT_CARD";
  value: number;
  dueDate: string; // YYYY-MM-DD
  description: string;
}

export interface AsaasPaymentResult {
  id: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  pixQrCodeId?: string;
}

// Cria cobrança no Asaas
export async function createAsaasPayment(data: AsaasPaymentInput): Promise<AsaasPaymentResult> {
  const payment = await asaasRequest<{
    id: string;
    invoiceUrl: string;
    bankSlipUrl?: string;
    pixQrCodeId?: string;
  }>("POST", "/payments", {
    customer: data.customerId,
    billingType: data.billingType,
    value: data.value,
    dueDate: data.dueDate,
    description: data.description,
  });

  return payment;
}

// Obtém QR Code Pix
export async function getPixQrCode(paymentId: string) {
  return asaasRequest<{ encodedImage: string; payload: string }>(
    "GET",
    `/payments/${paymentId}/pixQrCode`
  );
}

// Webhook — valida e processa evento do Asaas
export type AsaasWebhookEvent =
  | "PAYMENT_CREATED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_CONFIRMED"
  | "PAYMENT_OVERDUE"
  | "PAYMENT_DELETED"
  | "PAYMENT_REFUNDED";

export interface AsaasWebhookPayload {
  event: AsaasWebhookEvent;
  payment: {
    id: string;
    status: string;
    value: number;
    billingType: string;
    externalReference?: string;
  };
}
