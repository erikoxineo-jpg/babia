import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — informações públicas da barbearia
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      logoUrl: true,
      address: true,
      city: true,
      state: true,
      phone: true,
      onboardingCompleted: true,
    },
  });

  if (!tenant || !tenant.onboardingCompleted) {
    return NextResponse.json(
      { error: "Barbearia não encontrada." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    name: tenant.name,
    slug: tenant.slug,
    logoUrl: tenant.logoUrl,
    address: tenant.address,
    city: tenant.city,
    state: tenant.state,
    phone: tenant.phone,
  });
}
