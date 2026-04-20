"use client";

import { useState } from "react"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

import { toast } from "sonner";

import { Doc } from "../../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .any()
    .refine((files) => {
      if (typeof window === "undefined") return true; // SSR safe
      return files instanceof FileList && files.length > 0;
    }, "Required"),
});

export function UploadButton() {
  const organization = useOrganization();
  const user = useUser();

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFile = useMutation(api.files.createFile);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) {
      toast.error("Organização não encontrada");
      return;
    }

    try {
      const postUrl = await generateUploadUrl();

      const fileType = values.file[0].type;
    
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": fileType },
        body: values.file[0],
      });

      const { storageId } = await result.json();
      const types = {
        "image/png": "image",
        "application/pdf": "pdf",
        "text/csv": "csv",
      } as Record<string, Doc<"files">["type"]>;

      await createFile({
        name: values.title,
        fileId: storageId,
        type: types[fileType],
        orgId,
      });

      form.reset();
      setIsFileDialogOpen(false);

      toast.success("Arquivo enviado com sucesso 🚀");
    } catch (err) {
      toast.error("Erro ao enviar arquivo");
    }
  }

  return (
    <Dialog
      open={isFileDialogOpen}
      onOpenChange={(isOpen) => {
        setIsFileDialogOpen(isOpen);
        form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>Upload File</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-8">
            Upload your File Here
          </DialogTitle>
          <DialogDescription>
            This file will be accessible by anyone in your organization
          </DialogDescription>
        </DialogHeader>

        <div>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FieldGroup>
              {/* TITLE */}
              <Field data-invalid={!!form.formState.errors.title}>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  {...form.register("title")}
                  aria-invalid={!!form.formState.errors.title}
                />
                <FieldError errors={[form.formState.errors.title]} />
              </Field>

              {/* FILE */}
              <Field data-invalid={!!form.formState.errors.file}>
                <FieldLabel htmlFor="file">File</FieldLabel>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) =>
                    form.setValue(
                      "file",
                      e.target.files as FileList
                    )
                  }
                  aria-invalid={!!form.formState.errors.file}
                />
                <FieldError errors={[form.formState.errors.file]} />
              </Field>
            </FieldGroup>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex gap-2"
            >
              {form.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Submit
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}