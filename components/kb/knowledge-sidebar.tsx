"use client"

import {
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useMemo, useState } from "react"
import { FolderTree } from "./folder-tree"
import { CreateFolderDialog } from "./create-folder-dialog"
import { Button } from "@/components/ui/button"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrganization, useUser } from "@clerk/nextjs"

export function KnowledgeSidebar() {
  const { organization } = useOrganization()
  const { user } = useUser()

  const orgId = organization?.id ?? user?.id

  const folders =
    useQuery(api.folders.getFolders, orgId ? { orgId } : "skip") || []
  const files =
    useQuery(api.files.getFiles, orgId ? { orgId } : "skip") || []

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)

  const [collapsed, setCollapsed] = useState(false)

  // 📊 FILE COUNTS
  const fileCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const childMap = new Map<string, string[]>()

    folders.forEach((f: any) => {
      if (f.parentId) {
        const arr = childMap.get(f.parentId) ?? []
        arr.push(f._id)
        childMap.set(f.parentId, arr)
      }
    })

    const getAllDescendants = (id: string): string[] => {
      const children = childMap.get(id) ?? []
      return [id, ...children.flatMap(getAllDescendants)]
    }

    folders.forEach((f: any) => {
      const ids = new Set(getAllDescendants(f._id))

      counts[f._id] = files.filter((file: any) =>
        ids.has(file.folderId)
      ).length
    })

    return counts
  }, [folders, files])

  // 🏷 TAGS
  const tags = useMemo(() => {
    const counts = new Map<string, number>()

    files.forEach((f: any) => {
      counts.set(f.kind, (counts.get(f.kind) ?? 0) + 1)
    })

    return Array.from(counts.entries()).map(([kind, count]) => ({
      kind,
      count,
    }))
  }, [files])

  return (
    <div
      className={`
        flex h-full flex-col border-r bg-sidebar
        transition-all duration-300
        ${collapsed ? "w-16" : "w-72"}
        md:relative
      `}
    >
      {/* HEADER */}
      <div className={`flex w-full items-center justify-between py-4 ${collapsed ? "px-2" : "px-4"}`}>
        {!collapsed && (
          <h2 className="text-sm font-semibold text-foreground truncate">
            Knowledge Base
          </h2>
        )}

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      {!collapsed && (
        <div className="px-4 w-full overflow-hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="h-9 w-full rounded-lg border border-border bg-background/40 pl-9 pr-9 text-sm"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* TABS */}
      {!collapsed && (
        <div className="flex-1 w-full overflow-hidden px-4 pt-4">
          <Tabs defaultValue="folders" className="w-full flex flex-col h-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="folders">Pastas</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
            </TabsList>

            {/* 📁 FOLDERS */}
            <TabsContent value="folders" className="mt-3">
              <div className="h-full overflow-y-auto">
                <FolderTree
                  folders={folders.map((f: any) => ({
                    id: f._id,
                    name: f.name,
                    parentId: f.parentId ?? null,
                  }))}
                  fileCounts={fileCounts}
                  selectedId={selectedFolderId}
                  onSelect={setSelectedFolderId}
                />
              </div>
            </TabsContent>

            {/* 🏷 TAGS */}
            <TabsContent value="tags" className="mt-3">
              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground px-2 py-4">
                  Nenhuma tag ainda.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {tags.map((t, index) => (
                    <button
                      key={index}
                      className="flex justify-between px-2 py-1.5 text-sm hover:bg-secondary/50 rounded-md"
                    >
                      <span className="capitalize">{t.kind}</span>
                      <span className="text-xs">{t.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      <CreateFolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  )
}