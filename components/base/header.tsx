"use client"

import React from "react"
import {
  OrganizationSwitcher,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs"
import { Button } from "../ui/button"
import { Authenticated, Unauthenticated } from "convex/react"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between px-20 py-4">
        {/* Logo */}
        <div className="font-semibold text-foreground">FileDrive</div>

        {/* Ações */}
        <div className="flex items-center gap-4">

          {/* Switch Theme */}
          <button
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Alternar tema"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Clerk */}
          <div className="flex items-center gap-2">
            <OrganizationSwitcher />
            <UserButton />
          </div>

          {/* Auth */}
          <Unauthenticated>
            <SignInButton>
              <Button>Entrar</Button>
            </SignInButton>
          </Unauthenticated>

          <Authenticated>
            <SignOutButton>
              <Button variant="outline">Sair</Button>
            </SignOutButton>
          </Authenticated>
        </div>
      </div>
    </header>
  )
}

export default Header