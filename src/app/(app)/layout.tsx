"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";

function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tenantLogoUrl, setTenantLogoUrl] = useState<string | null>(null);

  const user = session?.user as Record<string, unknown> | undefined;
  const needsOnboarding = status === "authenticated" && user?.role === "owner" && user?.onboardingCompleted === false;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/tenant")
        .then((r) => r.json())
        .then((json) => {
          if (json.success) setTenantLogoUrl(json.data.logoUrl ?? null);
        })
        .catch(() => {});
    }
  }, [status, pathname]);

  useEffect(() => {
    if (needsOnboarding) {
      const step = (user?.onboardingStep as number) || 0;
      const paths = [
        "/onboarding/barbearia",
        "/onboarding/barbearia",
        "/onboarding/horarios",
        "/onboarding/servicos",
        "/onboarding/equipe",
      ];
      router.push(paths[step] || "/onboarding/barbearia");
    }
  }, [needsOnboarding, user?.onboardingStep, router]);

  if (status === "loading" || status === "unauthenticated" || needsOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} logoUrl={tenantLogoUrl} />
      <div className="lg:pl-[256px]">
        <TopBar
          tenantName={(user?.tenantName as string) ?? "BabIA"}
          userName={user?.name as string ?? "Usuário"}
          onMenuClick={() => setSidebarOpen(true)}
          logoUrl={tenantLogoUrl}
        />
        <main className="p-5 lg:p-6 pb-[72px] lg:pb-6">{children}</main>
      </div>
      <BottomTabBar />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppShell>{children}</AppShell>
    </SessionProvider>
  );
}
