import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      whatsapp: true,
      address: true,
      city: true,
      state: true,
      logoUrl: true,
      onboardingStep: true,
      onboardingCompleted: true,
    },
  });

  const ownerProfessional = await prisma.professional.findFirst({
    where: {
      tenantId,
      user: { role: "owner" },
    },
    include: {
      schedules: true,
      breaks: true,
    },
  });

  const services = await prisma.service.findMany({
    where: { tenantId },
    orderBy: { displayOrder: "asc" },
  });

  const professionals = await prisma.professional.findMany({
    where: { tenantId },
    include: {
      services: { include: { service: true } },
      user: { select: { role: true } },
    },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json({
    tenant,
    ownerProfessional,
    services,
    professionals,
  });
}
