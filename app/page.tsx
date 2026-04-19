"use client"

import { useState } from "react"

import { api } from "@/convex/_generated/api"

import {
  useMutation,
  useQuery
} from "convex/react"

import {
  useOrganization,
  useUser
} from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"
import { FileCard } from "@/components/base/file-card"

const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, `Required`),
});

export default function Home() {
  const organization = useOrganization();
  const user = useUser();

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }
  console.log(orgId, "org id")
  const files = useQuery(
    api?.files?.getFiles, orgId ? { orgId } : "skip"
  );
  const createFile = useMutation(api.files.createFile);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!orgId) return;

    const postUrl = await generateUploadUrl();

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0].type },
      body: values.file[0],
    });
    const { storageId } = await result.json();

    try {
      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
      });

      form.reset();

      setIsFileDialogOpen(false);

      toast.success("Now everyone can view your file", {
        id: 'create-file'
      });
    } catch (err) {
      toast.error("Your file could not be uploaded, try again later", {
        id: 'create-file'
      })
    }
  }

  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  return (

    <main className="container mx-auto pt-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your Files</h1>

        <Dialog
          open={isFileDialogOpen}
          onOpenChange={(isOpen) => {
            setIsFileDialogOpen(isOpen);
            form.reset();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => {}}>Upload File</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-8">Upload your File Here</DialogTitle>
              <DialogDescription>
                This file will be accessible by anyone in your organization
              </DialogDescription>
            </DialogHeader>

            <div>
              {/* <Form {...form}> */}
                <form
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
                          form.setValue("file", e.target.files as FileList)
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
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    {form.formState.isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Submit
                  </Button>
                </form>
              {/* </Form> */}
            </div>
          </DialogContent>
        </Dialog>
      </div>

     <div className="grid grid-cols-4 gap-4">
      {files?.map((file) => {
        return <FileCard key={file._id} file={file} />;
      })}
    </div>
    </main>
  );
}
