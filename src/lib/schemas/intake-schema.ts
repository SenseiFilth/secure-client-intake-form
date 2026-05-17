import { z } from "zod";

// ─── Reusable validators ───────────────────────────────────────────────────────

const phoneRegex = /^[\d\s\-().+]{7,20}$/;

const requiredString = (label: string) =>
  z.string().min(1, `${label} is required`).trim();

// ─── Section 1: About You (the person submitting) ─────────────────────────────

export const aboutYouSchema = z.object({
  submitterFullName: requiredString("Full name"),
  relationship: requiredString("Relationship to person needing care"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .regex(phoneRegex, "Please enter a valid phone number")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .trim()
    .toLowerCase(),
});

// ─── Section 2: About the Client ──────────────────────────────────────────────

export const aboutClientSchema = z.object({
  clientFullName: requiredString("Client full name"),
  clientAge: z
    .string()
    .min(1, "Client age is required")
    .refine((val) => {
      const n = parseInt(val, 10);
      return !isNaN(n) && n >= 1 && n <= 120;
    }, "Please enter a valid age between 1 and 120"),
  city: requiredString("City"),
  county: requiredString("County"),
  // We intentionally avoid collecting a full street address in this demo.
  // In production, this field would be encrypted at rest.
  generalServiceArea: z
    .string()
    .max(100, "Service area description is too long")
    .optional(),
});

// ─── Section 3: Service Needs ─────────────────────────────────────────────────

export const serviceNeedsSchema = z.object({
  typeOfService: requiredString("Type of service"),
  daysNeeded: z
    .array(z.string())
    .min(1, "Please select at least one day")
    .default([]),
  timeOfDay: z
    .enum(["morning", "afternoon", "evening", "overnight", "flexible"], {
      errorMap: () => ({ message: "Please select a preferred time" }),
    })
    .optional(),
  preferredStartDate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true; // optional field
      const date = new Date(val);
      if (isNaN(date.getTime())) return false;
      // Reject dates more than 90 days in the past
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return date >= ninetyDaysAgo;
    }, "Start date cannot be more than 90 days in the past"),
  priorityLevel: z.enum(["low", "normal", "urgent"], {
    errorMap: () => ({ message: "Please select a priority level" }),
  }),
});

// ─── Section 4: Payment / Coverage ────────────────────────────────────────────

export const paymentSchema = z.object({
  paymentMethod: z.enum(
    ["private_pay", "insurance", "va_benefits", "medicaid", "unsure"],
    {
      errorMap: () => ({ message: "Please select a payment method" }),
    }
  ),
  // Generic notes — no specific financial account numbers or policy IDs in demo
  paymentNotes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
});

// ─── Section 5: General Notes & Consent ───────────────────────────────────────

export const generalNotesSchema = z.object({
  // High-level mobility/service notes only — no diagnosis codes or medications
  serviceNotes: z
    .string()
    .max(1000, "Notes cannot exceed 1,000 characters")
    .optional(),
  emergencyContactName: z
    .string()
    .max(100, "Name is too long")
    .optional(),
  emergencyContactPhone: z
    .string()
    .refine((val) => {
      if (!val || val.trim() === "") return true; // optional
      return phoneRegex.test(val);
    }, "Please enter a valid phone number")
    .optional(),
  // Consent is required — the checkbox must be checked before submission.
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms before submitting",
  }),
});

// ─── Full intake schema (all sections merged) ─────────────────────────────────

export const intakeFormSchema = aboutYouSchema
  .merge(aboutClientSchema)
  .merge(serviceNeedsSchema)
  .merge(paymentSchema)
  .merge(generalNotesSchema);

// ─── Types derived from schema ────────────────────────────────────────────────

export type AboutYouData = z.infer<typeof aboutYouSchema>;
export type AboutClientData = z.infer<typeof aboutClientSchema>;
export type ServiceNeedsData = z.infer<typeof serviceNeedsSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
export type GeneralNotesData = z.infer<typeof generalNotesSchema>;
export type IntakeFormData = z.infer<typeof intakeFormSchema>;

// ─── Ordered step schemas for per-step validation ─────────────────────────────

export const stepSchemas = [
  aboutYouSchema,
  aboutClientSchema,
  serviceNeedsSchema,
  paymentSchema,
  generalNotesSchema,
] as const;

export const STEP_TITLES = [
  "About You",
  "About the Client",
  "Service Needs",
  "Payment & Coverage",
  "Review & Submit",
] as const;

export type StepTitle = (typeof STEP_TITLES)[number];
