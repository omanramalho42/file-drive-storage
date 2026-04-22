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
  name: z.string().min(1, "O nome é obrigatório").max(200),
});

type FormData = z.infer<typeof formSchema>;

export function RenameFileDialog({
  file,
  trigger,
}: {
  file: Doc<"files"> & { url: string | null };
  trigger?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const renameFile = useMutation(api.files.renameFile);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: file.name },
  });

  async function onSubmit(values: FormData) {
    await renameFile({ fileId: file._id, newName: values.name });
    toast.success("Arquivo renomeado com sucesso!");
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Se o trigger for fornecido, ele envolve o conteúdo. Se não, usamos o padrão. */}
      <DialogTrigger asChild>
        {trigger || (
          <div className="flex gap-1 items-center cursor-pointer">
            <Edit2Icon className="w-4 h-4" /> Renomear
          </div>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renomear arquivo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Novo nome</FieldLabel>
            <Input
              id="name"
              placeholder="Digite o novo nome"
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