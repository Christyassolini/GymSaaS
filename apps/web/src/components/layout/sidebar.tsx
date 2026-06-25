"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  Dumbbell,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { usePermissions } from "@/hooks/use-permissions";
import { UserRole } from "@gymsaas/types";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: [UserRole.ADMIN, UserRole.FINANCIAL, UserRole.PERSONAL_TRAINER, UserRole.RECEPTIONIST],
  },
  {
    label: "Alunos",
    href: "/dashboard/students",
    icon: Users,
    allowedRoles: [UserRole.ADMIN, UserRole.FINANCIAL, UserRole.PERSONAL_TRAINER, UserRole.RECEPTIONIST],
  },
  {
    label: "Financeiro",
    href: "/dashboard/payments",
    icon: CreditCard,
    allowedRoles: [UserRole.ADMIN, UserRole.FINANCIAL],
  },
  {
    label: "Aulas",
    href: "/dashboard/classes",
    icon: Calendar,
    allowedRoles: [UserRole.ADMIN, UserRole.FINANCIAL, UserRole.PERSONAL_TRAINER, UserRole.RECEPTIONIST],
  },
  {
    label: "Treinos",
    href: "/dashboard/workouts",
    icon: Dumbbell,
    allowedRoles: [UserRole.ADMIN, UserRole.PERSONAL_TRAINER],
  },
  {
    label: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
    allowedRoles: [UserRole.ADMIN, UserRole.FINANCIAL, UserRole.RECEPTIONIST],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = usePermissions();

  const visibleItems = navItems.filter((item) => item.allowedRoles.includes(role));

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Dumbbell className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">GymSaaS</span>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Logout */}
      <div className="px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
