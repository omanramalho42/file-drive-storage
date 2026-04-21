"use client"

import Link from "next/link"
import { ArrowLeft, FileText, MoreHorizontal } from "lucide-react"
import { NotionEditor } from "@/components/kb/editor/notion-editor"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconSidebar } from "@/components/kb/icon-sidebar"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrganization, useUser } from "@clerk/nextjs"

interface Props {
  docId: string
}

export function DocPageClient({ docId }: Props) {
  const { organization } = useOrganization()
  const { user } = useUser()

  const orgId = organization?.id ?? user?.id

  const docsList = useQuery(
    api.docs.getDocs,
      orgId ? { orgId } : "skip"
    ) ?? []
  const doc = docsList.find((d) => d._id === docId)
  // ✅ pegar folders do Convex
  const files = useQuery(
    api.files.getFiles,
    orgId ? { orgId } : "skip"
  ) ?? []
  // ✅ pegar folders do Convex
  const folders = useQuery(
    api.folders.getFolders,
    orgId ? { orgId } : "skip"
  ) ?? []
  const file = files.find(
    (f) => f.docId === docId
  )
  const folder = folders.find((f) => 
    f._id === file?.folderId
  )

  if (!doc) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-card">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Documento não encontrado</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Este documento pode ter sido removido ou o link está inválido.
          </p>
          <Button asChild variant="secondary" size="sm" className="mt-2">
            <Link href="/">Voltar para a Knowledge Base</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <IconSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Knowledge Base
              </Link>
            </Button>
            {folders && (
              <>
                <span className="text-border">/</span>
                <Link
                  href="/"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {folder?.name}
                </Link>
              </>
            )}
            <span className="text-border">/</span>
            <span className="flex items-center gap-1.5 text-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="max-w-65 truncate">{doc.title || "Sem título"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Salvo {new Date(doc.updatedAt).toLocaleString("pt-BR")}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Mais opções">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem disabled>Duplicar</DropdownMenuItem>
                <DropdownMenuItem disabled>Exportar</DropdownMenuItem>
                <DropdownMenuItem disabled>Mover</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Editor */}
        <div className="scrollbar-thin flex-1 overflow-y-auto">
          <NotionEditor doc={doc} />
        </div>
      </main>
    </div>
  )
}
