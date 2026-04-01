import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// GET — lista de clientes com busca, filtros e paginação
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const sort = searchParams.get("sort") ?? "name";
  const order = searchParams.get("order") ?? "asc";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") ?? "20")));

  const where: Prisma.ClientWhereInput = {
    tenantId,
    deletedAt: null,
  };

  // Filtro de status
  if (status === "active") where.status = "active";
  else if (status === "at_risk") where.status = "at_risk";
  else if (status === "inactive") where.status = "inactive";

  // Busca
  if (search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { phone: { contains: search.trim() } },
      { email: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  // Ordenação
  const orderByMap: Record<string, Prisma.ClientOrderByWithRelationInput> = {
    name: { name: order as "asc" | "desc" },
    last_visit: { lastVisit: order === "asc" ? { sort: "asc", nulls: "last" } : { sort: "desc", nulls: "last" } },
    total_visits: { totalVisits: order as "asc" | "desc" },
    created_at: { createdAt: order as "asc" | "desc" },
  };

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        status: true,
        totalVisits: true,
        totalSpent: true,
        averageTicket: true,
        lastVisit: true,
        createdAt: true,
      },
      orderBy: orderByMap[sort] ?? { name: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({
    data: clients.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      status: c.status,
      totalVisits: c.totalVisits,
      totalSpent: Number(c.totalSpent),
      averageTicket: Number(c.averageTicket),
      lastVisit: c.lastVisit?.toISOString().split("T")[0] ?? null,
      createdAt: c.createdAt.toISOString(),
    })),
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  try {
    const body = await request.json();
    const { name, phone, email } = body as {
      name: string;
      phone: string;
      email?: string;
    };

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios." },
        { status: 422 }
      );
    }

    const existing = await prisma.client.findUnique({
      where: { tenantId_phone: { tenantId, phone: phone.trim() } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe um cliente com esse telefone." },
        { status: 409 }
      );
    }

    const client = await prisma.client.create({
      data: {
        tenantId,
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json(
      { error: "Erro ao criar cliente." },
      { status: 500 }
    );
  }
}
