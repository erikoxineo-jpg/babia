import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/onboarding";
import { registerLimiter, checkRateLimit } from "@/lib/rate-limit";
import { fireWebhook } from "@/lib/n8n";

export async function POST(request: Request) {
  // Rate limit: 5 registros por hora por IP
  const rateLimitResponse = checkRateLimit(request, registerLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { name, email, phone, password, barbershopName } = body;

    if (!name || !email || !phone || !password || !barbershopName) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 422 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado." },
        { status: 409 }
      );
    }

    let slug = slugify(barbershopName);
    const existingSlug = await prisma.tenant.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: barbershopName,
          slug,
          phone,
          email,
        },
      });

      await tx.tenantSettings.create({
        data: { tenantId: tenant.id },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name,
          email,
          phone,
          passwordHash,
          role: "owner",
        },
      });

      const professional = await tx.professional.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          name,
          phone,
          displayOrder: 0,
        },
      });

      return { user, tenant, professional };
    });

    // Fire-and-forget: boas-vindas ao novo proprietário
    fireWebhook("user.registered", {
      ownerName: result.user.name,
      ownerPhone: result.tenant.phone,
      tenantName: result.tenant.name,
      slug: result.tenant.slug,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
        },
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
