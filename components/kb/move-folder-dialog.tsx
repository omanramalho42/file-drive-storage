"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganization, useUser } from "@clerk/nextjs";

export function MoveFolderDialog({ folder, trigger }: { folder: Doc<"folders">; trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetId, setTargetId] = useState<string>("");
  const moveFolder = useMutation(api.folders.moveFolder);
  const { organization } = useOrganization()
  const { user } = useUser()

  const orgId = organization?.id ?? user?.id

  // ✅ pegar folders do Convex
  const folders = useQuery(
    api.folders.getFolders,
    orgId ? { orgId } : "skip"
  ) ?? []

  async function handleMove() {
    await moveFolder({ 
      folderId: folder.id, 
      parentId: targetId === "root" ? undefined : (targetId as Id<"folders">) 
    });
    toast.success("Pasta movida!");
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>
          Mover pasta
        </DialogTitle></DialogHeader>
        <Select value={targetId} onValueChange={setTargetId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a pasta destino" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="root">Raiz (Nível principal)</SelectItem>
            {folders
              .filter(f => f._id !== folder._id) // Não pode mover para si mesma
              .map((f, key) => (
                <SelectItem key={key} value={f._id}>
                  {f.name}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button onClick={handleMove}>Mover</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}