"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Calendar, Users, MapPin } from "lucide-react";

interface GymClass {
  id: string;
  name: string;
  type: "INDIVIDUAL" | "GROUP";
  description: string | null;
  maxStudents: number | null;
  scheduledAt: string;
  durationMin: number;
  location: string | null;
  cancelled: boolean;
  trainer: { id: string; name: string } | null;
  _count: { enrollments: number };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + 7);

    api.get("/api/classes", {
      params: {
        from: from.toISOString(),
        to: to.toISOString(),
      },
    })
      .then((res) => setClasses(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aulas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Próximos 7 dias</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Calendar className="w-4 h-4" />
          Nova Aula
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Calendar className="w-8 h-8 mb-2 opacity-30" />
          <p>Nenhuma aula agendada para os próximos 7 dias.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((gymClass) => {
            const date = new Date(gymClass.scheduledAt);
            const spotsLeft = gymClass.maxStudents
              ? gymClass.maxStudents - gymClass._count.enrollments
              : null;

            return (
              <div
                key={gymClass.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
                  <p className="text-lg font-bold leading-none">{date.getDate()}</p>
                  <p className="text-xs">
                    {date.toLocaleString("pt-BR", { month: "short" }).toUpperCase()}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {gymClass.name}
                    </h3>
                    <span className={`shrink-0 inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${
                      gymClass.type === "GROUP"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {gymClass.type === "GROUP" ? "Grupo" : "Individual"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {gymClass.durationMin}min</span>
                    {gymClass.trainer && <span>Prof. {gymClass.trainer.name}</span>}
                    {gymClass.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {gymClass.location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{gymClass._count.enrollments}</span>
                    {gymClass.maxStudents && <span>/ {gymClass.maxStudents}</span>}
                  </div>
                  {spotsLeft !== null && (
                    <p className={`text-xs mt-0.5 ${spotsLeft === 0 ? "text-red-500" : "text-green-500"}`}>
                      {spotsLeft === 0 ? "Sem vagas" : `${spotsLeft} vagas`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
