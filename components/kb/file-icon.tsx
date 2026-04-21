import {
  FileText,
  FileSpreadsheet,
  FileVideo,
  FileImage,
  File as FileIcon,
  FileType,
} from "lucide-react"

import { cn } from "@/lib/utils"

// 🔥 usa o mesmo tipo do backend
export type FileType =
  | "image"
  | "csv"
  | "pdf"
  | "text"
  | "video"
  | "doc"

interface FileIconProps {
  type?: FileType | null
  className?: string
}

const fileConfig = {
  image: {
    icon: FileImage,
    className: "text-emerald-400",
    label: "Imagem",
  },
  video: {
    icon: FileVideo,
    className: "text-rose-400",
    label: "Vídeo",
  },
  csv: {
    icon: FileSpreadsheet,
    className: "text-green-400",
    label: "CSV",
  },
  text: {
    icon: FileText,
    className: "text-sky-400",
    label: "Texto",
  },
  doc: {
    icon: FileType,
    className: "text-blue-400",
    label: "Documento",
  },
  pdf: {
    icon: FileText,
    className: "text-red-400",
    label: "PDF",
  },
} as const

export function FileKindIcon({ type, className }: FileIconProps) {
  const base = cn("h-4 w-4 shrink-0", className)

  const config = type ? fileConfig[type] : null

  if (!config) {
    return <FileIcon className={base} />
  }

  const Icon = config.icon

  return <Icon className={cn(base, config.className)} />
}

export function fileTypeLabel(type?: FileType | null): string {
  if (!type || !fileConfig[type]) {
    return "Arquivo"
  }

  return fileConfig[type].label
}