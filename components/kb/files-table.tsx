"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowLeftRight, Download, Trash2 } from "lucide-react"
import { FileKindIcon } from "./file-icon"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface Props {
  files: any[] // 👉 ou tipa melhor depois com o retorno do getFiles
  onMove: (fileId: string) => void
}

function formatSize(kb: number) {
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(2)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function FilesTable({ files, onMove }: Props) {
  // ✅ Convex mutation
  const deleteFile = useMutation(api.files.deleteFile)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40">
      {/* Header */}
      <div className="grid grid-cols-[1fr_180px_120px_120px_40px] gap-4 border-b border-border px-5 py-3 text-xs font-medium text-muted-foreground">
        <div>Name</div>
        <div>Added By</div>
        <div className="hidden md:block">Size</div>
        <div className="hidden md:block">Date</div>
        <div />
      </div>

      {/* Rows */}
      <ul className="divide-y divide-border">
        {files.map((file) => (
          <li
            key={file.id}
            className="grid grid-cols-[1fr_180px_120px_120px_40px] items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-secondary/30"
          >
            <div className="flex min-w-0 items-center gap-3">
              <FileKindIcon type={file.kind} />
              <span className="truncate text-foreground">{file.name}</span>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-secondary text-[10px] text-foreground">
                  {initials(file.addedBy.name)}
                </AvatarFallback>
              </Avatar>

              <span className="truncate text-muted-foreground">
                {file.addedBy.email || "—"}
              </span>
            </div>

            <div className="hidden text-muted-foreground md:block">
              {formatSize(file.sizeKb)}
            </div>

            <div className="hidden text-muted-foreground md:block">
              {formatDate(file.addedAt)}
            </div>

            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onMove(file.id)}>
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Mover
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      if (file.url) window.open(file.url, "_blank")
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteFile({ fileId: file.id })}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}