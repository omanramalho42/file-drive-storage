"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { formatRelative } from "date-fns"
import { ptBR } from "date-fns/locale"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileCardActions } from "./file-actions"

function UserCell({ userId }: { userId?: Id<"users"> }) {
  const userProfile = useQuery(
    api.users.getUserProfile,
    userId ? { userId } : "skip"
  )

  if (!userId) return null

  return (
    <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
      <Avatar className="w-6 h-6">
        <AvatarImage src={userProfile?.image} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      {userProfile?.name}
    </div>
  )
}

export const columns: ColumnDef<
  Doc<"files"> & { url: string | null; isFavorited: boolean }
>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "type",
    header: "Tipo",
  },
  {
    header: "User",
    cell: ({ row }) => {
      return <UserCell userId={row.original.userId} />;
    },
  },
  {
    header: "Carregado em",
    cell: ({ row }) => {
      return (
        <div>
          {formatRelative(new Date(row.original._creationTime), new Date(), {
            locale: ptBR,
          })}
        </div>
      );
    },
  },
  {
    header: "Ações",
    cell: ({ row }) => {
      return (
        <div>
          <FileCardActions
            file={row.original}
            isFavorited={row.original.isFavorited}
          />
        </div>
      );
    },
  },
];