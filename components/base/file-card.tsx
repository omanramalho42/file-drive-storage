import Image from "next/image"

import { formatRelative } from "date-fns"

import { Doc } from "@/convex/_generated/dataModel"
import { ReactNode } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { FileCardActions } from "@/components/base/file-actions"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { FileTextIcon, GanttChartIcon, ImageIcon } from "lucide-react"
import { FileKindIcon } from "./file-kind-icon"

export function FileCard({
  file,
}: {
  file: Doc<"files"> & { isFavorited: boolean; url: string | null }
}) {
  const userProfile = useQuery(
    api.users.getUserProfile,
    file.userId ? { userId: file.userId } : "skip"
  )

  const typeIcons = {
    image: <ImageIcon />,
    pdf: <FileTextIcon />,
    csv: <GanttChartIcon />,
  } as Record<Doc<"files">["type"], ReactNode>

  return (
    <Card>
      <CardHeader className="relative pb-2">
        <CardTitle className="flex gap-2 text-sm font-medium truncate items-center">
          {file.name}
        </CardTitle>
        <div className="absolute top-2 right-2">
          <FileCardActions isFavorited={file.isFavorited} file={file} />
        </div>
      </CardHeader>
      <CardContent className="flex justify-center items-center py-4">
        <FileKindIcon name={file.name} url={file.url} type={file.type} className="w-full h-32" />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2 text-xs text-gray-700 w-40 items-center">
          <Avatar className="w-6 h-6">
            <AvatarImage src={userProfile?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          {userProfile?.name}
        </div>
        <div className="text-xs text-gray-700">
          Uploaded on {formatRelative(new Date(file._creationTime), new Date())}
        </div>
      </CardFooter>
    </Card>
  )
}