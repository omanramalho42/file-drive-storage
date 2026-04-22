"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { ArrowLeftRight, Check, Plus } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fileIds: string[];
  onSuccess?: () => void;
}

export function MoveFilesDialog({
  isOpen,
  onOpenChange,
  fileIds,
  onSuccess,
}: Props) {
  const moveFiles = useMutation(api.files.moveFiles);
  const createFolder = useMutation(api.folders.createFolder);

  const { organization } = useOrganization();
  const { user } = useUser();

  const orgId = organization?.id ?? user?.id;

  const folders =
    useQuery(api.folders.getFolders, orgId ? { orgId } : "skip") || [];

  const [target, setTarget] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTarget("");
      setSearch("");
    }
  }, [isOpen]);

  const filteredFolders = folders.filter((f: any) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateFolder = async () => {
    if (!search.trim()) return;

    const id = await createFolder({
      name: search.trim(),
      orgId: orgId!,
    });
    //⚠️
    setTarget(id!);
    toast.success("Pasta criada com sucesso!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!target || fileIds.length === 0) return;

    try {
      await moveFiles({
        ids: fileIds as Id<"files">[],
        folderId: target as Id<"folders">,
      });

      toast.success(`${fileIds.length} arquivos movidos com sucesso!`);

      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao mover arquivos");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <ArrowLeftRight className="h-6 w-6" />
          </div>

          <DialogTitle className="text-center text-lg">
            Mover arquivos
          </DialogTitle>

          <DialogDescription className="text-center text-sm text-muted-foreground">
            Movendo <strong>{fileIds.length}</strong> arquivos selecionados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {/* COMMAND */}
          <div className="flex flex-col gap-2">
            <Command className="rounded-lg border">
              <CommandInput
                placeholder="Buscar ou criar pasta..."
                value={search}
                onValueChange={setSearch}
              />

              <CommandList>
                <CommandEmpty>
                  <div className="flex flex-col gap-2 p-2">
                    <span className="text-sm text-muted-foreground">
                      Nenhuma pasta encontrada
                    </span>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleCreateFolder}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar "{search}"
                    </Button>
                  </div>
                </CommandEmpty>

                <CommandGroup heading="Pastas">
                  {filteredFolders.map((f: any) => (
                    <CommandItem
                      key={f._id}
                      value={f.name}
                      onSelect={() => setTarget(f._id)}
                    >
                      <span>{f.name}</span>

                      {target === f._id && (
                        <Check className="ml-auto w-4 h-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>

            {target && (
              <p className="text-xs text-muted-foreground">
                Pasta selecionada ✔
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={!target}>
              Mover
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}