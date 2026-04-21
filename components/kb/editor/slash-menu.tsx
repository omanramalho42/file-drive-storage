"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Type,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  type: any
  label: string
  description: string
  icon: typeof Heading1
}

const OPTIONS: Option[] = [
  { type: "paragraph", label: "Texto", description: "Comece a escrever com texto simples", icon: Type },
  { type: "heading1", label: "Título 1", description: "Título grande de seção", icon: Heading1 },
  { type: "heading2", label: "Título 2", description: "Título médio de seção", icon: Heading2 },
  { type: "heading3", label: "Título 3", description: "Título pequeno de seção", icon: Heading3 },
  { type: "bulleted", label: "Lista com marcadores", description: "Crie uma lista com bullets", icon: List },
  { type: "numbered", label: "Lista numerada", description: "Crie uma lista ordenada", icon: ListOrdered },
  { type: "todo", label: "Lista de tarefas", description: "Marque itens conforme avança", icon: CheckSquare },
  { type: "quote", label: "Citação", description: "Destaque uma citação", icon: Quote },
  { type: "divider", label: "Divisor", description: "Separador visual", icon: Minus },
]

interface Props {
  query?: string
  onSelect: (type: any) => void
  onClose: () => void
}

export function SlashMenu({ query, onSelect, onClose }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const q = query?.replace(/^\//, "").trim().toLowerCase()
    if (!q) return OPTIONS
    return OPTIONS.filter((o) => o.label.toLowerCase().includes(q))
  }, [query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const option = filtered[activeIndex]
        if (option) onSelect(option.type)
      } else if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener("keydown", handler, true)
    return () => window.removeEventListener("keydown", handler, true)
  }, [filtered, activeIndex, onSelect, onClose])

  if (filtered.length === 0) {
    return (
      <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-popover p-3 text-sm text-muted-foreground shadow-lg">
        Nenhum bloco encontrado
      </div>
    )
  }

  return (
    <div
      ref={listRef}
      className="absolute left-0 top-full z-50 mt-1 max-h-80 w-80 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-xl"
    >
      <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Blocos básicos
      </div>
      {filtered.map((option, idx) => {
        const Icon = option.icon
        const active = idx === activeIndex
        return (
          <button
            key={option.type}
            type="button"
            onMouseEnter={() => setActiveIndex(idx)}
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect(option.type)
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm transition-colors",
              active ? "bg-secondary" : "hover:bg-secondary/50",
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card">
              <Icon className="h-4 w-4 text-foreground" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-foreground">{option.label}</span>
              <span className="truncate text-xs text-muted-foreground">{option.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
