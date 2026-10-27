import { z } from "zod";

export const signupApiSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Enter your full name"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  acceptTerms: z
    .boolean()
    .refine((value) => value === true, {
      message: "You must accept the Terms and Privacy Policy",
    }),
});

export const loginApiSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type SignupApiBody = z.infer<typeof signupApiSchema>;
export type LoginApiBody = z.infer<typeof loginApiSchema>;
