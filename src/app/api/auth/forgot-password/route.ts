import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsappMessage, isEvolutionConfigured } from "@/lib/whatsapp";

// POST — solicitar código de redefinição de senha
export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Telefone é obrigatório." },
        { status: 400 }
      );
    }

    // Normalizar telefone (só dígitos)
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      return NextResponse.json(
        { error: "Telefone inválido." },
        { status: 400 }
      );
    }

    // Rate limit: máximo 3 tentativas por hora por telefone
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTokens = await prisma.passwordResetToken.count({
      where: {
        user: { phone: { endsWith: digits.slice(-11) } },
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentTokens >= 3) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 1 hora." },
        { status: 429 }
      );
    }

    // Buscar usuário pelo telefone
    const user = await prisma.user.findFirst({
      where: {
        phone: { endsWith: digits.slice(-11) },
        isActive: true,
      },
      select: { id: true, name: true, phone: true },
    });

    // Sempre retornar sucesso (não expor se o telefone existe)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Se o telefone estiver cadastrado, você receberá o código.",
      });
    }

    // Gerar código de 6 dígitos
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Salvar token com expiração de 15 minutos
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // Enviar código via WhatsApp
    const message = `🔐 *Código de redefinição de senha*\n\nSeu código: *${code}*\n\nEsse código expira em 15 minutos.\n\nSe você não solicitou, ignore esta mensagem.`;

    if (isEvolutionConfigured() && user.phone) {
      await sendWhatsappMessage(user.phone, message);
    }

    return NextResponse.json({
      success: true,
      message: "Se o telefone estiver cadastrado, você receberá o código.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Erro interno." },
      { status: 500 }
    );
  }
}
