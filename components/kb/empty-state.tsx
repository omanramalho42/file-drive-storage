"use client"

import { SearchX, FolderOpen, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  variant: "search" | "folder" | "files"
  query?: string
  onAction?: () => void
  actionLabel?: string
}

export function EmptyState({ variant, query, onAction, actionLabel }: Props) {
  if (variant === "search") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-accent/10 blur-2xl" aria-hidden="true" />
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl folder-3d">
            <SearchX className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>
        <div className="max-w-sm">
          <h3 className="text-base font-semibold text-foreground">Nenhum resultado encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? (
              <>
                Não encontramos nada para <span className="text-foreground">&quot;{query}&quot;</span>. Tente outras palavras-chave ou verifique a ortografia.
              </>
            ) : (
              "Tente buscar com outras palavras-chave."
            )}
          </p>
        </div>
        {onAction && actionLabel && (
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    )
  }

  if (variant === "folder") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-full bg-accent/10 blur-2xl" aria-hidden="true" />
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl folder-3d">
            <FolderOpen className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>
        <div className="max-w-sm">
          <h3 className="text-base font-semibold text-foreground">Nenhuma pasta selecionada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecione uma pasta na barra lateral para ver seu conteúdo.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-accent/10 blur-2xl" aria-hidden="true" />
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl folder-3d">
          <FilePlus className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
      <div className="max-w-sm">
        <h3 className="text-base font-semibold text-foreground">Pasta vazia</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Adicione imagens, textos, CSVs ou vídeos para começar.
        </p>
      </div>
      {onAction && actionLabel && (
        <Button onClick={onAction} className="bg-accent text-accent-foreground hover:bg-accent/90">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
