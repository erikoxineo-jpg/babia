const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "barberflow";

function formatPhoneForAPI(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Add country code if not present
  if (digits.length <= 11) return `55${digits}`;
  return digits;
}

export async function sendWhatsappMessage(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return { success: false, error: "Evolution API não configurada." };
  }

  const number = formatPhoneForAPI(phone);

  try {
    console.log(`[WhatsApp] Sending to ${number}...`);
    const res = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number,
          text: message,
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      console.log(`[WhatsApp] Sent to ${number} OK`);
      return { success: true };
    }

    console.error(`[WhatsApp] Failed to send to ${number}: HTTP ${res.status}`, data);
    return {
      success: false,
      error: data.message || `HTTP ${res.status}`,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Erro de conexão";
    console.error(`[WhatsApp] Error sending to ${number}:`, errMsg);
    return {
      success: false,
      error: errMsg,
    };
  }
}

export function isEvolutionConfigured(): boolean {
  return !!(EVOLUTION_API_URL && EVOLUTION_API_KEY);
}

// Delay helper to avoid WhatsApp rate limiting
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
