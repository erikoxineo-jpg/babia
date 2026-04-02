import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsappMessage } from "@/lib/whatsapp";
import { createRateLimiter } from "@/lib/rate-limit";

// Rate limit: 10 mensagens por hora por telefone
const inboxLimiter = createRateLimiter({ max: 10, windowMs: 60 * 60 * 1000 });

const WEBHOOK_SECRET = process.env.EVOLUTION_WEBHOOK_SECRET || "";

const STATUS_EMOJI: Record<string, string> = {
  confirmed: "\u2705",
  pending: "\u23f3",
  completed: "\u2714\ufe0f",
  no_show: "\u274c",
};

function extractPhone(remoteJid: string): string {
  // Format: 5511999999999@s.whatsapp.net
  return remoteJid.replace(/@.*$/, "");
}

function normalizePhone(phone: string): string {
  // Remove country code (55) to get the last 10-11 digits
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 12 && digits.startsWith("55")) {
    return digits.slice(2);
  }
  return digits;
}

type Intent = "agenda" | "ajuda" | "desconhecido";

function detectIntent(text: string): Intent {
  const lower = text.toLowerCase().trim();
  if (/\b(agenda|agendamento|hoje|clientes|meus horarios|meus hor[áa]rios|compromissos)\b/.test(lower)) {
    return "agenda";
  }
  if (/\b(ajuda|help|menu|comandos|opcoes|op[çc][õo]es)\b/.test(lower)) {
    return "ajuda";
  }
  return "desconhecido";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function buildHelpMessage(): string {
  return [
    `🤖 *BabIA Inbox - Comandos:*`,
    ``,
    `📅 *"agenda"* ou *"hoje"* — Ver seus agendamentos do dia`,
    `❓ *"ajuda"* ou *"menu"* — Ver este menu`,
    ``,
    `_Envie uma das palavras acima para começar!_`,
  ].join("\n");
}

export async function POST(request: Request) {
  // Validar apikey
  const apikey = request.headers.get("apikey") || "";
  if (!WEBHOOK_SECRET || apikey !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Evolution API envia diferentes tipos de evento
    // Mensagens recebidas vêm no formato: { data: { key: { remoteJid }, message: { conversation } } }
    const messageData = body.data;
    if (!messageData?.key?.remoteJid || !messageData.message) {
      return NextResponse.json({ ok: true }); // Ignorar eventos não-mensagem
    }

    // Ignorar mensagens enviadas por nós
    if (messageData.key.fromMe) {
      return NextResponse.json({ ok: true });
    }

    const remoteJid = messageData.key.remoteJid as string;

    // Ignorar mensagens de grupo
    if (remoteJid.includes("@g.us")) {
      return NextResponse.json({ ok: true });
    }

    const rawPhone = extractPhone(remoteJid);
    const normalizedPhone = normalizePhone(rawPhone);
    const messageText =
      messageData.message.conversation ||
      messageData.message.extendedTextMessage?.text ||
      "";

    if (!messageText.trim()) {
      return NextResponse.json({ ok: true });
    }

    // Rate limit por telefone
    const rl = inboxLimiter.check(rawPhone);
    if (!rl.allowed) {
      return NextResponse.json({ ok: true }); // Silenciosamente ignorar spam
    }

    // Buscar profissional pelo telefone (últimos 10-11 dígitos)
    const professional = await prisma.professional.findFirst({
      where: {
        phone: { endsWith: normalizedPhone.slice(-11) },
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, name: true, phone: true, tenantId: true },
    });

    if (!professional) {
      // Não é um profissional cadastrado — ignorar silenciosamente
      return NextResponse.json({ ok: true });
    }

    const intent = detectIntent(messageText);

    if (intent === "ajuda" || intent === "desconhecido") {
      await sendWhatsappMessage(rawPhone, buildHelpMessage());
      return NextResponse.json({ ok: true });
    }

    // intent === "agenda" — buscar agendamentos de hoje
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }); // YYYY-MM-DD
    const todayDate = new Date(todayStr + "T00:00:00");

    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: professional.id,
        tenantId: professional.tenantId,
        date: todayDate,
        status: { not: "cancelled" },
      },
      include: {
        client: { select: { name: true } },
        service: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
    });

    if (appointments.length === 0) {
      const msg = `📅 *Sua agenda de hoje (${formatDate(now)}):*\n\nNenhum agendamento para hoje.\n\n_Responda "ajuda" para ver os comandos._`;
      await sendWhatsappMessage(rawPhone, msg);
      return NextResponse.json({ ok: true });
    }

    const lines = appointments.map((a) => {
      const emoji = STATUS_EMOJI[a.status] || "⏳";
      return `${a.startTime} - ${a.client.name} (${a.service.name}) ${emoji}`;
    });

    const msg = [
      `📅 *Sua agenda de hoje (${formatDate(now)}):*`,
      ``,
      ...lines,
      ``,
      `Total: ${appointments.length} agendamento${appointments.length > 1 ? "s" : ""}`,
      ``,
      `_Responda "ajuda" para ver os comandos._`,
    ].join("\n");

    await sendWhatsappMessage(rawPhone, msg);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WhatsApp incoming error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
