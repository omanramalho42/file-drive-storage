// convex/docs.ts
import { ConvexError, v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { hasAccessToOrg } from "./files" // Reutilizando sua função de verificação

export const getDocs = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
    const access = await hasAccessToOrg(ctx, args.orgId)
    if (!access) return []

    return await ctx.db
      .query("docs")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .collect()
  },
})

export const getDocById = query({
  args: { id: v.id("docs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createDoc = mutation({
  args: {
    title: v.string(),
    orgId: v.string(),
    folderId: v.optional(v.id("folders")),
    type: v.optional(v.string()), // Adicionado para consistência
  },
  async handler(ctx, args) {
    const access = await hasAccessToOrg(ctx, args.orgId)
    if (!access) throw new ConvexError("No access")

    return await ctx.db.insert("docs", {
      title: args.title,
      content: [],
      type: args.type ?? "document",
      orgId: args.orgId,
      folderId: args.folderId,
      updatedAt: new Date().toISOString(),
    })
  },
})

export const updateDoc = mutation({
  args: {
    id: v.id("docs"),
    title: v.optional(v.string()),
    content: v.optional(v.any()), // Seus blocks
  },
  async handler(ctx, args) {
    const { id, ...updates } = args
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })
  },
})