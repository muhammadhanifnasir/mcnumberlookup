import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean(),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  companyName: z.string().trim().min(2, "Company name must be at least 2 characters."),
  email: z.email("Please enter a valid email."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
    .regex(/[a-z]/, "Password must include at least one lowercase letter.")
    .regex(/[0-9]/, "Password must include at least one number."),
  role: z.enum(["admin", "dispatcher"], { message: "Please select a role." }),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
