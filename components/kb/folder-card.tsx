"use client"

import { cn } from "@/lib/utils"
import { FileText } from "lucide-react"

interface FolderCardProps {
  folder: any
  fileCount: number
  onClick?: () => void
  active?: boolean
}

const integrationLabels: Record<string, { label: string; bg: string }> = {
  drive: { label: "G", bg: "bg-yellow-500/90" },
  notion: { label: "N", bg: "bg-zinc-800" },
  slack: { label: "S", bg: "bg-purple-500/90" },
  word: { label: "W", bg: "bg-blue-600/90" },
  ppt: { label: "P", bg: "bg-orange-500/90" },
  figma: { label: "F", bg: "bg-pink-500/90" },
}

export function FolderCard({ folder, fileCount, onClick, active }: FolderCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col items-start gap-3 rounded-2xl p-4 text-left transition-all",
        "folder-3d hover:-translate-y-0.5 hover:shadow-2xl",
        active && "ring-2 ring-accent/60",
      )}
    >
      {/* Folder illustration */}
      <div className="relative mx-auto h-32 w-full">
        {/* tab */}
        <div
          className="absolute left-3 top-0 h-3 w-20 rounded-t-lg folder-3d-tab"
          aria-hidden="true"
        />
        {/* back of folder */}
        <div
          className="absolute inset-x-0 top-2 bottom-0 rounded-xl folder-3d-tab"
          aria-hidden="true"
        />
        {/* paper sheets peeking */}
        {fileCount > 0 && (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 flex -space-x-2 rotate-[-4deg]">
            <div className="h-16 w-12 rounded-md bg-zinc-100/95 shadow-md" />
            <div className="h-16 w-12 rounded-md bg-zinc-200/90 shadow-md rotate-3" />
            {fileCount > 1 && (
              <div className="h-16 w-12 rounded-md bg-white/80 shadow-md rotate-6 flex items-end justify-center pb-1">
                <span className="text-[8px] font-bold text-zinc-500">PDF</span>
              </div>
            )}
          </div>
        )}
        {/* front of folder */}
        <div
          className="absolute inset-x-0 bottom-0 top-6 rounded-xl folder-3d border-t border-white/5"
          aria-hidden="true"
        >
          {folder.integrations && folder.integrations.length > 0 && (
            <div className="absolute bottom-2 left-2 flex -space-x-1.5">
              {folder.integrations.slice(0, 3).map((key: number) => {
                const meta = integrationLabels[key]
                if (!meta) return null
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white ring-2 ring-zinc-900",
                      meta.bg,
                    )}
                  >
                    {meta.label}
                  </div>
                )
              })}
            </div>
          )}
          {fileCount === 0 && (
            <div className="flex h-full items-center justify-center">
              <FileText className="h-6 w-6 text-zinc-600" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="text-sm font-medium text-foreground truncate">{folder.name}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {fileCount} {fileCount === 1 ? "arquivo" : "arquivos"}
        </div>
      </div>
    </button>
  )
}
