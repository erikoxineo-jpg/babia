import { NextResponse } from "next/server";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "barberflow";

async function evoFetch(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${EVOLUTION_API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
  });
  return res.json();
}

// GET — status + QR code
export async function GET() {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
  }

  try {
    // Check connection state
    const state = await evoFetch(`/instance/connectionState/${EVOLUTION_INSTANCE}`);
    const isConnected = state?.instance?.state === "open";

    if (isConnected) {
      return NextResponse.json({ status: "connected" });
    }

    // Try to get QR code
    const connect = await evoFetch(`/instance/connect/${EVOLUTION_INSTANCE}`);

    if (connect.base64) {
      return NextResponse.json({ status: "qr", base64: connect.base64 });
    }

    // QR exhausted — need to recreate instance
    if (connect.count !== undefined && !connect.base64) {
      return NextResponse.json({ status: "expired" });
    }

    return NextResponse.json({ status: "connecting" });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST — actions: reset, test
export async function POST(request: Request) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
  }

  try {
    const { action, phone } = await request.json();

    if (action === "reset") {
      // Delete and recreate instance
      await evoFetch(`/instance/delete/${EVOLUTION_INSTANCE}`, "DELETE").catch(() => {});
      await new Promise((r) => setTimeout(r, 2000));
      const created = await evoFetch("/instance/create", "POST", {
        instanceName: EVOLUTION_INSTANCE,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      });

      if (created.qrcode?.base64) {
        return NextResponse.json({ status: "qr", base64: created.qrcode.base64 });
      }

      return NextResponse.json({ status: "connecting" });
    }

    if (action === "test" && phone) {
      const result = await evoFetch(`/message/sendText/${EVOLUTION_INSTANCE}`, "POST", {
        number: phone,
        text: "✅ *BabIA conectada!*\n\nSeu WhatsApp está integrado e funcionando.\nAs notificações de agendamento serão enviadas automaticamente.",
      });

      return NextResponse.json({ status: "sent", result });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
