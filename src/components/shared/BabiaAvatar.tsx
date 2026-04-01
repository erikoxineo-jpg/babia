"use client";

import { Sparkles } from "lucide-react";

interface BabiaAvatarProps {
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { container: "w-10 h-10", icon: 14, text: "text-sm" },
  md: { container: "w-16 h-16", icon: 22, text: "text-xl" },
  lg: { container: "w-24 h-24", icon: 32, text: "text-3xl" },
};

export function BabiaAvatar({ size = "md" }: BabiaAvatarProps) {
  const cfg = sizeConfig[size];

  return (
    <div
      className={`${cfg.container} rounded-full bg-gradient-to-br from-secondary-400 to-primary-500 flex items-center justify-center relative shadow-lg shadow-primary-500/20`}
    >
      <span className={`${cfg.text} font-bold text-white`}>B</span>
      <div className="absolute -top-0.5 -right-0.5">
        <Sparkles size={cfg.icon * 0.5} className="text-secondary-300" />
      </div>
    </div>
  );
}
