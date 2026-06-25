"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: string;
  method: string | null;
  description: string | null;
  student: { id: string; name: string; cpf: string };
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  PAID: { label: "Pago", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  OVERDUE: { label: "Em Atraso", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  CANCELLED: { label: "Cancelado", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<{ data: Payment[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get("/api/payments", { params: { page, limit: 25, status: filterStatus || undefined } })
      .then((res) => setPayments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filterStatus]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  async function handleMarkPaid(payment: Payment) {
    try {
      await api.patch(`/api/payments/${payment.id}/pay`, { method: "CASH" });
      setPayments((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((p) =>
                p.id === payment.id ? { ...p, status: "PAID", paidAt: new Date().toISOString(), method: "CASH" } : p
              ),
            }
          : null
      );
    } catch {
      alert("Erro ao registrar pagamento.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiro</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Controle de mensalidades e pagamentos</p>
      </div>

      <div className="flex gap-2">
        {["", "PENDING", "PAID", "OVERDUE"].map((status) => (
          <button
            key={status}
            onClick={() => { setFilterStatus(status); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filterStatus === status
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {status === "" ? "Todos" : statusLabels[status]?.label ?? status}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aluno</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vencimento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {payments?.data.map((payment) => {
                const statusInfo = statusLabels[payment.status] ?? { label: payment.status, color: "" };
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{payment.student.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {payment.description ?? "Mensalidade"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(payment.status === "PENDING" || payment.status === "OVERDUE") && (
                        <button
                          onClick={() => handleMarkPaid(payment)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Registrar pagamento
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
