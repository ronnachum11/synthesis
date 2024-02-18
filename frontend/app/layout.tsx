import "./globals.css";
import { Inter as FontSans } from "next/font/google";

import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Synthesis - News Reimagined</title>
        <link rel="icon" href="/synthesis.ico" />
      </head>
      <body
        className={cn(
          "min-h-screen w-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
