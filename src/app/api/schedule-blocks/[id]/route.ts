import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/rbac";

// DELETE — remover bloqueio de horário (owner, admin, professional)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["owner", "admin", "professional"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;
  const { id } = await params;

  try {
    // Buscar bloqueio e verificar que pertence ao tenant
    const block = await prisma.scheduleBlock.findFirst({
      where: { id },
      include: {
        professional: { select: { tenantId: true } },
      },
    });

    if (!block || block.professional.tenantId !== tenantId) {
      return NextResponse.json(
        { error: "Bloqueio não encontrado." },
        { status: 404 }
      );
    }

    // Remoção física
    await prisma.scheduleBlock.delete({ where: { id } });

    return NextResponse.json({ message: "Bloqueio removido com sucesso." });
  } catch (error) {
    console.error("Delete schedule block error:", error);
    return NextResponse.json(
      { error: "Erro ao remover bloqueio." },
      { status: 500 }
    );
  }
}
