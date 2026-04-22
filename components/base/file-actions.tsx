import { useOrganization } from "@clerk/nextjs"
import { Doc, Id } from "@/convex/_generated/dataModel"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Edit2Icon,
  FileIcon,
  MoreVertical,
  MoveIcon,
  StarHalf,
  StarIcon,
  TrashIcon,
  UndoIcon,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { RenameFileDialog } from "./rename-file-dialog"
import { MoveFileDialog } from "../kb/move-file-dialog"

export function FileCardActions({
  file,
  isFavorited,
}: {
  file: Doc<"files"> & { url: string | null }
  isFavorited: boolean
}) {
  const deleteFile = useMutation(api.files.deleteFile)
  const restoreFile = useMutation(api.files.restoreFile)
  const toggleFavorite = useMutation(api.files.toggleFavorite)
  const me = useQuery(api.users.getMe)

  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { membership } = useOrganization()
  const isOwner = file.userId === me?.id
  const isAdmin = membership?.role === "org:admin"

  const canDelete = isOwner || isAdmin
  return (
    <>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação marcará o arquivo para o nosso processo de exclusão. 
              Arquivos são excluídos periodicamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await deleteFile({
                  fileId: file.id,
                })
                toast.success("Seu arquivo será excluído em breve")
              }}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              if (!file.url) return
              window.open(file.url, "_blank")
            }}
            className="flex gap-1 items-center cursor-pointer"
          >
            <FileIcon className="w-4 h-4" /> Baixar
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault() // Importante para não fechar o menu antes de disparar a ação
              
              // O ID que o Convex gera e reconhece é o _id
              const targetId = file._id 
              
              console.log("ID utilizado para a mutation:", targetId)
              
              if (targetId) {
                toggleFavorite({ fileId: targetId })
              } else {
                console.error("Não foi possível encontrar o _id do arquivo.")
              }
            }}
            className="flex gap-1 items-center cursor-pointer"
          >
            {isFavorited ? (
              <div className="flex gap-1 items-center">
                <StarIcon className="w-4 h-4" /> Desfavoritar
              </div>
            ) : (
              <div className="flex gap-1 items-center">
                <StarHalf className="w-4 h-4" /> Favoritar
              </div>
            )}
          </DropdownMenuItem>
          
          <RenameFileDialog
            file={file}
            trigger={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()} // Importante para não fechar o menu prematuramente
                className="flex gap-1 items-center cursor-pointer"
              >
                <Edit2Icon className="w-4 h-4" /> Renomear
              </DropdownMenuItem>
            }
          />

          <MoveFileDialog
            file={file}
            trigger={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="flex gap-1 items-center cursor-pointer"
              >
                <MoveIcon className="w-4 h-4 mr-2" /> Mover
              </DropdownMenuItem>
            }
          />

          {canDelete && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  if (file.shouldDelete) {
                    restoreFile({
                      fileId: file._id,
                    })
                  } else {
                    setIsConfirmOpen(true)
                  }
                }}
                className="flex gap-1 items-center cursor-pointer"
              >
                {file.shouldDelete ? (
                  <div className="flex gap-1 text-green-600 items-center">
                    <UndoIcon className="w-4 h-4" /> Restaurar
                  </div>
                ) : (
                  <div className="flex gap-1 text-red-600 items-center">
                    <TrashIcon className="w-4 h-4" /> Deletar
                  </div>
                )}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}