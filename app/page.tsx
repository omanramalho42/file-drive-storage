"use client"

import { api } from "@/convex/_generated/api"

import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery
} from "convex/react"
import {
  SignInButton,
  SignOutButton,
  useOrganization,
  useUser
} from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { createFile } from "@/convex/files"

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
          if (!orgId) return;
          createFile({
            name: "hello world",
            orgId,
          });
        }}
      >
        Click me 🦇
      </Button>
    </div>
  );
}
