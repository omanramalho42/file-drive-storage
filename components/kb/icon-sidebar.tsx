"use client"

import {
  Home,
  Database,
  ArrowLeftRight,
  BarChart3,
  Settings,
  FileIcon,
  StarIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  {
    id: "home",
    label: "Início",
    icon: Home,
    href: "/dashboard/home",
    // TODO: ainda não possui página própria (ajustar quando existir)
  },
  {
    id: "kb",
    label: "Knowledge Base",
    icon: Database,
    href: "/dashboard/kb",
    // TODO: ainda não possui página própria
  },
  {
    id: "transfers",
    label: "Transferências",
    icon: ArrowLeftRight,
    href: "/dashboard/transfers",
    // TODO: ainda não possui página própria
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    // TODO: ainda não possui página própria
  },

  // Rotas vindas do SideNav
  {
    id: "files",
    label: "All Files",
    icon: FileIcon,
    href: "/dashboard/files",
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: StarIcon,
    href: "/dashboard/favorites",
  },
]

export function IconSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex h-full w-14 flex-col items-center justify-between border-r border-border bg-background py-4"
      aria-label="Navegação principal"
    >
      <div className="flex flex-col items-center gap-1">
        {/* Logo */}
        <div className="mb-4 flex h-9 w-9 items-center justify-center">
          <div
            className="h-7 w-7 rounded-md bg-linear-to-br from-zinc-200 to-zinc-400 shadow-md"
            aria-label="Logo"
            style={{
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />
        </div>

        <nav className="flex flex-col items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.includes(item.href)

            return (
              <Link key={item.id} href={item.href} aria-label={item.label}>
                <div
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Configurações (sem rota definida ainda) */}
      <button
        type="button"
        aria-label="Configurações"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        // TODO: criar rota /dashboard/settings
      >
        <Settings className="h-4.5 w-4.5" />
      </button>
    </aside>
  )
}