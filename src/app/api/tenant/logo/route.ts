import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join, resolve, sep } from "path";
import { existsSync } from "fs";
import { randomBytes } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const UPLOADS_DIR = join(process.cwd(), "uploads", "logos");

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
        const oldPath = tenant.logoUrl.replace("/api/uploads/", "");
        const oldFile = join(process.cwd(), "uploads", oldPath);
        if (existsSync(oldFile)) await unlink(oldFile);
      } catch {
        // Ignora erro ao deletar arquivo anterior
      }
    }

    // Garantir que diretório existe
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true });
    }

    // Validar extensão contra whitelist
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Extensão inválida. Use jpg, jpeg, png ou webp." },
        { status: 422 }
      );
    }

    // Salvar arquivo com nome seguro
    const suffix = randomBytes(6).toString("hex");
    const filename = `${tenantId}-${suffix}.${ext}`;
    const filepath = resolve(UPLOADS_DIR, filename);

    // Path traversal check: garantir que o arquivo está dentro do diretório esperado
    if (!filepath.startsWith(resolve(UPLOADS_DIR) + sep)) {
      return NextResponse.json(
        { error: "Caminho de arquivo inválido." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const logoUrl = `/api/uploads/logos/${filename}`;

    // Atualizar no banco
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl },
    });

    return NextResponse.json({
      success: true,
      data: { logoUrl },
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
        const oldPath = tenant.logoUrl.replace("/api/uploads/", "");
        const oldFile = join(process.cwd(), "uploads", oldPath);
        if (existsSync(oldFile)) await unlink(oldFile);
      } catch {
        // Ignora erro ao deletar arquivo
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
