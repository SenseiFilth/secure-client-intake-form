import { NextRequest, NextResponse } from "next/server";
import { intakeFormSchema } from "@/lib/schemas/intake-schema";
import { checkRateLimit, getRateLimitKey } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";

/**
 * POST /api/intake
 *
 * Accepts a client intake form submission, validates it server-side using
 * the same Zod schema used on the client, and returns a success or error
 * response. No data is persisted in this demo version.
 *
 * Security layers (in order of evaluation):
 *  1. Method guard — reject everything except POST
 *  2. Rate limiting — prevent brute-force and spam submissions
 *  3. Cloudflare Turnstile — bot challenge verification (TODO: wire up token)
 *  4. Schema validation — reject malformed or incomplete payloads
 */
export async function POST(request: NextRequest) {
  // ── 1. Rate limiting ───────────────────────────────────────────────────────
  const rateLimitKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many requests. Please wait a moment before submitting again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      }
    );
  }

  // ── 2. Parse request body ──────────────────────────────────────────────────
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body — expected JSON." },
      { status: 400 }
    );
  }

  // ── 3. Cloudflare Turnstile verification ───────────────────────────────────
  // TODO: Extract the turnstile token from the request body once the client-side
  //       widget is integrated. The widget renders with NEXT_PUBLIC_TURNSTILE_SITE_KEY
  //       and passes a short-lived token that must be verified here before continuing.
  //
  // const { turnstileToken, ...formData } = rawBody as Record<string, unknown>;
  // const turnstileResult = await verifyTurnstileToken(
  //   turnstileToken as string,
  //   getRateLimitKey(request)
  // );
  // if (!turnstileResult.success) {
  //   return NextResponse.json(
  //     { error: "Bot challenge failed. Please refresh and try again." },
  //     { status: 403 }
  //   );
  // }

  // Suppress unused import warning until Turnstile is wired up
  void verifyTurnstileToken;

  // ── 4. Schema validation ───────────────────────────────────────────────────
  const parseResult = intakeFormSchema.safeParse(rawBody);

  if (!parseResult.success) {
    // Return structured validation errors — useful for API consumers and debugging
    return NextResponse.json(
      {
        error: "Validation failed. Please review the form and try again.",
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const validatedData = parseResult.data;

  // ── 5. Sanitise sensitive fields before any logging ────────────────────────
  // Never log full form payloads containing PII. Log only a safe summary.
  const safeSummary = {
    county: validatedData.county,
    typeOfService: validatedData.typeOfService,
    priorityLevel: validatedData.priorityLevel,
    paymentMethod: validatedData.paymentMethod,
    submittedAt: new Date().toISOString(),
  };
  console.log("[intake] New submission received:", safeSummary);

  // ── 6. Persist to database ─────────────────────────────────────────────────
  // TODO: Replace with your chosen persistence layer. Options:
  //   - Supabase: await supabase.from("intake_requests").insert([validatedData])
  //   - Firebase: await db.collection("intake_requests").add(validatedData)
  //   - PlanetScale / Prisma: await prisma.intakeRequest.create({ data: validatedData })
  //
  // Important: encrypt or hash any fields containing PII at rest, and ensure
  // your database connection uses SSL/TLS. Never log full validatedData.

  // ── 7. Send admin notification email ──────────────────────────────────────
  // TODO: Trigger an email to ADMIN_NOTIFICATION_EMAIL using Resend or similar.
  //
  // import { Resend } from "resend";
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "noreply@yourdomain.com",
  //   to: process.env.ADMIN_NOTIFICATION_EMAIL!,
  //   subject: `New Intake Request — ${validatedData.county} (${validatedData.priorityLevel})`,
  //   text: `A new intake request has been received. Priority: ${validatedData.priorityLevel}`,
  // });

  // ── 8. CRM integration ─────────────────────────────────────────────────────
  // TODO: Create a lead or contact record in your CRM (HubSpot, Salesforce, etc.)
  //
  // await hubspotClient.crm.contacts.basicApi.create({
  //   properties: {
  //     email: validatedData.email,
  //     phone: validatedData.phone,
  //     firstname: validatedData.submitterFullName.split(" ")[0],
  //     // ...
  //   },
  // });

  // ── 9. Return success ──────────────────────────────────────────────────────
  // Generate a fake reference number for UX realism.
  // In production this would be the database record ID.
  const referenceNumber = `CIF-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;

  return NextResponse.json(
    {
      success: true,
      referenceNumber,
      message: "Your intake request has been received. We will be in touch within 1–2 business days.",
    },
    { status: 201 }
  );
}

/**
 * Reject all other HTTP methods explicitly.
 * Next.js will handle OPTIONS automatically for CORS preflight.
 */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
