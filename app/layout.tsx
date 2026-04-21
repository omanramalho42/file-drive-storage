import type { Metadata } from "next";

import { ConvexClientProvider } from "./convex-client-provider";

import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/base/header";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/base/footer";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gerencie seus aqruivos",
  description: "Gerencie seus arquivos da melhor forma",
  icons: {
    icon: "/logo2.png",
    apple: "/logo2.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClerkProvider>
            <ConvexClientProvider>
              <Toaster />
              {children}
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}