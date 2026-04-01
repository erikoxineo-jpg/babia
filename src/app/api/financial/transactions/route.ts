import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PaymentMethod, TransactionType } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const perPage = 20;
  const period = searchParams.get("period") || "month";
  const type = searchParams.get("type") as TransactionType | null;
  const paymentMethod = searchParams.get("paymentMethod") as PaymentMethod | null;

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1);

    let startDate: Date;
    if (period === "today") {
      startDate = today;
    } else if (period === "week") {
      startDate = new Date(today);
      const dayOfWeek = startDate.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(startDate.getDate() - diff);
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const where = {
      tenantId,
      date: { gte: startDate, lt: endDate },
      ...(type && { type }),
      ...(paymentMethod && { paymentMethod }),
    };

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          appointment: {
            select: {
              id: true,
              service: { select: { name: true } },
              professional: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.transaction.count({ where }),
    ]);

    const transactions = data.map((tx) => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount),
      paymentMethod: tx.paymentMethod,
      date: tx.date.toISOString().split("T")[0],
      createdAt: tx.createdAt.toISOString(),
      client: tx.client,
      serviceName: tx.appointment?.service?.name || null,
      professionalName: tx.appointment?.professional?.name || null,
    }));

    return NextResponse.json({
      success: true,
      data: transactions,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error("List transactions error:", error);
    return NextResponse.json({ error: "Erro ao listar transações." }, { status: 500 });
  }
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
    const { clientId, appointmentId, type, amount, paymentMethod, date } = body as {
      clientId: string;
      appointmentId?: string;
      type: TransactionType;
      amount: number;
      paymentMethod: PaymentMethod;
      date?: string;
    };

    if (!clientId || !type || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Campos obrigatórios: clientId, type, amount, paymentMethod." },
        { status: 422 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Valor deve ser maior que zero." }, { status: 422 });
    }

    // Verificar que o cliente pertence ao tenant
    const client = await prisma.client.findFirst({
      where: { id: clientId, tenantId },
    });
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        tenantId,
        clientId,
        appointmentId: appointmentId || null,
        type,
        amount,
        paymentMethod,
        date: date ? new Date(date + "T12:00:00") : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount),
        paymentMethod: transaction.paymentMethod,
        date: transaction.date.toISOString().split("T")[0],
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json({ error: "Erro ao criar transação." }, { status: 500 });
  }
}
