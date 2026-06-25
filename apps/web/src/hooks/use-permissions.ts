"use client";

import { useSession } from "@/lib/auth-client";
import { UserRole } from "@gymsaas/types";

type ExtendedUser = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  gymId?: string | null;
  groupId?: string | null;
};

export function usePermissions() {
  const { data: session, isPending } = useSession();
  const user = session?.user as unknown as ExtendedUser | undefined;
  const role = (user?.role as UserRole) ?? UserRole.RECEPTIONIST;

  return {
    role,
    user,
    isPending,
    isAdmin: role === UserRole.ADMIN,
    isFinancial: role === UserRole.ADMIN || role === UserRole.FINANCIAL,
    isPersonalTrainer: role === UserRole.PERSONAL_TRAINER,
    isReceptionist: role === UserRole.RECEPTIONIST,
    /** Retorna true se o usuário tem pelo menos um dos roles permitidos */
    can: (allowedRoles: UserRole[]) => allowedRoles.includes(role),
  };
}
