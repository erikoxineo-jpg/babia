import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — dados completos do tenant
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const [tenant, settings, stats] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.tenantSettings.findUnique({ where: { tenantId } }),
    Promise.all([
      prisma.professional.count({ where: { tenantId, isActive: true, deletedAt: null } }),
      prisma.client.count({ where: { tenantId, deletedAt: null } }),
      prisma.service.count({ where: { tenantId, isActive: true } }),
    ]),
  ]);

  if (!tenant) {
    return NextResponse.json({ error: "Tenant não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      phone: tenant.phone,
      whatsapp: tenant.whatsapp,
      email: tenant.email,
      address: tenant.address,
      city: tenant.city,
      state: tenant.state,
      logoUrl: tenant.logoUrl,
      settings: settings
        ? {
            bookingAdvanceDays: settings.bookingAdvanceDays,
            cancellationPolicyHours: settings.cancellationPolicyHours,
            confirmationEnabled: settings.confirmationEnabled,
            reminderHoursBefore: settings.reminderHoursBefore,
            inactiveDaysThreshold: settings.inactiveDaysThreshold,
            workingDays: settings.workingDays,
          }
        : null,
      stats: {
        totalProfessionals: stats[0],
        totalClients: stats[1],
        totalServices: stats[2],
      },
      createdAt: tenant.createdAt.toISOString(),
    },
  });
}

// PUT — atualizar dados básicos do tenant
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
  const role = user.role as string;

  if (role !== "owner") {
    return NextResponse.json({ error: "Apenas o dono pode alterar." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, phone, whatsapp, email, address, city, state } = body as {
      name?: string;
      phone?: string;
      whatsapp?: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
    };

    if (name !== undefined && (name.trim().length < 2 || name.trim().length > 100)) {
      return NextResponse.json({ error: "Nome deve ter entre 2 e 100 caracteres." }, { status: 422 });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(whatsapp !== undefined && { whatsapp: whatsapp?.trim() || null }),
        ...(email !== undefined && { email: email.trim() }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(state !== undefined && { state: state?.trim() || null }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        phone: true,
        whatsapp: true,
        email: true,
        address: true,
        city: true,
        state: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update tenant error:", error);
    return NextResponse.json({ error: "Erro ao atualizar dados." }, { status: 500 });
  }
}
