"use client"

import { Folder as FolderIcon, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import { FolderActions } from "../base/folder-actions"
// Adicione o import no topo

interface FolderTreeProps {
  folders: any[]
  fileCounts: Record<string, number>
  selectedId: string | null
  onSelect: (id: string) => void
}

interface TreeNode {
  folder: any
  children: TreeNode[]
}

function buildTree(folders: any[]): TreeNode[] {
  const byId = new Map<string, TreeNode>()
  folders.forEach((f) => byId.set(f.id, { folder: f, children: [] }))
  const roots: TreeNode[] = []
  byId.forEach((node) => {
    if (node.folder.parentId && byId.has(node.folder.parentId)) {
      byId.get(node.folder.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

function TreeRow({
  node,
  depth,
  selectedId,
  onSelect,
  fileCounts,
  expanded,
  onToggle,
}: {
  node: TreeNode
  depth: number
  selectedId: string | null
  onSelect: (id: string) => void
  fileCounts: Record<string, number>
  expanded: Set<string>
  onToggle: (id: string) => void
}) {
  const isSelected = selectedId === node.folder.id
  const isExpanded = expanded.has(node.folder.id)
  const hasChildren = node.children.length > 0

  return (
<div>
      {/* Adicionamos a classe 'group' no wrapper para controlar o hover das ações */}
      <div className="group flex w-full items-center gap-1">
        <button
          type="button"
          onClick={() => {
            onSelect(node.folder.id);
            if (hasChildren) onToggle(node.folder.id);
          }}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
            isSelected ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {depth > 0 && (
            <span aria-hidden="true" className="-ml-3 mr-1 inline-block h-3 w-3 border-l border-b border-border/70 rounded-bl-md" />
          )}
          {isSelected && hasChildren ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-foreground" />
          ) : (
            <FolderIcon className="h-4 w-4 shrink-0" />
          )}
          <span className="flex-1 truncate">{node.folder.name}</span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              isSelected ? "bg-background/60 text-foreground" : "text-muted-foreground",
            )}
          >
            {fileCounts[node.folder.id] ?? 0}
          </span>
        </button>

        {/* Aqui entra o componente de Ações que criamos */}
        <FolderActions folder={node.folder} />
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <TreeRow
              key={child.folder.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              fileCounts={fileCounts}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FolderTree({ folders, fileCounts, selectedId, onSelect }: FolderTreeProps) {
  const tree = useMemo(() => buildTree(folders), [folders])
  // Auto-expand selected ancestors
  const initiallyExpanded = useMemo(() => {
    const set = new Set<string>()
    folders.forEach((f) => {
      if (!f.parentId) set.add(f.id)
    })
    set.add("general")
    set.add("onboarding")
    return set
  }, [folders])
  const [expanded, setExpanded] = useState<Set<string>>(initiallyExpanded)

  const onToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-0.5">
      {tree.map((node) => (
        <TreeRow
          key={node.folder.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
          fileCounts={fileCounts}
          expanded={expanded}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}
  