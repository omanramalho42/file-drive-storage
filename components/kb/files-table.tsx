"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowLeftRight, Download, Trash2, Move } from "lucide-react";
import { FileKindIcon } from "./file-icon";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { MoveFilesDialog } from "./move-files-dialog"; // Importe seu novo dialog

const selectionSchema = z.object({
  selectedIds: z.array(z.string()),
});

interface Props {
  files: any[]; 
  onMove: (fileId: string) => void;
}

export function FilesTable({ files, onMove }: Props) {
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const deleteFile = useMutation(api.files.deleteFile);
  const deleteFiles = useMutation(api.files.deleteFiles);

  const { watch, setValue } = useForm({
    resolver: zodResolver(selectionSchema),
    defaultValues: { selectedIds: [] },
  });

  const selectedIds = watch("selectedIds");
  const isAllSelected = selectedIds.length === files.length && files.length > 0;

  const toggleAll = (checked: boolean) => {
    setValue("selectedIds", checked ? files.map((f) => f.id) : []);
  };

  const toggleOne = (id: string, checked: boolean) => {
    const current = selectedIds;
    setValue("selectedIds", checked ? [...current, id] : current.filter((i) => i !== id));
  };

  const handleDeleteSelected = async () => {
    await deleteFiles({ ids: selectedIds as any });
    toast.success("Arquivos excluídos com sucesso");
    setValue("selectedIds", []);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/40">
      {/* Barra de Ações */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-3 bg-secondary/30 border-b border-border">
          <span className="text-sm font-medium mr-2">{selectedIds.length} selecionados</span>
          
          <Button variant="outline" size="sm" onClick={() => setIsMoveOpen(true)}>
            <Move className="w-4 h-4 mr-2" /> Mover
          </Button>

          <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
        </div>
      )}

      {/* Header Responsivo */}
      <div className="grid grid-cols-[40px_1fr_auto] md:grid-cols-[40px_1fr_180px_120px_120px_40px] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground items-center">
        <Checkbox checked={isAllSelected} onCheckedChange={toggleAll} />
        <div>Nome</div>
        <div className="hidden md:block">Adicionado por</div>
        <div className="hidden md:block">Tamanho</div>
        <div className="hidden md:block">Data</div>
        <div />
      </div>

      {/* Rows */}
      <ul className="divide-y divide-border">
        {files.map((file) => (
          <li key={file.id} className="grid grid-cols-[40px_1fr_auto] md:grid-cols-[40px_1fr_180px_120px_120px_40px] items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-secondary/20">
            <Checkbox checked={selectedIds.includes(file.id)} onCheckedChange={(checked) => toggleOne(file.id, !!checked)} />
            
            <div className="flex min-w-0 items-center gap-3">
              <FileKindIcon type={file.kind} />
              <span className="truncate text-foreground">{file.name}</span>
            </div>

            <div className="hidden md:flex items-center gap-2 min-w-0">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-secondary text-[10px]">
                  {initials(file.addedBy.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-muted-foreground">
                {file.addedBy.email}
              </span>
            </div>

            <div className="hidden md:block text-muted-foreground">
              {formatSize(file.sizeKb)}
            </div>
            <div className="hidden md:block text-muted-foreground">
              {formatDate(file.addedAt)}
            </div>

            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onMove(file.id)}><ArrowLeftRight className="mr-2 h-4 w-4" /> Mover</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => file.url && window.open(file.url, "_blank")}><Download className="mr-2 h-4 w-4" /> Baixar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => deleteFile({ fileId: file.id })}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>
        ))}
      </ul>

      {/* Diálogo de Mover Múltiplos */}
      <MoveFilesDialog 
        isOpen={isMoveOpen} 
        onOpenChange={setIsMoveOpen} 
        fileIds={selectedIds}
        onSuccess={() => setValue("selectedIds", [])}
      />
    </div>
  );
}

// Helpers
function formatSize(kb: number) { return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(2)} MB`; }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }); }
function initials(name: string) { return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); }