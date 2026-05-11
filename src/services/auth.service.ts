import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppSession } from "@/types/auth";

const isDevBypassEnabled =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

const demoSession: AppSession = {
  userId: "demo-user",
  email: "dispatcher@dispatchcrm.com",
  role: "dispatcher",
  fullName: "Demo Dispatcher",
};

export async function getAppSession(): Promise<AppSession | null> {
  if (isDevBypassEnabled) {
    return demoSession;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    role: user.user_metadata?.role,
    fullName: user.user_metadata?.full_name,
    companyName: user.user_metadata?.company_name,
  };
}

export async function requireDashboardSession() {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
