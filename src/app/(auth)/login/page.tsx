import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to access your dispatch dashboard."
      footerText="Don't have an account?"
      footerLinkLabel="Create one"
      footerLinkHref="/register"
    >
      <LoginForm />
    </AuthShell>
  );
}
