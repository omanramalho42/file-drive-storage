import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Doc } from "@/convex/_generated/dataModel";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Edit2Icon } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "O nome da pasta é obrigatório").max(200),
});

type FormData = z.infer<typeof formSchema>;

export function RenameFolderDialog({
  folder,
  trigger,
}: {
  folder: Doc<"folders">;
  trigger?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const renameFolder = useMutation(api.folders.renameFolder);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: folder.name },
  });

  async function onSubmit(values: FormData) {
    await renameFolder({ folderId: folder.id, name: values.name });
    toast.success("Pasta renomeada com sucesso!");
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="flex gap-1 items-center cursor-pointer">
            <Edit2Icon className="w-4 h-4" /> Renomear pasta
          </div>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renomear pasta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="folderName">Novo nome da pasta</FieldLabel>
            <Input
              id="folderName"
              placeholder="Digite o novo nome da pasta"
              {...register("name")}
            />
            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}