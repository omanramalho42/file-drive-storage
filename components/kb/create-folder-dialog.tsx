"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useState, useEffect } from "react"
import { FolderPlus } from "lucide-react"

import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrganization, useUser } from "@clerk/nextjs"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultParentId?: string | null
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  defaultParentId = null,
}: Props) {
  const { organization } = useOrganization()
  const { user } = useUser()

  const orgId = organization?.id ?? user?.id

  // ✅ pegar folders do Convex
  const folders = useQuery(
    api.folders.getFolders,
    orgId ? { orgId } : "skip"
  ) ?? []

  // ✅ mutation real
  const createFolder = useMutation(api.folders.createFolder)

  const [name, setName] = useState("")
  const [parentId, setParentId] = useState<string>(
    defaultParentId ?? "__root__"
  )

  useEffect(() => {
    if (open) {
      setName("")
      setParentId(defaultParentId ?? "__root__")
    }
  }, [open, defaultParentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !orgId) return

    await createFolder({
      name: name.trim(),
      orgId,
      parentId: parentId === "__root__" ? undefined : parentId,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-border sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <FolderPlus className="h-6 w-6" />
          </div>

          <DialogTitle className="text-center text-lg">
            Nova pasta
          </DialogTitle>

          <DialogDescription className="text-center text-sm text-muted-foreground">
            Organize seus arquivos criando uma nova pasta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {/* Nome */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Nome da pasta
            </Label>

            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Marketing"
              autoFocus
              required
            />
          </div>

          {/* Parent */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Pasta pai
            </Label>

            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Raiz" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="__root__">
                  Raiz (sem pasta pai)
                </SelectItem>

                {folders.map((f) => (
                  <SelectItem key={f._id} value={f._id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit">
              Criar pasta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}