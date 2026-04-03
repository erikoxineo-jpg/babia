import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

const SYSTEM_PROMPT = `Você é a *BabIA*, a secretária inteligente da beleza! Você ajuda profissionais de barbearias e salões a gerenciar sua agenda, clientes e faturamento via WhatsApp.

Personalidade:
- Simpática, eficiente e profissional
- Trata os profissionais pelo primeiro nome
- Proativa — se o profissional pergunta sobre hoje, já mostra o resumo completo
- Faz observações úteis (ex: "Dia tranquilo hoje!" ou "Agenda cheia, bom sinal!")

Regras:
- Responda SEMPRE em português brasileiro
- Use formatação WhatsApp: *negrito*, _itálico_
- Seja concisa — respostas curtas e organizadas
- Use emojis para deixar a leitura agradável
- Nunca invente dados — use APENAS os dados retornados pelas ferramentas
- Formate horários como HH:MM, datas como DD/MM/AAAA
- Formate valores monetários como R$ X,XX
- Status: pending=⏳, confirmed=✅, completed=✔️, no_show=❌, cancelled=🚫
- Se a pergunta não for sobre o negócio (agenda, clientes, financeiro, serviços), responda educadamente que você é especialista em gestão do salão e sugira o que pode ajudar`;

type ToolInput = Record<string, unknown>;

const tools: Anthropic.Tool[] = [
  {
    name: "consultar_agenda",
    description: "Consulta agendamentos de um profissional para uma data específica. Se não informar data, usa hoje.",
    input_schema: {
      type: "object" as const,
      properties: {
        data: { type: "string", description: "Data no formato YYYY-MM-DD. Se não informada, usa hoje." },
      },
      required: [],
    },
  },
  {
    name: "proximo_agendamento",
    description: "Retorna o próximo agendamento do profissional (o mais próximo no futuro).",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "buscar_cliente",
    description: "Busca um cliente pelo nome (parcial). Retorna nome, telefone e último agendamento.",
    input_schema: {
      type: "object" as const,
      properties: {
        nome: { type: "string", description: "Nome ou parte do nome do cliente" },
      },
      required: ["nome"],
    },
  },
  {
    name: "resumo_financeiro",
    description: "Retorna resumo financeiro do profissional: faturamento de hoje, da semana e do mês.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "listar_servicos",
    description: "Lista todos os serviços disponíveis com preços e duração.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "resumo_dia",
    description: "Resumo completo do dia: total de agendamentos, por status, faturamento previsto e horários vagos.",
    input_schema: {
      type: "object" as const,
      properties: {
        data: { type: "string", description: "Data no formato YYYY-MM-DD. Se não informada, usa hoje." },
      },
      required: [],
    },
  },
];

function getTodayStr(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
}

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

async function executeTool(
  toolName: string,
  input: ToolInput,
  professionalId: string,
  tenantId: string
): Promise<string> {
  switch (toolName) {
    case "consultar_agenda": {
      const dateStr = (input.data as string) || getTodayStr();
      const dateObj = new Date(dateStr + "T00:00:00");

      const appointments = await prisma.appointment.findMany({
        where: {
          professionalId,
          tenantId,
          date: dateObj,
          status: { not: "cancelled" },
        },
        include: {
          client: { select: { name: true, phone: true } },
          service: { select: { name: true, durationMinutes: true } },
        },
        orderBy: { startTime: "asc" },
      });

      if (appointments.length === 0) {
        return JSON.stringify({ data: formatDateBR(dateStr), agendamentos: [], total: 0 });
      }

      return JSON.stringify({
        data: formatDateBR(dateStr),
        total: appointments.length,
        agendamentos: appointments.map((a) => ({
          horario: a.startTime,
          horario_fim: a.endTime,
          cliente: a.client.name,
          telefone_cliente: a.client.phone,
          servico: a.service.name,
          duracao_min: a.service.durationMinutes,
          status: a.status,
          valor: Number(a.price),
        })),
      });
    }

    case "proximo_agendamento": {
      const now = new Date();
      const todayStr = getTodayStr();
      const todayDate = new Date(todayStr + "T00:00:00");
      const currentTime = now.toLocaleTimeString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const appointment = await prisma.appointment.findFirst({
        where: {
          professionalId,
          tenantId,
          status: { in: ["pending", "confirmed"] },
          OR: [
            { date: { gt: todayDate } },
            { date: todayDate, startTime: { gte: currentTime } },
          ],
        },
        include: {
          client: { select: { name: true, phone: true } },
          service: { select: { name: true } },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      });

      if (!appointment) {
        return JSON.stringify({ proximo: null, mensagem: "Nenhum agendamento próximo encontrado." });
      }

      const dateStr = appointment.date.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
      return JSON.stringify({
        proximo: {
          data: formatDateBR(dateStr),
          horario: appointment.startTime,
          cliente: appointment.client.name,
          telefone_cliente: appointment.client.phone,
          servico: appointment.service.name,
          status: appointment.status,
          valor: Number(appointment.price),
        },
      });
    }

    case "buscar_cliente": {
      const nome = input.nome as string;
      const clients = await prisma.client.findMany({
        where: {
          tenantId,
          deletedAt: null,
          name: { contains: nome, mode: "insensitive" },
        },
        include: {
          appointments: {
            orderBy: { date: "desc" },
            take: 3,
            include: { service: { select: { name: true } } },
          },
        },
        take: 5,
      });

      if (clients.length === 0) {
        return JSON.stringify({ clientes: [], mensagem: `Nenhum cliente encontrado com "${nome}".` });
      }

      return JSON.stringify({
        clientes: clients.map((c) => ({
          nome: c.name,
          telefone: c.phone,
          email: c.email,
          ultimos_agendamentos: c.appointments.map((a) => ({
            data: a.date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
            horario: a.startTime,
            servico: a.service.name,
            status: a.status,
          })),
        })),
      });
    }

    case "resumo_financeiro": {
      const todayStr = getTodayStr();
      const todayDate = new Date(todayStr + "T00:00:00");

      // Start of week (Monday)
      const dayOfWeek = todayDate.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(todayDate);
      weekStart.setDate(todayDate.getDate() + mondayOffset);

      // Start of month
      const monthStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);

      const [todayRevenue, weekRevenue, monthRevenue] = await Promise.all([
        prisma.appointment.aggregate({
          where: {
            professionalId, tenantId, date: todayDate,
            status: { in: ["completed", "confirmed", "pending"] },
          },
          _sum: { price: true },
          _count: true,
        }),
        prisma.appointment.aggregate({
          where: {
            professionalId, tenantId,
            date: { gte: weekStart, lte: todayDate },
            status: { in: ["completed", "confirmed", "pending"] },
          },
          _sum: { price: true },
          _count: true,
        }),
        prisma.appointment.aggregate({
          where: {
            professionalId, tenantId,
            date: { gte: monthStart, lte: todayDate },
            status: { in: ["completed", "confirmed", "pending"] },
          },
          _sum: { price: true },
          _count: true,
        }),
      ]);

      return JSON.stringify({
        hoje: {
          faturamento: Number(todayRevenue._sum.price || 0),
          agendamentos: todayRevenue._count,
        },
        semana: {
          faturamento: Number(weekRevenue._sum.price || 0),
          agendamentos: weekRevenue._count,
        },
        mes: {
          faturamento: Number(monthRevenue._sum.price || 0),
          agendamentos: monthRevenue._count,
        },
      });
    }

    case "listar_servicos": {
      const services = await prisma.service.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: "asc" },
      });

      return JSON.stringify({
        servicos: services.map((s) => ({
          nome: s.name,
          preco: Number(s.price),
          duracao_min: s.durationMinutes,
        })),
      });
    }

    case "resumo_dia": {
      const dateStr = (input.data as string) || getTodayStr();
      const dateObj = new Date(dateStr + "T00:00:00");

      const appointments = await prisma.appointment.findMany({
        where: { professionalId, tenantId, date: dateObj },
        include: {
          client: { select: { name: true } },
          service: { select: { name: true, durationMinutes: true } },
        },
        orderBy: { startTime: "asc" },
      });

      const byStatus: Record<string, number> = {};
      let totalRevenue = 0;
      for (const a of appointments) {
        byStatus[a.status] = (byStatus[a.status] || 0) + 1;
        if (a.status !== "cancelled" && a.status !== "no_show") {
          totalRevenue += Number(a.price);
        }
      }

      return JSON.stringify({
        data: formatDateBR(dateStr),
        total: appointments.length,
        por_status: byStatus,
        faturamento_previsto: totalRevenue,
        agendamentos: appointments.map((a) => ({
          horario: a.startTime,
          cliente: a.client.name,
          servico: a.service.name,
          status: a.status,
          valor: Number(a.price),
        })),
      });
    }

    default:
      return JSON.stringify({ error: "Ferramenta não encontrada" });
  }
}

export async function processMessage(
  message: string,
  professionalId: string,
  professionalName: string,
  tenantId: string
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "🤖 BabIA está em manutenção. Tente novamente mais tarde.";
  }

  try {
    const messages: Anthropic.MessageParam[] = [
      {
        role: "user",
        content: `[Profissional: ${professionalName} | Data atual: ${formatDateBR(getTodayStr())}]\n\n${message}`,
      },
    ];

    let response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    // Tool use loop (max 5 iterations)
    let iterations = 0;
    while (response.stop_reason === "tool_use" && iterations < 5) {
      iterations++;

      const assistantContent = response.content;
      const toolUseBlocks = assistantContent.filter(
        (b) => b.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUse of toolUseBlocks) {
        if (toolUse.type !== "tool_use") continue;
        const result = await executeTool(
          toolUse.name,
          toolUse.input as ToolInput,
          professionalId,
          tenantId
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      messages.push({ role: "assistant", content: assistantContent });
      messages.push({ role: "user", content: toolResults });

      response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages,
      });
    }

    // Extract text response
    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );

    return textBlocks.map((b) => b.text).join("\n") || "🤖 Não entendi. Tente perguntar de outra forma.";
  } catch (error) {
    console.error("[BabIA AI] Error:", error);
    return "🤖 Ops, tive um problema ao processar sua mensagem. Tente novamente.";
  }
}
