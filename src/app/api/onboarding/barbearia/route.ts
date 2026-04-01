import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  try {
    const body = await request.json();
    const { name, phone, whatsapp, address, city, state, slug, logoUrl } = body;

    if (!name || !phone || !whatsapp || !slug) {
      return NextResponse.json(
        { error: "Nome, telefone, WhatsApp e slug são obrigatórios." },
        { status: 422 }
      );
    }

    const existingSlug = await prisma.tenant.findFirst({
      where: { slug, id: { not: tenantId } },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Este link já está em uso." },
        { status: 409 }
      );
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name,
        phone,
        whatsapp: whatsapp || null,
        address: address || null,
        city: city || null,
        state: state || null,
        slug,
        logoUrl: logoUrl || null,
        onboardingStep: { set: Math.max(1, (await prisma.tenant.findUnique({ where: { id: tenantId } }))!.onboardingStep) },
      },
    });

    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    console.error("Onboarding barbearia error:", error);
    return NextResponse.json(
      { error: "Erro ao salvar dados." },
      { status: 500 }
    );
  }
}
