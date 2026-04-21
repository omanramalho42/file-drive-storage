"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { SlashMenu } from "./slash-menu"
import { cn } from "@/lib/utils"
import { EditableBlock } from "./editable-block"
import { Doc } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Block } from "@/lib/types"

interface Props {
  doc: Doc<"docs">
}

export function NotionEditor({ doc }: Props) {
  const updateDoc = useMutation(api.docs.updateDoc)
  // No NotionEditor, garanta que o tipo de blocks seja Block[]
  const [blocks, setBlocks] = useState<Block[]>(doc.content || [{ 
    id: "initial", type: "paragraph", content: "" 
  }])

  // Função de atualização otimizada
  const updateBlockContent = useCallback((id: string, content: string) => {
    setBlocks((prev) => 
      prev.map((b) => (b.id === id ? { ...b, content } : b))
    )
  }, [])
  const [title, setTitle] = useState(doc.title)
  const [focusBlockId, setFocusBlockId] = useState<string | null>(null)
  const [slash, setSlash] = useState<{ blockId: string; query: string } | null>(null)

// O "debounced" salvamento de blocos
  useEffect(() => {
    // Evita salvar no primeiro render se o doc.content for igual a blocks
    if (JSON.stringify(doc.content) === JSON.stringify(blocks)) return
    
    const id = setTimeout(() => {
      updateDoc({ id: doc._id, content: blocks })
    }, 500)
    return () => clearTimeout(id)
  }, [blocks, doc._id, updateDoc, doc.content])

// O "debounced" salvamento de título
  useEffect(() => {
    if (doc.title === title) return

    const id = setTimeout(() => {
      updateDoc({ id: doc._id, title })
    }, 500)
    return () => clearTimeout(id)
  }, [title, doc._id, updateDoc, doc.title])

  const changeBlockType = useCallback((id: string, type: any) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, type, content: "" } // Limpa o conteúdo (remove o '/')
          : b,
      ),
    );
    setSlash(null);
    // Garante que o foco retorne ao bloco editado após a mudança de tipo
    setTimeout(() => setFocusBlockId(id), 10);
  }, []);

  const handleEnter = useCallback((id: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id)
      if (idx === -1) return prev
      const newBlock: any = {
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "paragraph",
        content: "",
      }
      setFocusBlockId(newBlock.id)
      const next = [...prev]
      next.splice(idx + 1, 0, newBlock)
      return next
    })
  }, [])

  const handleBackspace = useCallback((id: string) => {
    setBlocks((prev) => {
      if (prev.length === 1) return prev
      const idx = prev.findIndex((b) => b.id === id)
      if (idx === -1) return prev
      const prevBlock = prev[idx - 1]
      if (prevBlock) setFocusBlockId(prevBlock.id)
      return prev.filter((b) => b.id !== id)
    })
  }, [])

  const handleToggleCheck = useCallback((id: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, checked: !b.checked } : b)),
    )
  }, [])

  const handleSlashChange = useCallback(
    (blockId: string, open: boolean, query: string) => {
      if (!open) {
        setSlash((cur) => (cur?.blockId === blockId ? null : cur))
        return
      }
      setSlash({ blockId, query })
    },
    [],
  )

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const first = blocks[0]
      if (first) setFocusBlockId(first.id)
    }
  }

  // Auto-grow title
  const titleRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = el.scrollHeight + "px"
  }, [title])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 py-10 sm:py-14">
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        placeholder="Sem título"
        rows={1}
        className={cn(
          "w-full resize-none overflow-hidden border-0 bg-transparent text-4xl font-bold tracking-tight",
          "text-foreground outline-none placeholder:text-muted-foreground/60 sm:text-5xl",
        )}
      />

      <div className="mt-4 flex flex-col gap-1">
        {blocks.map((block, index) => (
          <div key={block.id} className="group relative">
            <EditableBlock
              block={block}
              index={index}
              autoFocus={focusBlockId === block.id}
              onEnter={() => handleEnter(block.id)}
              onUpdate={(id, content) => {
                setBlocks(prev => prev.map(b => b.id === id ? {...b, content} : b));
              }}
              onSlashChange={(id, open, query) => setSlash(open ? { blockId: id, query } : null)}
              onBackspace={handleBackspace}
              onToggleCheck={handleToggleCheck}
            />
            {slash?.blockId === block.id && (
              <SlashMenu 
                query={slash.query} 
                onClose={() => setSlash(null)}
                onSelect={(type) => {
                  setBlocks(prev => prev.map(b => b.id === block.id ? {...b, type, content: ""} : b));
                  setSlash(null);
                }}
              />  
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
