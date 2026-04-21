"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Plus, Upload as UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FolderCard } from "./folder-card"
import { FilesTable } from "./files-table"
import { EmptyState } from "./empty-state"
import { UploadDialog } from "./upload-dialog"
import { CreateFolderDialog } from "./create-folder-dialog"
import { MoveFileDialog } from "./move-file-dialog"
import { FileKindIcon } from "./file-icon"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useOrganization, useUser } from "@clerk/nextjs"

export function MainContent() {
  const { organization } = useOrganization()
  const { user } = useUser()

  const orgId = organization?.id ?? user?.id
  // 🔥 DADOS DO CONVEX
  const folders = useQuery(api.folders.getFolders, orgId ? { orgId } : "skip") || []

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const files =
    useQuery(
      api.files.getFiles,
      orgId
        ? {
            orgId,
            query: searchQuery || undefined,
          }
        : "skip"
    ) || []

  const [uploadOpen, setUploadOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [moveFileId, setMoveFileId] = useState<string | null>(null)

  const selectedFolder = useMemo(
    () => folders.find((f) => f._id === selectedFolderId) ?? null,
    [folders, selectedFolderId],
  )

  const subfolders = useMemo(
    () => folders.filter((f) => f.parentId === selectedFolderId),
    [folders, selectedFolderId],
  )

  const directFiles = useMemo(
    () => files.filter((f) => f.folderId === selectedFolderId),
    [files, selectedFolderId],
  )

  const fileCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    folders.forEach((f) => {
      const ids = new Set<string>([f._id])
      let added = true
      while (added) {
        added = false
        folders.forEach((c) => {
          if (c.parentId && ids.has(c.parentId) && !ids.has(c._id)) {
            ids.add(c._id)
            added = true
          }
        })
      }
      counts[f._id] = files.filter((file) => ids.has(file.folderId)).length
    })
    return counts
  }, [folders, files])

  // Search results — global across all folders
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return null
    return {
      folders: folders.filter((f) => f.name.toLowerCase().includes(q)),
      files: files.filter((f) => f.name.toLowerCase().includes(q)),
    }
  }, [searchQuery, folders, files])

  const isSearching = searchResults !== null

  return (
    <main className="flex flex-col flex-1 min-w-0 overflow-y-auto bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border px-4 sm:px-8 py-4 gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group flex items-center gap-2 rounded-md px-2 py-1 text-base font-medium text-foreground hover:bg-secondary/40"
            >
              {isSearching ? "Resultados da busca" : selectedFolder?.name ?? "Knowledge Base"}
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {folders
              .filter((f) => !f.parentId)
              .map((f) => (
                <DropdownMenuItem
                  key={f._id}
                  onClick={() => {
                    setSelectedFolderId(f._id)
                    setSearchQuery("")
                  }}
                >
                  {f.name}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Pasta
          </Button>
          <Button
            size="sm"
            onClick={() => setUploadOpen(true)}
            disabled={!selectedFolderId}
            className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <UploadIcon className="h-4 w-4" />
            Adicionar arquivo
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="scrollbar-thin flex-1 min-w-0 overflow-y-auto px-4 sm:px-8 py-6">
        {isSearching ? (
          <SearchResults
            query={searchQuery}
            folders={searchResults!.folders}
            files={searchResults!.files}
            fileCounts={fileCounts}
            onSelectFolder={(id) => {
              setSelectedFolderId(id)
              setSearchQuery("")
            }}
            onMoveFile={setMoveFileId}
            onClear={() => setSearchQuery("")}
          />
        ) : !selectedFolder ? (
          <EmptyState variant="folder" />
        ) : (
          <FolderView
            subfolders={subfolders}
            files={directFiles}
            fileCounts={fileCounts}
            onSelectFolder={setSelectedFolderId}
            onMoveFile={setMoveFileId}
            onAddFile={() => setUploadOpen(true)}
          />
        )}
      </div>

      {/* Dialogs */}
      {selectedFolderId && (
        <UploadDialog
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          folderId={selectedFolderId}
        />
      )}
      <CreateFolderDialog open={createOpen} onOpenChange={setCreateOpen} />
      <MoveFileDialog
        open={moveFileId !== null}
        onOpenChange={(o) => !o && setMoveFileId(null)}
        fileId={moveFileId}
      />
    </main>
  )
}

function FolderView({
  subfolders,
  files,
  fileCounts,
  onSelectFolder,
  onMoveFile,
  onAddFile,
}: {
  subfolders: any[]
  files: any[]
  fileCounts: Record<string, number>
  onSelectFolder: (id: string) => void
  onMoveFile: (id: string) => void
  onAddFile: () => void
}) {
  const hasContent = subfolders.length > 0 || files.length > 0

  if (!hasContent) {
    return (
      <EmptyState
        variant="files"
        actionLabel="Adicionar arquivo"
        onAction={onAddFile}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* 📁 FOLDERS */}
      {subfolders.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
            Pastas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {subfolders.map((folder) => (
              <FolderCard
                key={folder._id}
                folder={{
                  id: folder._id,
                  name: folder.name,
                  parentId: folder.parentId ?? null,
                }}
                fileCount={fileCounts[folder._id] ?? 0}
                onClick={() => onSelectFolder(folder._id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 📄 FILES */}
      {files.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
            Arquivos
          </h2>

          <FilesTable files={files} onMove={onMoveFile} />
        </section>
      )}
    </div>
  )
}

function SearchResults({
  query,
  folders,
  files,
  fileCounts, // 👈 adiciona aqui
  onSelectFolder,
  onMoveFile,
  onClear,
}: {
  query: string
  folders: any[]
  files: any[]
  fileCounts: Record<string, number> // 👈 adiciona aqui
  onSelectFolder: (id: string) => void
  onMoveFile: (id: string) => void
  onClear: () => void
}) {
  if (folders.length === 0 && files.length === 0) {
    return (
      <EmptyState
        variant="search"
        query={query}
        actionLabel="Limpar busca"
        onAction={onClear}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* HEADER */}
      <div>
        <p className="text-sm text-muted-foreground">
          {folders.length + files.length} resultado(s) para{" "}
          <span className="text-foreground">&quot;{query}&quot;</span>
        </p>
      </div>

      {/* 📁 FOLDERS */}
      {folders.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Pastas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {folders.map((folder) => (
              <FolderCard
                key={folder._id} // ✅ mudou aqui
                folder={{
                  id: folder._id,
                  name: folder.name,
                  parentId: folder.parentId ?? null,
                }}
                fileCount={0} // pode melhorar depois
                onClick={() => onSelectFolder(folder._id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 📄 FILES */}
      {files.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Arquivos
          </h2>

          <ul className="w-full overflow-hidden rounded-xl border border-border">
            {files.map((file) => (
              <li
                key={file.id} // ✅ já vem formatado do backend
                className="flex items-center justify-between gap-4 border-b border-border px-5 py-3 last:border-b-0 hover:bg-secondary/30"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileKindIcon type={file.kind} />

                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {file.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {file.addedBy?.name ?? "Unknown"}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => onMoveFile(file.id)}
                >
                  Mover
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}