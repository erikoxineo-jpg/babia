"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Loader2 } from "lucide-react";

function OnboardingShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const user = session?.user as Record<string, unknown> | undefined;
  if (user?.onboardingCompleted) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Left branding panel — desktop only */}
        <div className="hidden lg:flex lg:w-[420px] bg-gray-900 flex-col justify-between p-10 sticky top-0 h-screen">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bab<span className="text-primary-400">IA</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Sua secretaria inteligente</p>
          </div>
          <div>
            <p className="text-white/90 text-lg font-semibold leading-relaxed">
              Configure seu negocio em poucos minutos e comece a receber agendamentos.
            </p>
            <p className="text-gray-500 text-sm mt-3">
              Preencha as informacoes ao lado. Voce pode ajustar tudo depois.
            </p>
          </div>
          <p className="text-gray-600 text-xs">
            BabIA &copy; {new Date().getFullYear()}
          </p>
        </div>

        {/* Right content panel */}
        <div className="flex-1 flex flex-col">
          {/* Mobile header */}
          <header className="lg:hidden bg-white border-b border-gray-100 px-5 py-3.5">
            <h1 className="text-lg font-bold text-gray-800">
              Bab<span className="text-primary-500">IA</span>
            </h1>
          </header>

          <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-6 lg:py-10 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OnboardingShell>{children}</OnboardingShell>
    </SessionProvider>
  );
}
