"use client";

import { Menu, LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";

interface TopBarProps {
  tenantName: string;
  userName: string;
  onMenuClick: () => void;
  logoUrl?: string | null;
}

export function TopBar({ tenantName, userName, onMenuClick, logoUrl }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 h-14 lg:h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md"
        >
          <Menu size={20} />
        </button>
        <img src="/babiaperfil3.png" alt="BabIA" className="w-8 h-8 rounded-full object-cover" />
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{tenantName}</h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={theme === "dark" ? "Modo claro" : "Modo escuro"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
          <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
            {userName}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md transition-colors"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
