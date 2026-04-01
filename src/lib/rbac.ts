import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

type Role = "owner" | "admin" | "professional" | "receptionist";

interface AuthResult {
  user: {
    id: string;
    role: Role;
    tenantId: string;
    name: string;
  };
}

/**
 * Verify authentication and role-based access.
 * Returns user data or a NextResponse error.
 */
export async function requireAuth(
  allowedRoles?: Role[]
): Promise<AuthResult | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const u = session.user as Record<string, unknown>;
  const role = u.role as Role;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Sem permissão para esta ação." }, { status: 403 });
  }

  return {
    user: {
      id: u.id as string,
      role,
      tenantId: u.tenantId as string,
      name: u.name as string,
    },
  };
}

export function isErrorResponse(result: AuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}

/**
 * Role permissions for sidebar navigation
 */
export const NAV_PERMISSIONS: Record<string, Role[]> = {
  "/": ["owner", "admin", "professional", "receptionist"],
  "/agenda": ["owner", "admin", "professional", "receptionist"],
  "/clientes": ["owner", "admin", "receptionist"],
  "/servicos": ["owner", "admin"],
  "/equipe": ["owner", "admin"],
  "/planos": ["owner", "admin"],
  "/financeiro": ["owner"],
  "/campanhas": ["owner", "admin"],
  "/configuracoes": ["owner"],
};
