"use client";

import { useSession } from "next-auth/react";
import { SoloHome } from "@/components/solo/SoloHome";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  const viewMode = (session?.user as Record<string, unknown> | undefined)?.viewMode as string | undefined;

  if (viewMode === "solo") {
    return <SoloHome />;
  }

  return <DashboardContent />;
}
