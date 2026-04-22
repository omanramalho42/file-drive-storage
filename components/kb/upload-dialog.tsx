"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrganization, useUser } from "@clerk/nextjs"

type FileType = "image" | "csv" | "pdf" | "text" | "video" | "doc"

function detectType(file: File): FileType {
  const t = file.type

  if (t.startsWith("image/")) return "image"
  if (t.startsWith("video/")) return "video"
  if (t === "text/csv" || file.name.endsWith(".csv")) return "csv"
  if (t === "application/pdf") return "pdf"
  if (t.startsWith("text/")) return "text"
  if (file.name.match(/\.(doc|docx)$/i)) return "doc"

  return "text"
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId?: string
}

interface QueuedFile {
  id: string
  file: File
  progress: number
  done: boolean
}

export function UploadDialog({ open, onOpenChange, folderId }: Props) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const createFile = useMutation(api.files.createFile)

  const { organization } = useOrganization()
  const { user } = useUser()

  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [dragOver, setDragOver] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const orgId = organization?.id ?? user?.id

  useEffect(() => {
    if (!open) setQueue([])
  }, [open])

  const uploadFile = async (q: QueuedFile) => {
    try {
      const url = await generateUploadUrl()
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": q.file.type },
        body: q.file,
      })
      const { storageId } = await result.json()

      await createFile({
        name: q.file.name,
        fileId: storageId,
        orgId: orgId!,
        type: detectType(q.file),
        folderId,
        sizeKb: Math.round(q.file.size / 1024),
      })

      setQueue((prev) =>
        prev.map((item) =>
          item.id === q.id ? { ...item, progress: 100, done: true } : item
        )
      )
    } catch (err) {
      console.error("Erro no upload:", err)
    }
  }
  
  const addFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files)
    
    for (const file of arr) {
      const q: QueuedFile = {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        done: false,
      }
      
      setQueue((prev) => [...prev, q])
      uploadFile(q) 
    }
  }

  const allDone = queue.length > 0 && queue.every((q) => q.done)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar arquivos</DialogTitle>
          <DialogDescription>
            Suporta imagens, vídeos, textos, CSV e PDF.
          </DialogDescription>
        </DialogHeader>

        {/* DROP */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            addFiles(e.dataTransfer.files)
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8",
            dragOver ? "border-primary bg-muted" : "border-border"
          )}
        >
          <Upload className="w-6 h-6" />
          <p className="text-sm">Arraste arquivos ou clique</p>

          <Button onClick={() => inputRef.current?.click()}>
            Selecionar
          </Button>

          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files!)}
          />
        </div>

        {/* LISTA */}
        {queue.map((q) => (
          <div key={q.id} className="mt-2">
            <div className="flex justify-between text-sm">
              <span>{q.file.name}</span>
              <span>{q.done ? "✅" : "..."}</span>
            </div>
            <Progress value={q.progress} />
          </div>
        ))}

        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>
            {allDone ? "Fechar" : "Cancelar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}