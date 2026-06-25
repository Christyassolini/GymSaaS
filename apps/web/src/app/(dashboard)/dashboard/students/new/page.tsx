"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Step = 1 | 2;

interface Step1Data {
  name: string;
  cpf: string;
  birthDate: string;
  phone: string;
  email: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Step2Data {
  height: string;
  weight: string;
  injuries: string;
  restrictions: string;
  medicalNotes: string;
}

const initialStep1: Step1Data = {
  name: "", cpf: "", birthDate: "", phone: "", email: "",
  street: "", number: "", complement: "", district: "",
  city: "", state: "", zipCode: "",
};

const initialStep2: Step2Data = {
  height: "", weight: "", injuries: "", restrictions: "", medicalNotes: "",
};

export default function NewStudentPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [step1, setStep1] = useState<Step1Data>(initialStep1);
  const [step2, setStep2] = useState<Step2Data>(initialStep2);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cpfClean = step1.cpf.replace(/\D/g, "");
      const res = await api.post("/api/students", {
        ...step1,
        cpf: cpfClean,
        birthDate: new Date(step1.birthDate).toISOString(),
      });
      setStudentId(res.data.id);
      setStep(2);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message ?? "Erro ao cadastrar aluno.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.patch(`/api/students/${studentId}/profile`, {
        height: step2.height ? Number(step2.height) : undefined,
        weight: step2.weight ? Number(step2.weight) : undefined,
        injuries: step2.injuries || undefined,
        restrictions: step2.restrictions || undefined,
        medicalNotes: step2.medicalNotes || undefined,
      });
      router.push(`/dashboard/students/${studentId}`);
    } catch {
      setError("Erro ao salvar informações adicionais.");
    } finally {
      setLoading(false);
    }
  }

  function handleSkipStep2() {
    router.push(`/dashboard/students/${studentId}`);
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Novo Aluno</h1>
        <div className="flex items-center gap-2 mt-3">
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 1 ? "text-blue-600" : "text-green-600"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step === 1 ? "bg-blue-600" : "bg-green-500"}`}>
              {step === 1 ? "1" : "✓"}
            </span>
            Dados Pessoais
          </div>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? "text-blue-600" : "text-gray-400"}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step === 2 ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}>
              2
            </span>
            Informações Adicionais
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Nome completo *</label>
              <input className={inputClass} value={step1.name} onChange={(e) => setStep1({ ...step1, name: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>CPF *</label>
              <input className={inputClass} value={step1.cpf} onChange={(e) => setStep1({ ...step1, cpf: e.target.value })} placeholder="000.000.000-00" required />
            </div>
            <div>
              <label className={labelClass}>Data de nascimento *</label>
              <input type="date" className={inputClass} value={step1.birthDate} onChange={(e) => setStep1({ ...step1, birthDate: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Telefone *</label>
              <input className={inputClass} value={step1.phone} onChange={(e) => setStep1({ ...step1, phone: e.target.value })} placeholder="(11) 99999-9999" required />
            </div>
            <div>
              <label className={labelClass}>E-mail</label>
              <input type="email" className={inputClass} value={step1.email} onChange={(e) => setStep1({ ...step1, email: e.target.value })} />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Endereço</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Rua</label>
                <input className={inputClass} value={step1.street} onChange={(e) => setStep1({ ...step1, street: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Número</label>
                <input className={inputClass} value={step1.number} onChange={(e) => setStep1({ ...step1, number: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Complemento</label>
                <input className={inputClass} value={step1.complement} onChange={(e) => setStep1({ ...step1, complement: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Bairro</label>
                <input className={inputClass} value={step1.district} onChange={(e) => setStep1({ ...step1, district: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>CEP</label>
                <input className={inputClass} value={step1.zipCode} onChange={(e) => setStep1({ ...step1, zipCode: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Cidade</label>
                <input className={inputClass} value={step1.city} onChange={(e) => setStep1({ ...step1, city: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Estado</label>
                <input className={inputClass} value={step1.state} onChange={(e) => setStep1({ ...step1, state: e.target.value })} placeholder="SP" maxLength={2} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? "Salvando..." : "Próximo"}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Informações opcionais. Você pode preencher depois no perfil do aluno.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Altura (cm)</label>
              <input type="number" className={inputClass} value={step2.height} onChange={(e) => setStep2({ ...step2, height: e.target.value })} placeholder="170" />
            </div>
            <div>
              <label className={labelClass}>Peso (kg)</label>
              <input type="number" step="0.1" className={inputClass} value={step2.weight} onChange={(e) => setStep2({ ...step2, weight: e.target.value })} placeholder="70.5" />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Lesões</label>
              <textarea rows={2} className={inputClass} value={step2.injuries} onChange={(e) => setStep2({ ...step2, injuries: e.target.value })} placeholder="Descreva lesões existentes..." />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Restrições físicas</label>
              <textarea rows={2} className={inputClass} value={step2.restrictions} onChange={(e) => setStep2({ ...step2, restrictions: e.target.value })} placeholder="Atividades que devem ser evitadas..." />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Observações médicas</label>
              <textarea rows={2} className={inputClass} value={step2.medicalNotes} onChange={(e) => setStep2({ ...step2, medicalNotes: e.target.value })} placeholder="Condições de saúde relevantes..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleSkipStep2} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              Pular
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? "Salvando..." : "Concluir Cadastro"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
