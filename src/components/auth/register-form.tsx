"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";

import { FormFieldError } from "./form-field-error";
import { PasswordField } from "./password-field";

export function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      password: "",
      role: undefined,
    },
  });

  const role = watch("role");

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error, data } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            company_name: values.companyName,
            role: values.role,
          },
        },
      });

      if (error) {
        toast.error(error.message || "Failed to register account.");
        return;
      }

      if (data.session) {
        toast.success("Account created successfully.");
        router.push("/dashboard");
      } else {
        toast.success("Account created. Please check your email to confirm your account.");
        router.push("/login");
      }

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
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" placeholder="John Doe" autoComplete="name" {...register("fullName")} />
        <FormFieldError message={errors.fullName?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" placeholder="Acme Dispatch" autoComplete="organization" {...register("companyName")} />
        <FormFieldError message={errors.companyName?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="registerEmail">Email</Label>
        <Input id="registerEmail" placeholder="name@company.com" autoComplete="email" {...register("email")} />
        <FormFieldError message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="registerPassword">Password</Label>
        <PasswordField
          id="registerPassword"
          placeholder="Create a strong password"
          autoComplete="new-password"
          {...register("password")}
        />
        <FormFieldError message={errors.password?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(value) => {
            if (value === "admin" || value === "dispatcher") {
              setValue("role", value, { shouldValidate: true });
            }
          }}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">admin</SelectItem>
            <SelectItem value="dispatcher">dispatcher</SelectItem>
          </SelectContent>
        </Select>
        <FormFieldError message={errors.role?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
