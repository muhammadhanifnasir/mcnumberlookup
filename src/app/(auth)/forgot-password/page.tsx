import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we'll send a reset link."
      footerText="Remember your password?"
      footerLinkLabel="Back to sign in"
      footerLinkHref="/login"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
