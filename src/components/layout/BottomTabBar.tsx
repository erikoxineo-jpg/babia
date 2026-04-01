"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  MoreHorizontal,
  UserCheck,
  CreditCard,
  DollarSign,
  Megaphone,
  Settings,
  X,
} from "lucide-react";
import { NAV_PERMISSIONS } from "@/lib/rbac";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicos", label: "Serviços", icon: Scissors },
];

const MORE_ITEMS = [
  { href: "/equipe", label: "Equipe", icon: UserCheck },
  { href: "/planos", label: "Planos", icon: CreditCard },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/campanhas", label: "Campanhas", icon: Megaphone },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMore, setShowMore] = useState(false);

  const user = session?.user as Record<string, unknown> | undefined;
  const role = user?.role as string | undefined;

  function hasPermission(href: string) {
    const allowed = NAV_PERMISSIONS[href];
    if (!allowed || !role) return true;
    return allowed.includes(role as "owner" | "admin" | "professional" | "receptionist");
  }

  const visibleTabs = TABS.filter((t) => hasPermission(t.href));
  const visibleMore = MORE_ITEMS.filter((t) => hasPermission(t.href));
  const isMoreActive = MORE_ITEMS.some((item) => pathname === item.href);

  return (
    <>
      {/* Bottom sheet overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowMore(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 pb-safe animate-slide-up">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h3 className="text-sm font-semibold text-gray-800">Mais opções</h3>
              <button
                onClick={() => setShowMore(false)}
                className="w-8 h-8 rounded-2xl flex items-center justify-center text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-3 pb-4 space-y-0.5">
              {visibleMore.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-500 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-up h-[72px] lg:hidden pb-safe">
        <div className="flex items-center justify-around h-full px-2">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 ${
                  isActive ? "text-primary-500" : "text-gray-400"
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            );
          })}
          {visibleMore.length > 0 && (
            <button
              onClick={() => setShowMore(true)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 ${
                isMoreActive ? "text-primary-500" : "text-gray-400"
              }`}
            >
              <MoreHorizontal size={22} />
              <span className="text-[10px] font-medium">Mais</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
