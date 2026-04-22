"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit2Icon, TrashIcon, MoveIcon } from "lucide-react";
import { RenameFolderDialog } from "@/components/base/rename-folder-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoveFolderDialog } from "../kb/move-folder-dialog";

export function FolderActions({ folder }: { folder: Doc<"folders"> }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteFolder = useMutation(api.folders.deleteFolder);

  return (
    <>
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta pasta?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                await deleteFolder({ folderId: folder.id });
                toast.success("Pasta excluída com sucesso!");
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="
              p-1 
              rounded 
              transition-colors 
              hover:bg-secondary 
              text-muted-foreground 
              hover:text-foreground
            "
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <RenameFolderDialog
            folder={folder}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit2Icon className="w-4 h-4 mr-2" /> Renomear
              </DropdownMenuItem>
            }
          />
          <MoveFolderDialog
            folder={folder}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <MoveIcon className="w-4 h-4 mr-2" /> Mover
              </DropdownMenuItem>
            }
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => setIsDeleteOpen(true)}
          >
            <TrashIcon className="w-4 h-4 mr-2" /> Excluir
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}