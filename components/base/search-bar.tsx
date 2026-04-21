import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { Loader2, SearchIcon } from "lucide-react"

const formSchema = z.object({
  query: z.string().min(0).max(200),
});

export function SearchBar({
  query,
  setQuery,
}: {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setQuery(values.query);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex min-w-100 gap-2 items-center"
    >
      <FieldGroup className="flex-1">
        <Field data-invalid={!!form.formState.errors.query}>
          <Input
            placeholder="your file names"
            {...form.register("query")}
            aria-invalid={!!form.formState.errors.query}
          />
          <FieldError errors={[form.formState.errors.query]} />
        </Field>
      </FieldGroup>

      <Button
        size="sm"
        type="submit"
        disabled={form.formState.isSubmitting}
        className="flex gap-1"
      >
        {form.formState.isSubmitting && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        <SearchIcon /> Search
      </Button>
    </form>
  );
}