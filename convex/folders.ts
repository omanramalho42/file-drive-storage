import { ConvexError, v } from "convex/values"
import {
  mutation,
  query,
} from "@/convex/_generated/server"
import { hasAccessToOrg } from "@/convex/files"

export const getFolders = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
    const access = await hasAccessToOrg(ctx, args.orgId)

    if (!access) return []

    return await ctx.db
      .query("folders")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect()
  },
})

export const createFolder = mutation({
  args: {
    name: v.string(),
    orgId: v.string(),
    parentId: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const access = await hasAccessToOrg(ctx, args.orgId)

    if (!access) {
      throw new ConvexError("no access")
    }

    await ctx.db.insert("folders", {
      name: args.name,
      orgId: args.orgId,
      parentId: args.parentId,
    })
  },
})

export const deleteFolder = mutation({
  args: { folderId: v.id("folders") },
  async handler(ctx, args) {
    // Adicione lógica de acesso aqui (similar ao hasAccessToFile)
    await ctx.db.delete(args.folderId);
  },
});

export const renameFolder = mutation({
  args: { folderId: v.id("folders"), name: v.string() },
  async handler(ctx, args) {
    await ctx.db.patch(args.folderId, { name: args.name });
  },
});

export const moveFolder = mutation({
  args: { 
    folderId: v.id("folders"), 
    parentId: v.optional(v.id("folders")) // Opcional para mover para a raiz
  },
  async handler(ctx, args) {
    // Adicione aqui sua lógica de segurança para verificar acesso
    await ctx.db.patch(args.folderId, { parentId: args.parentId });
  },
});