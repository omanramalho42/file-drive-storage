"use client"

import { useEffect, useRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Doc } from "@/convex/_generated/dataModel"
import { Block } from "@/lib/types"

interface Props {
  block: Block
  index: number
  autoFocus: boolean
  onUpdate: (id: string, content: string) => void
  onEnter: (id: string) => void
  onBackspace: (id: string) => void
  onToggleCheck: (id: string) => void
  onSlashChange: (id: string, open: boolean, query: string) => void
}

function placeCaretAtEnd(el: HTMLElement) {
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

export function EditableBlock({
  block,
  index,
  autoFocus,
  onUpdate,
  onEnter,
  onBackspace,
  onToggleCheck,
  onSlashChange,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Set initial content once on mount (and when block.id changes, which means a different block)
  useEffect(() => {
    if (ref.current && ref.current.textContent !== block.content) {
      ref.current.textContent = block.content
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.id, block.type])

  // Auto-focus when requested
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus()
      placeCaretAtEnd(ref.current)
    }
  }, [autoFocus])

  // Dentro do EditableBlock.tsx
  const handleInput = () => {
    const text = ref.current?.textContent ?? "";
    onUpdate(block.id, text);
    
    // Detecção do comando Slash
    if (text.includes("/")) {
      onSlashChange(block.id, true, text);
    } else {
      onSlashChange(block.id, false, "");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onEnter(block.id)
      return
    }
    if (e.key === "Backspace") {
      const text = ref.current?.textContent ?? ""
      if (text === "") {
        e.preventDefault()
        onBackspace(block.id)
      }
    }
  }

  if (block.type === "divider") {
    return (
      <div className="py-2">
        <hr className="border-border" />
      </div>
    )
  }

  const baseEditable = (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholderFor(block.type, index)}
      className={cn(
        "min-h-[1.5em] w-full wrap-break-word outline-none",
        "empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        textClassFor(block.type),
      )}
    />
  )

  if (block.type === "heading1") {
    return (
      <h1 className="mt-2">
        {baseEditable}
      </h1>
    )
  }
  if (block.type === "heading2") {
    return <h2 className="mt-2">{baseEditable}</h2>
  }
  if (block.type === "heading3") {
    return <h3 className="mt-1">{baseEditable}</h3>
  }
  if (block.type === "bulleted") {
    return (
      <div className="flex items-start gap-3">
        <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
        <div className="flex-1">{baseEditable}</div>
      </div>
    )
  }
  if (block.type === "numbered") {
    return (
      <div className="flex items-start gap-3">
        <span className="mt-0 shrink-0 text-foreground">{index + 1}.</span>
        <div className="flex-1">{baseEditable}</div>
      </div>
    )
  }
  if (block.type === "todo") {
    return (
      <div className="flex items-start gap-3">
        <Checkbox
          checked={!!block.checked}
          onCheckedChange={() => onToggleCheck(block.id)}
          className="mt-1 shrink-0"
          aria-label="Marcar tarefa"
        />
        <div
          className={cn(
            "flex-1 transition-colors",
            block.checked && "text-muted-foreground line-through",
          )}
        >
          {baseEditable}
        </div>
      </div>
    )
  }
  if (block.type === "quote") {
    return (
      <blockquote className="border-l-2 border-accent pl-4">
        {baseEditable}
      </blockquote>
    )
  }

  return baseEditable
}

function textClassFor(type: Doc<"docs">["type"]) {
  switch (type) {
    case "heading1":
      return "text-3xl font-bold tracking-tight text-foreground"
    case "heading2":
      return "text-2xl font-semibold tracking-tight text-foreground"
    case "heading3":
      return "text-xl font-semibold text-foreground"
    case "quote":
      return "text-base italic text-muted-foreground leading-relaxed"
    case "bulleted":
    case "numbered":
    case "todo":
      return "text-base text-foreground leading-relaxed"
    default:
      return "text-base text-foreground leading-relaxed"
  }
}

function placeholderFor(type: Doc<"docs">["type"], index: number) {
  switch (type) {
    case "heading1":
      return "Título 1"
    case "heading2":
      return "Título 2"
    case "heading3":
      return "Título 3"
    case "bulleted":
      return "Item da lista"
    case "numbered":
      return "Item numerado"
    case "todo":
      return "Tarefa"
    case "quote":
      return "Citação"
    default:
      return index === 0 ? "Comece a escrever ou digite / para comandos" : "Digite / para comandos"
  }
}
