import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@/utils/constants";

import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "FMCSA SAFER MC carrier importer and extraction system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
