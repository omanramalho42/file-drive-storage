"use client"

import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import {
  SignInButton,
  SignOutButton
} from "@clerk/nextjs"

import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery
} from "convex/react"

export default function Home() {
  const files =
    useQuery(
      api.files.getFiles
    )
  const createFile =
    useMutation(
      api.files.createFile
    )

  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <Unauthenticated>
        <SignInButton mode="modal" />
      </Unauthenticated>

      <Authenticated>
        <SignOutButton>
          <Button>
            Sair
          </Button>
        </SignOutButton>
      </Authenticated>

      <div className="flex flex-col gap-2 items-center justify-center">
        {files?.map((file, idx) => {
          return (
            <div key={idx}>
              {file.name}
            </div>
          )
        })}
      </div>

      <Button
        onClick={() => {
          window.alert("create file on convex")
          createFile({
            name: "Hello world",
          })
        }}
      >
        Click me 🦇
      </Button>
    </div>
  );
}
