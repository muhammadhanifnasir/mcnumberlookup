"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner className="toaster group" richColors position="top-right" {...props} />;
};

export { Toaster };
