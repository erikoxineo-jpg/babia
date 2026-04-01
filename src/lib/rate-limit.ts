/**
 * Rate limiter em memória com cleanup automático.
 * Uso: const limiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimiterOptions {
  /** Máximo de requisições por janela */
  max: number;
  /** Duração da janela em ms */
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const { max, windowMs } = options;
  const store = new Map<string, RateLimitEntry>();

  // Cleanup a cada 5 minutos
  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  };

  let cleanupInterval: ReturnType<typeof setInterval> | null = null;
  if (typeof setInterval !== "undefined") {
    cleanupInterval = setInterval(cleanup, 5 * 60 * 1000);
    // Não impedir o processo de encerrar
    if (cleanupInterval && typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
      cleanupInterval.unref();
    }
  }

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
      }

      entry.count++;
      if (entry.count > max) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
      }

      return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
    },
  };
}

// --- Rate limiters pré-configurados ---

/** Registro: 5 por hora por IP */
export const registerLimiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });

/** Login: 10 por minuto por IP */
export const loginLimiter = createRateLimiter({ max: 10, windowMs: 60 * 1000 });

/** Booking público: 20 por hora por IP */
export const bookingLimiter = createRateLimiter({ max: 20, windowMs: 60 * 60 * 1000 });

/**
 * Extrai IP do request (compatível com Next.js)
 */
export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Helper: retorna Response 429 se rate limit excedido, ou null se OK.
 */
export function checkRateLimit(
  request: Request,
  limiter: ReturnType<typeof createRateLimiter>
): Response | null {
  const ip = getClientIp(request);
  const result = limiter.check(ip);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: "Muitas requisições. Tente novamente mais tarde." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  return null;
}
