"use client";

import { type ComponentProps, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordFieldProps = Omit<ComponentProps<typeof Input>, "type">;

export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={isVisible ? "text" : "password"} />
      <Button
        type="button"
        variant="outline"
        size="default"
        className="absolute top-1/2 right-1 h-8 -translate-y-1/2 px-2"
        onClick={() => setIsVisible((value) => !value)}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="sr-only">Toggle password visibility</span>
      </Button>
    </div>
  );
}
