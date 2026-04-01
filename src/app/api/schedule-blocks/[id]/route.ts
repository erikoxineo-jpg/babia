import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE — remover bloqueio de horário
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
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
