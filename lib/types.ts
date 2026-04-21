// lib/types.ts
export type BlockType = 
  | "paragraph" | "heading1" | "heading2" | "heading3" 
  | "bulleted" | "numbered" | "todo" | "quote" | "divider";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}