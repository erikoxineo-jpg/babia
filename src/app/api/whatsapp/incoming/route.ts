import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsappMessage } from "@/lib/whatsapp";
import { createRateLimiter } from "@/lib/rate-limit";
import { processMessage } from "@/lib/babia-ai";

// Rate limit: 30 mensagens por hora por telefone
const inboxLimiter = createRateLimiter({ max: 30, windowMs: 60 * 60 * 1000 });

const WEBHOOK_SECRET = process.env.EVOLUTION_WEBHOOK_SECRET || "";

function extractPhone(remoteJid: string): string {
  return remoteJid.replace(/@.*$/, "");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 12 && digits.startsWith("55")) {
    return digits.slice(2);
  }
  return digits;
}

export async function POST(request: Request) {
  const apikey = request.headers.get("apikey") || "";
  if (!WEBHOOK_SECRET || apikey !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const messageData = body.data;
    if (!messageData?.key?.remoteJid || !messageData.message) {
      return NextResponse.json({ ok: true });
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
      await sendWhatsappMessage(rawPhone, "⏳ Você atingiu o limite de mensagens por hora. Tente novamente mais tarde.");
      return NextResponse.json({ ok: true });
    }

    // Buscar profissional pelo telefone
    const professional = await prisma.professional.findFirst({
      where: {
        phone: { endsWith: normalizedPhone.slice(-11) },
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, name: true, phone: true, tenantId: true },
    });

    if (!professional) {
      // Não é profissional — responder com mensagem padrão
      await sendWhatsappMessage(
        rawPhone,
        "🤖 Olá! Sou a *BabIA*, secretária inteligente. Este canal é exclusivo para profissionais cadastrados. Para agendar um horário, peça o link de agendamento ao seu profissional!"
      );
      return NextResponse.json({ ok: true });
    }

    // Processar mensagem com IA
    console.log(`[BabIA] ${professional.name}: "${messageText}"`);
    const aiResponse = await processMessage(
      messageText,
      professional.id,
      professional.name,
      professional.tenantId
    );

    await sendWhatsappMessage(rawPhone, aiResponse);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("WhatsApp incoming error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
