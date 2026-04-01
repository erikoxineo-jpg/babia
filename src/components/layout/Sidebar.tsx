"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UserCheck,
  DollarSign,
  Megaphone,
  CreditCard,
  Settings,
  X,
  Home,
} from "lucide-react";
import { NAV_PERMISSIONS } from "@/lib/rbac";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicos", label: "Serviços", icon: Scissors },
  { href: "/equipe", label: "Equipe", icon: UserCheck },
  { href: "/planos", label: "Planos", icon: CreditCard },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const role = user?.role as string | undefined;
  const viewMode = user?.viewMode as string | undefined;

  const visibleItems = navItems.filter((item) => {
    const allowed = NAV_PERMISSIONS[item.href];
    if (!allowed || !role) return true;
    return allowed.includes(role as "owner" | "admin" | "professional" | "receptionist");
  });

  const nav = (
    <nav className="flex flex-col gap-1 px-3 py-4">
      <div className="px-3 mb-6">
        <h1 className="text-xl font-bold text-white">
          Bab<span className="text-secondary-400">IA</span>
        </h1>
      </div>
      {viewMode === "solo" && (
        <Link
          key="solo-home"
          href="/"
          onClick={onClose}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-md text-sm
            transition-colors duration-150 ease-in-out
            ${
              pathname === "/"
                ? "bg-primary-800 text-white font-semibold"
                : "text-gray-300 hover:bg-primary-800 hover:text-white"
            }
          `}
        >
          <Home size={20} />
          <span>Início</span>
        </Link>
      )}
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-md text-sm
              transition-colors duration-150 ease-in-out
              ${
                isActive
                  ? "bg-primary-800 text-white font-semibold"
                  : "text-gray-300 hover:bg-primary-800 hover:text-white"
              }
            `}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-sidebar lg:fixed lg:inset-y-0 bg-primary-900">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 w-sidebar bg-primary-900 z-50">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-300 hover:text-white"
            >
              <X size={20} />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
