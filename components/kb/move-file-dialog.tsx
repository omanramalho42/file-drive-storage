"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { useOrganization, useUser } from "@clerk/nextjs"
import { ArrowLeftRight, Move } from "lucide-react" // Certifique-se de importar o ícone padrão
import { toast } from "sonner"
import { ReactNode } from "react" // Importação necessária

import { api } from "@/convex/_generated/api"
import { Id, Doc } from "@/convex/_generated/dataModel"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger, // Necessário importar
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

interface Props {
  file: Doc<"files"> // Recebendo o objeto arquivo completo
  trigger?: ReactNode // Agora opcional
}

export function MoveFileDialog({ file, trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const moveFile = useMutation(api.files.moveFile)

  const { organization, isLoaded: orgLoaded } = useOrganization()
  const { user, isLoaded: userLoaded } = useUser()

  let orgId: string | undefined = undefined
  if (orgLoaded && userLoaded) {
    orgId = organization?.id ?? user?.id
  }

  const folders = useQuery(api.folders.getFolders, orgId ? { orgId } : "skip") || []
  const [target, setTarget] = useState<string>("")

  useEffect(() => {
    if (isOpen) setTarget("")
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!target) return

    try {
      await moveFile({ 
        fileId: file._id as Id<"files">, 
        folderId: target as Id<"folders"> 
      })
      toast.success("Arquivo movido com sucesso!")
      setIsOpen(false)
    } catch (error) {
      toast.error("Erro ao mover arquivo")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Aqui a lógica para usar o trigger passado ou o padrão */}
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Move className="w-4 h-4" /> Mover
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <ArrowLeftRight className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-lg">Mover arquivo</DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Escolha a pasta de destino para <strong>{file?.name}</strong>
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
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Mover</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}