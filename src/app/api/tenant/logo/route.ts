import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put, del } from "@vercel/blob";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

// POST — upload de logo
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
  const role = user.role as string;

  if (role !== "owner") {
    return NextResponse.json(
      { error: "Apenas o dono pode alterar a logo." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 422 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG ou WebP." },
        { status: 422 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 2 MB." },
        { status: 422 }
      );
    }

    // Deletar logo anterior se existir
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { logoUrl: true },
    });

    if (tenant?.logoUrl) {
      try {
        await del(tenant.logoUrl);
      } catch {
        // Ignora erro ao deletar blob anterior (pode já não existir)
      }
    }

    // Upload para Vercel Blob
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `logos/${tenantId}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Atualizar no banco
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl: blob.url },
    });

    return NextResponse.json({
      success: true,
      data: { logoUrl: blob.url },
    });
  } catch (error) {
    console.error("Upload logo error:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload da logo." },
      { status: 500 }
    );
  }
}

// DELETE — remover logo
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
  const role = user.role as string;

  if (role !== "owner") {
    return NextResponse.json(
      { error: "Apenas o dono pode remover a logo." },
      { status: 403 }
    );
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { logoUrl: true },
    });

    if (tenant?.logoUrl) {
      try {
        await del(tenant.logoUrl);
      } catch {
        // Ignora erro ao deletar blob (pode já não existir)
      }
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete logo error:", error);
    return NextResponse.json(
      { error: "Erro ao remover a logo." },
      { status: 500 }
    );
  }
}
