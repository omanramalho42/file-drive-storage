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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useState, useEffect } from "react"
import { ArrowLeftRight } from "lucide-react"

import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import { useOrganization, useUser } from "@clerk/nextjs"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileId: string | null
}

export function MoveFileDialog({ open, onOpenChange, fileId }: Props) {
  const moveFile = useMutation(api.files.moveFile)

  // ✅ PEGAR ORG ID CORRETAMENTE
  const { organization, isLoaded: orgLoaded } = useOrganization()
  const { user, isLoaded: userLoaded } = useUser()

  let orgId: string | undefined = undefined

  if (orgLoaded && userLoaded) {
    orgId = organization?.id ?? user?.id
  }

  // ✅ Query segura (evita erro quando orgId ainda não carregou)
  const folders =
    useQuery(api.folders.getFolders, orgId ? { orgId } : "skip") || []

  const [target, setTarget] = useState<string>("")

  useEffect(() => {
    if (open) setTarget("")
  }, [open])

  if (!fileId) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!target) {
      onOpenChange(false)
      return
    }

    await moveFile({
      fileId: fileId as any,
      newFolderId: target,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <ArrowLeftRight className="h-6 w-6" />
          </div>

          <DialogTitle className="text-center text-lg">
            Mover arquivo
          </DialogTitle>

          <DialogDescription className="text-center text-sm text-muted-foreground">
            Escolha a pasta de destino
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Pasta de destino
            </Label>

            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma pasta" />
              </SelectTrigger>

              <SelectContent>
                {folders.map((f: any) => (
                  <SelectItem key={f._id} value={f._id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit">
              Mover
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}