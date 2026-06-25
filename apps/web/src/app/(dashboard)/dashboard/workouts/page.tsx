"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Dumbbell, Plus } from "lucide-react";

interface Workout {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  student: { id: string; name: string };
  createdBy: { id: string; name: string };
  items: Array<{ id: string; exercise: { name: string }; sets: number; reps: string }>;
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/workouts")
      .then((res) => setWorkouts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Treinos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Treinos ativos dos alunos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Novo Treino
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-500">Carregando...</p>
        </div>
      ) : workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Dumbbell className="w-8 h-8 mb-2 opacity-30" />
          <p>Nenhum treino cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/dashboard/workouts/${workout.id}`}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{workout.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Aluno: {workout.student.name}</p>
              {workout.description && (
                <p className="text-xs text-gray-400 mt-1 truncate">{workout.description}</p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">{workout.items.length} exercício(s)</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {workout.items.slice(0, 3).map((item) => (
                    <span key={item.id} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                      {item.exercise.name}
                    </span>
                  ))}
                  {workout.items.length > 3 && (
                    <span className="text-xs text-gray-400">+{workout.items.length - 3}</span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">Prof: {workout.createdBy.name}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
