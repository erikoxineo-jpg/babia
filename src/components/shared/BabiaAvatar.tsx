"use client";

interface BabiaAvatarProps {
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
};

export function BabiaAvatar({ size = "md" }: BabiaAvatarProps) {
  return (
    <div
      className={`${sizeConfig[size]} rounded-full overflow-hidden shadow-lg shadow-primary-500/20 ring-2 ring-primary-200`}
    >
      <img
        src="/babiaperfil3.png"
        alt="BabIA"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
