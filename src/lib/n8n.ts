const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

/**
 * Dispara webhook para o N8N (fire-and-forget).
 * Não bloqueia o request principal — erros são logados silenciosamente.
 */
export async function fireWebhook(
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  if (!N8N_WEBHOOK_URL) return;

  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, ...data }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error(`[N8N] Webhook failed for ${event}:`, err instanceof Error ? err.message : err);
  }
}
