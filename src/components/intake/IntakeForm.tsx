"use client";

import { useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  intakeFormSchema,
  stepSchemas,
  STEP_TITLES,
  type IntakeFormData,
} from "@/lib/schemas/intake-schema";

import { ProgressIndicator } from "./ProgressIndicator";
import { SuccessState } from "./SuccessState";
import { ErrorState } from "./ErrorState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = STEP_TITLES.length;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SERVICE_TYPES = [
  "Personal Care (bathing, dressing, grooming)",
  "Companion Care (social activities, errands)",
  "Meal Preparation",
  "Light Housekeeping",
  "Transportation Assistance",
  "Medication Reminders",
  "Post-Surgery Recovery Support",
  "Respite Care (caregiver relief)",
  "Other / Not Sure",
];

// ─── Default form values ───────────────────────────────────────────────────────

const defaultValues: Partial<IntakeFormData> = {
  submitterFullName: "",
  relationship: "",
  phone: "",
  email: "",
  clientFullName: "",
  clientAge: "",
  city: "",
  county: "",
  generalServiceArea: "",
  typeOfService: "",
  daysNeeded: [],
  timeOfDay: undefined,
  preferredStartDate: "",
  priorityLevel: undefined,
  paymentMethod: undefined,
  paymentNotes: "",
  serviceNotes: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  consent: false,
};

// ─── Submission status ────────────────────────────────────────────────────────

type SubmitStatus = "idle" | "loading" | "success" | "error";

// ─── Main component ───────────────────────────────────────────────────────────

export function IntakeForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const submitterName = watch("submitterFullName");

  // ── Step navigation ──────────────────────────────────────────────────────────

  /**
   * Before advancing to the next step, we validate only the fields
   * belonging to the current step schema. This gives inline feedback
   * immediately without blocking fields on later steps.
   */
  const handleNext = useCallback(async () => {
    const currentSchema = stepSchemas[currentStep];
    const fieldNames = Object.keys(
      currentSchema.shape
    ) as (keyof IntakeFormData)[];

    const valid = await trigger(fieldNames);
    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
      // Scroll to top of the card so the user sees the new section
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, trigger]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Form submission ──────────────────────────────────────────────────────────

  const onSubmit = async (data: IntakeFormData) => {
    setSubmitStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // TODO: Include Cloudflare Turnstile token here:
        // body: JSON.stringify({ ...data, turnstileToken: turnstileToken }),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg =
          (errorData as { error?: string }).error ||
          `Server error (${response.status}). Please try again.`;
        throw new Error(msg);
      }

      setSubmitStatus("success");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      setErrorMessage(message);
      setSubmitStatus("error");
    }
  };

  const handleStartOver = () => {
    reset(defaultValues);
    setCurrentStep(0);
    setSubmitStatus("idle");
    setErrorMessage("");
  };

  const handleRetry = () => {
    setSubmitStatus("idle");
    setErrorMessage("");
  };

  // ── Render: success ──────────────────────────────────────────────────────────

  if (submitStatus === "success") {
    return (
      <SuccessState
        onStartOver={handleStartOver}
        submitterName={submitterName}
      />
    );
  }

  // ── Render: form steps ───────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Progress indicator */}
      <div className="mb-8">
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
        />
      </div>

      {/* Error banner */}
      {submitStatus === "error" && (
        <div className="mb-6">
          <ErrorState message={errorMessage} onRetry={handleRetry} />
        </div>
      )}

      {/* Step panels */}
      <div className="animate-slide-up">
        {currentStep === 0 && <StepAboutYou register={register} errors={errors} />}
        {currentStep === 1 && <StepAboutClient register={register} errors={errors} />}
        {currentStep === 2 && (
          <StepServiceNeeds
            register={register}
            control={control}
            errors={errors}
            watch={watch}
          />
        )}
        {currentStep === 3 && (
          <StepPayment register={register} errors={errors} watch={watch} />
        )}
        {currentStep === 4 && (
          <StepReviewAndSubmit
            register={register}
            control={control}
            errors={errors}
            watch={watch}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div
        className={cn(
          "flex mt-8 pt-6 border-t border-slate-200",
          currentStep === 0 ? "justify-end" : "justify-between"
        )}
      >
        {currentStep > 0 && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={submitStatus === "loading"}
          >
            ← Back
          </Button>
        )}

        {currentStep < TOTAL_STEPS - 1 ? (
          <Button type="button" onClick={handleNext}>
            Continue →
          </Button>
        ) : (
          <Button
            type="submit"
            isLoading={submitStatus === "loading"}
            disabled={submitStatus === "loading"}
          >
            {submitStatus === "loading" ? "Submitting…" : "Submit Request"}
          </Button>
        )}
      </div>
    </form>
  );
}

// ─── Step 1: About You ────────────────────────────────────────────────────────

function StepAboutYou({
  register,
  errors,
}: Pick<ReturnType<typeof useForm<IntakeFormData>>, "register"> & {
  errors: ReturnType<typeof useForm<IntakeFormData>>["formState"]["errors"];
}) {
  return (
    <div className="space-y-5">
      <SectionHeading
        step={1}
        title="About You"
        description="Tell us about the person submitting this request."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="submitterFullName" required>
            Your full name
          </Label>
          <Input
            id="submitterFullName"
            placeholder="Jane Smith"
            autoComplete="name"
            error={errors.submitterFullName?.message}
            {...register("submitterFullName")}
          />
        </div>

        <div>
          <Label htmlFor="relationship" required>
            Relationship to person needing care
          </Label>
          <Input
            id="relationship"
            placeholder="Adult child, spouse, self, etc."
            error={errors.relationship?.message}
            {...register("relationship")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="phone" required>
            Best phone number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 000-0000"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>

        <div>
          <Label htmlFor="email" required>
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: About the Client ─────────────────────────────────────────────────

function StepAboutClient({
  register,
  errors,
}: Pick<ReturnType<typeof useForm<IntakeFormData>>, "register"> & {
  errors: ReturnType<typeof useForm<IntakeFormData>>["formState"]["errors"];
}) {
  return (
    <div className="space-y-5">
      <SectionHeading
        step={2}
        title="About the Client"
        description="Tell us about the person who will be receiving care or services."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="clientFullName" required>
            Client&apos;s full name
          </Label>
          <Input
            id="clientFullName"
            placeholder="Robert Smith"
            error={errors.clientFullName?.message}
            {...register("clientFullName")}
          />
        </div>

        <div>
          <Label htmlFor="clientAge" required>
            Client&apos;s age
          </Label>
          <Input
            id="clientAge"
            type="number"
            min={1}
            max={120}
            placeholder="72"
            error={errors.clientAge?.message}
            {...register("clientAge")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="city" required>
            City
          </Label>
          <Input
            id="city"
            placeholder="Springfield"
            error={errors.city?.message}
            {...register("city")}
          />
        </div>

        <div>
          <Label htmlFor="county" required>
            County
          </Label>
          <Input
            id="county"
            placeholder="Shelby County"
            error={errors.county?.message}
            {...register("county")}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="generalServiceArea">
          General service area{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </Label>
        <Input
          id="generalServiceArea"
          placeholder="e.g. North side of Springfield, near downtown"
          error={errors.generalServiceArea?.message}
          {...register("generalServiceArea")}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          A neighborhood or landmark is enough — we&apos;ll confirm the exact location during intake.
        </p>
      </div>
    </div>
  );
}

// ─── Step 3: Service Needs ────────────────────────────────────────────────────

function StepServiceNeeds({
  register,
  control,
  errors,
  watch,
}: Pick<ReturnType<typeof useForm<IntakeFormData>>, "register" | "control" | "watch"> & {
  errors: ReturnType<typeof useForm<IntakeFormData>>["formState"]["errors"];
}) {
  const selectedDays = watch("daysNeeded") ?? [];

  return (
    <div className="space-y-5">
      <SectionHeading
        step={3}
        title="Service Needs"
        description="Help us understand the type of care and scheduling that works best."
      />

      <div>
        <Label htmlFor="typeOfService" required>
          Type of service needed
        </Label>
        <Select
          id="typeOfService"
          placeholder="Select a service type…"
          error={errors.typeOfService?.message}
          {...register("typeOfService")}
        >
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label required>Days needed</Label>
        {errors.daysNeeded && (
          <p role="alert" className="mb-2 text-xs text-red-600 flex items-center gap-1">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {errors.daysNeeded.message}
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <label
              key={day}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer text-sm",
                "transition-colors duration-150 select-none",
                selectedDays.includes(day)
                  ? "border-brand-500 bg-brand-50 text-brand-700 font-medium"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <input
                type="checkbox"
                value={day}
                className="sr-only"
                {...register("daysNeeded")}
              />
              {day.slice(0, 3)}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="timeOfDay">
            Preferred time of day{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </Label>
          <Select
            id="timeOfDay"
            placeholder="Select…"
            error={errors.timeOfDay?.message}
            {...register("timeOfDay")}
          >
            <option value="morning">Morning (6am – 12pm)</option>
            <option value="afternoon">Afternoon (12pm – 5pm)</option>
            <option value="evening">Evening (5pm – 9pm)</option>
            <option value="overnight">Overnight</option>
            <option value="flexible">Flexible</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="preferredStartDate">
            Preferred start date{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </Label>
          <Input
            id="preferredStartDate"
            type="date"
            error={errors.preferredStartDate?.message}
            {...register("preferredStartDate")}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="priorityLevel" required>
          Priority level
        </Label>
        <Controller
          name="priorityLevel"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Priority level">
              {(["low", "normal", "urgent"] as const).map((level) => {
                const labels: Record<string, { label: string; desc: string; color: string }> = {
                  low: {
                    label: "Low",
                    desc: "Planning ahead, flexible timeline",
                    color: field.value === "low" ? "border-teal-500 bg-teal-50 text-teal-700" : "",
                  },
                  normal: {
                    label: "Normal",
                    desc: "Within the next few weeks",
                    color: field.value === "normal" ? "border-brand-500 bg-brand-50 text-brand-700" : "",
                  },
                  urgent: {
                    label: "Urgent",
                    desc: "Need help very soon",
                    color: field.value === "urgent" ? "border-red-500 bg-red-50 text-red-700" : "",
                  },
                };
                const meta = labels[level];
                return (
                  <label
                    key={level}
                    className={cn(
                      "relative flex flex-col p-3 rounded-lg border-2 cursor-pointer",
                      "transition-all duration-150 select-none",
                      field.value === level
                        ? meta.color
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="radio"
                      value={level}
                      checked={field.value === level}
                      onChange={() => field.onChange(level)}
                      className="sr-only"
                    />
                    <span className="font-semibold text-sm">{meta.label}</span>
                    <span className="text-xs mt-0.5 opacity-75 leading-snug">{meta.desc}</span>
                  </label>
                );
              })}
            </div>
          )}
        />
        {errors.priorityLevel && (
          <p role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            {errors.priorityLevel.message}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Step 4: Payment & Coverage ───────────────────────────────────────────────

function StepPayment({
  register,
  errors,
  watch,
}: Pick<ReturnType<typeof useForm<IntakeFormData>>, "register" | "watch"> & {
  errors: ReturnType<typeof useForm<IntakeFormData>>["formState"]["errors"];
}) {
  const notes = watch("paymentNotes") ?? "";

  return (
    <div className="space-y-5">
      <SectionHeading
        step={4}
        title="Payment & Coverage"
        description="Understanding your payment situation helps us connect you with the right resources."
      />

      <div>
        <Label htmlFor="paymentMethod" required>
          Payment method
        </Label>
        <Select
          id="paymentMethod"
          placeholder="Select…"
          error={errors.paymentMethod?.message}
          {...register("paymentMethod")}
        >
          <option value="private_pay">Private Pay (out of pocket)</option>
          <option value="insurance">Long-Term Care Insurance</option>
          <option value="va_benefits">VA Benefits</option>
          <option value="medicaid">Medicaid / Medicaid Waiver</option>
          <option value="unsure">Not sure yet</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="paymentNotes">
          Additional notes{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </Label>
        <Textarea
          id="paymentNotes"
          placeholder="e.g. We have a long-term care policy through Acme Insurance. Policy #12345."
          maxLength={500}
          showCount
          value={notes}
          error={errors.paymentNotes?.message}
          {...register("paymentNotes")}
        />
      </div>

      {/* Privacy reminder */}
      <PrivacyWarning />
    </div>
  );
}

// ─── Step 5: General Notes & Review ──────────────────────────────────────────

function StepReviewAndSubmit({
  register,
  control,
  errors,
  watch,
}: Pick<ReturnType<typeof useForm<IntakeFormData>>, "register" | "control" | "watch"> & {
  errors: ReturnType<typeof useForm<IntakeFormData>>["formState"]["errors"];
}) {
  const serviceNotes = watch("serviceNotes") ?? "";

  return (
    <div className="space-y-5">
      <SectionHeading
        step={5}
        title="Review & Submit"
        description="Add any final notes, provide an emergency contact, and confirm your consent."
      />

      <div>
        <Label htmlFor="serviceNotes">
          Mobility or service notes{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </Label>
        <Textarea
          id="serviceNotes"
          placeholder="e.g. Uses a walker, needs help with stairs, prefers female caregiver."
          maxLength={1000}
          showCount
          value={serviceNotes}
          error={errors.serviceNotes?.message}
          {...register("serviceNotes")}
        />
      </div>

      {/* Privacy warning near notes fields */}
      <PrivacyWarning />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="emergencyContactName">
            Emergency contact name{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </Label>
          <Input
            id="emergencyContactName"
            placeholder="Mary Smith"
            error={errors.emergencyContactName?.message}
            {...register("emergencyContactName")}
          />
        </div>

        <div>
          <Label htmlFor="emergencyContactPhone">
            Emergency contact phone{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </Label>
          <Input
            id="emergencyContactPhone"
            type="tel"
            placeholder="(555) 000-0000"
            error={errors.emergencyContactPhone?.message}
            {...register("emergencyContactPhone")}
          />
        </div>
      </div>

      {/* Consent */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Consent &amp; Agreement
        </h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          By submitting this form, you confirm that the information provided is
          accurate to the best of your knowledge. You understand that Brightpath
          Home Care (demo) will use this information solely to contact you about
          care services. No data is stored or processed in this demo.
        </p>
        <Controller
          name="consent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="consent"
              label="I agree to the terms above and consent to being contacted."
              checked={field.value}
              onChange={field.onChange}
              error={errors.consent?.message}
            />
          )}
        />
      </div>
    </div>
  );
}

// ─── Shared: Section heading ──────────────────────────────────────────────────

function SectionHeading({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
          {step}
        </span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

// ─── Shared: Privacy warning ──────────────────────────────────────────────────

function PrivacyWarning() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <svg
        className="h-4 w-4 text-amber-500 shrink-0 mt-0.5"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-xs text-amber-800 leading-relaxed">
        <strong>Demo form only.</strong> Do not enter real medical, financial,
        or sensitive personal information. This project is a portfolio
        demonstration — no data is stored or transmitted to any server.
      </p>
    </div>
  );
}
