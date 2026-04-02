import { NextResponse } from "next/server";

export async function GET() {
  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "";
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";
  const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "barberflow";

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return new NextResponse("Evolution API não configurada", { status: 500 });
  }

  try {
    const res = await fetch(
      `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`,
      { headers: { apikey: EVOLUTION_API_KEY }, cache: "no-store" }
    );
    const data = await res.json();

    if (data.instance?.state === "open") {
      return new NextResponse(
        "<html><body style='display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif'><h1>WhatsApp já está conectado!</h1></body></html>",
        { headers: { "Content-Type": "text/html" } }
      );
    }

    const b64 = data.base64 || "";
    if (!b64) {
      return new NextResponse("QR code não disponível", { status: 500 });
    }

    return new NextResponse(
      `<html><head><meta name='viewport' content='width=device-width,initial-scale=1'><title>QR WhatsApp</title></head><body style='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#f5f5f5;margin:0'><h2>Escaneie com o WhatsApp</h2><p style='color:#666;font-size:14px'>Aparelhos conectados &gt; Conectar um aparelho</p><img src='${b64}' style='width:300px;height:300px;border-radius:12px'/><p style='color:#999;font-size:12px;margin-top:16px'>Expira em ~60s. Recarregue a página para gerar outro.</p></body></html>`,
      { headers: { "Content-Type": "text/html", "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return new NextResponse("Erro: " + String(err), { status: 500 });
  }
}
