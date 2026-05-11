import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/utils/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Trucking dispatch CRM foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
