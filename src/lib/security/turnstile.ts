/**
 * Cloudflare Turnstile verification utility
 *
 * Turnstile is a privacy-respecting CAPTCHA alternative from Cloudflare.
 * It runs in the browser and generates a short-lived challenge token that
 * must be verified server-side before any sensitive action is performed.
 *
 * Setup:
 *  1. Create a Turnstile site at https://dash.cloudflare.com/sign-up?to=/:account/turnstile
 *  2. Add TURNSTILE_SECRET_KEY to your .env.local
 *  3. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY to your .env.local
 *  4. Embed the Turnstile widget in your form (see IntakeForm.tsx TODO)
 *  5. Pass the resulting token to the API route
 *  6. Call verifyTurnstileToken() before processing the submission
 */

interface TurnstileOutcome {
  success: boolean;
  /** Only populated on failure — safe to log server-side, not sent to client */
  errorCodes?: string[];
}

/**
 * Verifies a Cloudflare Turnstile challenge token with the Cloudflare API.
 *
 * This must run server-side only — never expose TURNSTILE_SECRET_KEY to the browser.
 *
 * @param token - The token produced by the Turnstile widget on the client
 * @param remoteIp - Optional: the submitter's IP address (adds binding to the challenge)
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileOutcome> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // TODO: Remove this guard once Turnstile is configured.
  // In development, skip verification if no key is set.
  if (!secretKey) {
    console.warn(
      "[Turnstile] TURNSTILE_SECRET_KEY not set — skipping verification (dev only)"
    );
    return { success: true };
  }

  const body = new URLSearchParams({
    secret: secretKey,
    response: token,
    ...(remoteIp ? { remoteip: remoteIp } : {}),
  });

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!response.ok) {
      console.error("[Turnstile] Siteverify HTTP error:", response.status);
      return { success: false, errorCodes: ["http-error"] };
    }

    const data = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    return {
      success: data.success,
      errorCodes: data["error-codes"],
    };
  } catch (err) {
    console.error("[Turnstile] Network error during verification:", err);
    return { success: false, errorCodes: ["network-error"] };
  }
}
