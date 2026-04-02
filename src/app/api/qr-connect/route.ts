import { NextResponse } from "next/server";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "barberflow";

// Cache do QR code para não gerar novo a cada poll
let cachedQr: { base64: string; timestamp: number } | null = null;
const QR_CACHE_TTL = 45000; // 45 seconds

async function evoFetch(path: string, method = "GET", body?: unknown) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${EVOLUTION_API_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
      signal: controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// GET — check status only (no QR generation)
export async function GET(request: Request) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return NextResponse.json({ status: "disconnected", error: "Evolution API nao configurada" });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    // Check connection state (lightweight, no side effects)
    const state = await evoFetch(`/instance/connectionState/${EVOLUTION_INSTANCE}`);
    const instanceState = state?.instance?.state;

    if (instanceState === "open") {
      cachedQr = null;
      return NextResponse.json({ status: "connected" });
    }

    // If action=qr, generate a new QR code
    if (action === "qr") {
      const connect = await evoFetch(`/instance/connect/${EVOLUTION_INSTANCE}`);
      if (connect.base64) {
        cachedQr = { base64: connect.base64, timestamp: Date.now() };
        return NextResponse.json({ status: "qr", base64: connect.base64 });
      }
      if (connect.count !== undefined && !connect.base64) {
        return NextResponse.json({ status: "expired" });
      }
      return NextResponse.json({ status: "disconnected" });
    }

    // Return cached QR if still valid
    if (cachedQr && Date.now() - cachedQr.timestamp < QR_CACHE_TTL) {
      return NextResponse.json({ status: "qr", base64: cachedQr.base64 });
    }

    // No cached QR — tell frontend it's disconnected
    return NextResponse.json({ status: "disconnected" });
  } catch (err) {
    console.error("[qr-connect] GET error:", err);
    return NextResponse.json({ status: "disconnected", error: String(err) });
  }
}

// POST — actions: qr, reset, test
export async function POST(request: Request) {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return NextResponse.json({ status: "error", error: "Evolution API nao configurada" });
  }

  try {
    const { action, phone } = await request.json();

    if (action === "qr") {
      const connect = await evoFetch(`/instance/connect/${EVOLUTION_INSTANCE}`);
      if (connect.base64) {
        cachedQr = { base64: connect.base64, timestamp: Date.now() };
        return NextResponse.json({ status: "qr", base64: connect.base64 });
      }
      if (connect.count !== undefined && !connect.base64) {
        return NextResponse.json({ status: "expired" });
      }
      return NextResponse.json({ status: "disconnected" });
    }

    if (action === "reset") {
      cachedQr = null;
      await evoFetch(`/instance/delete/${EVOLUTION_INSTANCE}`, "DELETE").catch(() => {});
      await new Promise((r) => setTimeout(r, 2000));
      const created = await evoFetch("/instance/create", "POST", {
        instanceName: EVOLUTION_INSTANCE,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        syncFullHistory: false,
        readMessages: false,
        readStatus: false,
        groupsIgnore: true,
      });

      if (created.qrcode?.base64) {
        cachedQr = { base64: created.qrcode.base64, timestamp: Date.now() };
        return NextResponse.json({ status: "qr", base64: created.qrcode.base64 });
      }
      return NextResponse.json({ status: "disconnected" });
    }

    if (action === "test" && phone) {
      const result = await evoFetch(`/message/sendText/${EVOLUTION_INSTANCE}`, "POST", {
        number: phone,
        text: "BabIA conectada! Seu WhatsApp esta integrado e funcionando. As notificacoes de agendamento serao enviadas automaticamente.",
      });
      return NextResponse.json({ status: "sent", result });
    }

    return NextResponse.json({ error: "Acao invalida" }, { status: 400 });
  } catch (err) {
    console.error("[qr-connect] POST error:", err);
    return NextResponse.json({ status: "error", error: String(err) });
  }
}
