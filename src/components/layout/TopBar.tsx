"use client";

import { Menu, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface TopBarProps {
  tenantName: string;
  userName: string;
  onMenuClick: () => void;
  logoUrl?: string | null;
}

export function TopBar({ tenantName, userName, onMenuClick, logoUrl }: TopBarProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-md"
        >
          <Menu size={20} />
        </button>
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
        )}
        <h2 className="text-sm font-semibold text-gray-800">{tenantName}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
          <span className="hidden sm:block text-sm text-gray-700">
            {userName}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
