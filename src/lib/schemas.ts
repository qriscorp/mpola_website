import { z } from "zod";

// ─── Auth Schemas ───
export const signInSchema = z.object({
  phoneOrEmail: z.string().min(1, "Phone number or email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});
export type SignInFormData = z.infer<typeof signInSchema>;

export const otpSchema = z.object({
  phone: z.string().min(10, "Valid phone number required"),
});
export type OtpFormData = z.infer<typeof otpSchema>;

export const registerIndividualSchema = z
  .object({
    accountType: z.literal("individual"),
    fullName: z.string().min(2, "Full legal name is required"),
    nin: z
      .string()
      .min(10, "Valid NIN required")
      .regex(/^[A-Z]{2}\d{7}[A-Z0-9]+$/i, "Invalid NIN format"),
    phone: z
      .string()
      .min(9, "Enter 9 digits (e.g. 772843901)")
      .regex(/^\d{9,10}$/, "Enter 9 digits without country code"),
    email: z.string().email("Valid email required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, { message: "You must agree to the terms" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type RegisterIndividualFormData = z.infer<
  typeof registerIndividualSchema
>;

export const registerBusinessSchema = z
  .object({
    accountType: z.literal("business"),
    fullName: z.string().min(2, "Full legal name required"),
    businessName: z.string().min(2, "Business name required"),
    registrationNumber: z.string().min(2, "Registration number required"),
    nin: z
      .string()
      .min(10, "Valid NIN required")
      .regex(/^[A-Z]{2}\d{7}[A-Z0-9]+$/i, "Invalid NIN format"),
    phone: z
      .string()
      .min(9, "Enter 9 digits (e.g. 772843901)")
      .regex(/^\d{9,10}$/, "Enter 9 digits without country code"),
    email: z.string().email("Valid email required"),
    password: z.string().min(8, "8+ characters required"),
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, { message: "You must agree to the terms" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type RegisterBusinessFormData = z.infer<typeof registerBusinessSchema>;

// ─── Loan Application Schemas ───
export const loanDetailsSchema = z.object({
  amount: z
    .number()
    .min(500000, "Minimum UGX 500,000")
    .max(50000000, "Maximum UGX 50,000,000"),
  duration: z.number().min(6).max(36),
  loanType: z.enum(["personal", "business"]),
  purpose: z.string().min(1, "Select a purpose"),
  description: z.string().optional(),
});
export type LoanDetailsFormData = z.infer<typeof loanDetailsSchema>;

export const guarantorSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  relationship: z.string().min(1, "Relationship required"),
  phone: z
    .string()
    .min(9, "Enter 9 digits")
    .regex(/^\d{9,10}$/, "Enter 9 digits without country code"),
  email: z.string().email("Valid email required"),
});
export type GuarantorFormData = z.infer<typeof guarantorSchema>;

// ─── Payment Schema ───
export const paymentSchema = z.object({
  method: z.enum(["Welend Wallet", "MTN MoMo", "Airtel Money"]),
  phone: z.string().optional(),
  amount: z.number().positive(),
});
export type PaymentFormData = z.infer<typeof paymentSchema>;

// ─── Wallet Top-Up Schema ───
export const topUpSchema = z.object({
  amount: z.number().min(1000, "Minimum UGX 1,000"),
  method: z.enum(["MTN MoMo", "Airtel", "Bank"]),
  phone: z
    .string()
    .min(9, "Enter 9 digits")
    .regex(/^\d{9,10}$/, "Enter 9 digits without country code"),
});
export type TopUpFormData = z.infer<typeof topUpSchema>;
