import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT — atualizar configurações operacionais
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
  const role = user.role as string;

  if (role !== "owner") {
    return NextResponse.json({ error: "Apenas o dono pode alterar configurações." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      bookingAdvanceDays,
      cancellationPolicyHours,
      confirmationEnabled,
      reminderHoursBefore,
      inactiveDaysThreshold,
      workingDays,
    } = body as {
      bookingAdvanceDays?: number;
      cancellationPolicyHours?: number;
      confirmationEnabled?: boolean;
      reminderHoursBefore?: number;
      inactiveDaysThreshold?: number;
      workingDays?: number[];
    };

    // Validations
    if (reminderHoursBefore !== undefined && (reminderHoursBefore < 1 || reminderHoursBefore > 48)) {
      return NextResponse.json({ error: "Lembrete deve ser entre 1 e 48 horas." }, { status: 422 });
    }
    if (cancellationPolicyHours !== undefined && (cancellationPolicyHours < 0 || cancellationPolicyHours > 72)) {
      return NextResponse.json({ error: "Política de cancelamento deve ser entre 0 e 72 horas." }, { status: 422 });
    }
    if (inactiveDaysThreshold !== undefined && (inactiveDaysThreshold < 7 || inactiveDaysThreshold > 365)) {
      return NextResponse.json({ error: "Threshold de inatividade deve ser entre 7 e 365 dias." }, { status: 422 });
    }
    if (bookingAdvanceDays !== undefined && (bookingAdvanceDays < 1 || bookingAdvanceDays > 90)) {
      return NextResponse.json({ error: "Antecedência de agendamento deve ser entre 1 e 90 dias." }, { status: 422 });
    }
    if (workingDays !== undefined) {
      if (!Array.isArray(workingDays) || workingDays.some((d) => d < 0 || d > 6)) {
        return NextResponse.json({ error: "Dias de funcionamento inválidos." }, { status: 422 });
      }
    }

    const updated = await prisma.tenantSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...(bookingAdvanceDays !== undefined && { bookingAdvanceDays }),
        ...(cancellationPolicyHours !== undefined && { cancellationPolicyHours }),
        ...(confirmationEnabled !== undefined && { confirmationEnabled }),
        ...(reminderHoursBefore !== undefined && { reminderHoursBefore }),
        ...(inactiveDaysThreshold !== undefined && { inactiveDaysThreshold }),
        ...(workingDays !== undefined && { workingDays }),
      },
      update: {
        ...(bookingAdvanceDays !== undefined && { bookingAdvanceDays }),
        ...(cancellationPolicyHours !== undefined && { cancellationPolicyHours }),
        ...(confirmationEnabled !== undefined && { confirmationEnabled }),
        ...(reminderHoursBefore !== undefined && { reminderHoursBefore }),
        ...(inactiveDaysThreshold !== undefined && { inactiveDaysThreshold }),
        ...(workingDays !== undefined && { workingDays }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        bookingAdvanceDays: updated.bookingAdvanceDays,
        cancellationPolicyHours: updated.cancellationPolicyHours,
        confirmationEnabled: updated.confirmationEnabled,
        reminderHoursBefore: updated.reminderHoursBefore,
        inactiveDaysThreshold: updated.inactiveDaysThreshold,
        workingDays: updated.workingDays,
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Erro ao atualizar configurações." }, { status: 500 });
  }
}
