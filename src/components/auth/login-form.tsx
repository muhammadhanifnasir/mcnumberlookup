"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";

import { FormFieldError } from "./form-field-error";
import { PasswordField } from "./password-field";

const REMEMBERED_EMAIL_STORAGE_KEY = "dispatch_crm_remembered_email";

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_STORAGE_KEY);

    if (rememberedEmail) {
      setValue("email", rememberedEmail);
      setValue("rememberMe", true);
    }
  }, [setValue]);

  const rememberMe = watch("rememberMe");

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message || "Failed to sign in.");
        return;
      }

      if (values.rememberMe) {
        window.localStorage.setItem(REMEMBERED_EMAIL_STORAGE_KEY, values.email);
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_STORAGE_KEY);
      }

      toast.success("Signed in successfully.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="name@company.com" autoComplete="email" {...register("email")} />
        <FormFieldError message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordField id="password" placeholder="••••••••" autoComplete="current-password" {...register("password")} />
        <FormFieldError message={errors.password?.message} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-card-foreground">
          <Checkbox
            checked={rememberMe}
            onCheckedChange={(checked) => setValue("rememberMe", checked === true, { shouldDirty: true })}
            aria-label="Remember me"
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
