import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/utils/constants";

export default function SignInPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{APP_NAME}</p>
        <h1 className="text-2xl font-semibold text-card-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Authentication-ready UI placeholder for Supabase auth flows.</p>
      </div>
      <div className="space-y-3">
        <Button className="w-full">Continue with Email</Button>
        <Button variant="outline" className="w-full">
          Continue with Google
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Demo access for local previews can be enabled with NEXT_PUBLIC_DEV_AUTH_BYPASS=true.
      </p>
      <Link href="/dashboard" className="inline-block text-sm font-medium text-primary hover:underline">
        Try dashboard route
      </Link>
    </div>
  );
}
