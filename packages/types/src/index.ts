// Enums
export enum UserRole {
  ADMIN = "ADMIN",
  FINANCIAL = "FINANCIAL",
  PERSONAL_TRAINER = "PERSONAL_TRAINER",
  RECEPTIONIST = "RECEPTIONIST",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  BOLETO = "BOLETO",
  PIX = "PIX",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  CASH = "CASH",
  MACHINE = "MACHINE",
}

export enum ClassType {
  INDIVIDUAL = "INDIVIDUAL",
  GROUP = "GROUP",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  CANCELLED = "CANCELLED",
}

// DTOs
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
