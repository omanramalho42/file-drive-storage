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