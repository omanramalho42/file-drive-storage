// components/layout/header.tsx
"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { OrganizationSwitcher, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Authenticated, Unauthenticated } from "convex/react";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 w-full items-center justify-between border-b bg-background px-4">
      {/* Lado Esquerdo: Menu Mobile + Logo/Título */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden">
          <Menu className="h-6 w-6" />
        </button>
        <span className="hidden sm:block font-semibold">Dashboard</span>
      </div>

      {/* Lado Direito: Ações (Clerk + Theme) */}
      <div className="flex items-center gap-2">
        <OrganizationSwitcher afterCreateOrganizationUrl="/dashboard" />
        
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-md hover:bg-secondary"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <Authenticated>
          <UserButton />
        </Authenticated>
        
        <Unauthenticated>
          <SignInButton mode="modal">
            <Button size="sm">Entrar</Button>
          </SignInButton>
        </Unauthenticated>
      </div>
    </header>
  );
}