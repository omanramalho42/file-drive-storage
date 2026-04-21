"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  FileText,
  FileSpreadsheet,
  Video,
  File,
  Play,
} from "lucide-react";
import Image from "next/image";

interface Props {
  type: Doc<"files">["type"];
  url?: string | null;
  name: string;
  className?: string;
}

export function FileKindIcon({ type, url, name, className }: Props) {
  // IMAGEM: Exibe o conteúdo real
  if (type === "image" && url) {
    return (
      <div className={cn("file-preview-image", className)}>
        <Image src={url} alt={name} fill className="object-cover" />
      </div>
    );
  }

  // VIDEO: Design com Play Icon centralizado
  if (type === "video") {
    return (
      <div className={cn("file-preview-video", className)}>
        <Play className="h-8 w-8 text-white fill-white opacity-80" />
      </div>
    );
  }

  // DOC / TEXT: Design de linhas (estilo "documento")
  if (type === "text" || type === "doc") {
    return (
      <div className={cn("file-preview-text flex-col p-4 gap-2", className)}>
        <div className="w-full h-2 bg-white/30 rounded-full" />
        <div className="w-3/4 h-2 bg-white/30 rounded-full" />
        <div className="w-1/2 h-2 bg-white/30 rounded-full" />
      </div>
    );
  }

  // FALLBACK
  return (
    <div className={cn("file-preview-fallback", className)}>
      <File className="h-10 w-10 text-white/50" />
    </div>
  );
}