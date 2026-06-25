"use client";

import { useSession } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie sua conta e preferências</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Minha Conta</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nome</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">E-mail</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Integrações</h2>
        <div className="space-y-3">
          {[
            { name: "Asaas", description: "Gateway de pagamento (boleto, Pix, cartão)", status: "Configurar" },
            { name: "WhatsApp (Meta)", description: "Notificações via WhatsApp Business", status: "Configurar" },
            { name: "Resend", description: "E-mails transacionais", status: "Configurar" },
            { name: "Cloudinary", description: "Armazenamento de fotos e mídia", status: "Configurar" },
          ].map((integration) => (
            <div key={integration.name} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{integration.name}</p>
                <p className="text-xs text-gray-500">{integration.description}</p>
              </div>
              <button className="text-xs text-blue-600 hover:underline">
                {integration.status}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
