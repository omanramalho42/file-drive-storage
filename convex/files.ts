import { ConvexError, v } from "convex/values"
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server"
import { getUser } from "./users"

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) {
  console.log("passei aqui")
  console.log(ctx, tokenIdentifier, orgId, "****data*****")
  const user = await getUser(
    ctx,
    tokenIdentifier
  )

  console.log(user,orgId, "user x org ID")

  const hasAccess = 
    user.orgIds.includes(orgId) ||
    user.tokenIdentifier.includes(orgId)

  return hasAccess
}

export const createFile = mutation({
  args: {
    name: v.string(),
    orgId: v.string()
  },
  async handler(ctx, args) {
    const identity =
      await ctx.auth.getUserIdentity()

    if(!identity) {
      throw new ConvexError(
        "You must logged in to upload a file"
      )
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    )
  
    // console.log(args.orgId)
    // console.log(args.tokenIdentifier, identity.tokenIdentifier)
    // console.log(hasAccess, "has access")
  
    if (!hasAccess) {
      throw new ConvexError("You do not have acess to the this organization")
    }

    await ctx.db.insert('files', {
      name: args.name,
      orgId: args.orgId
    })
  },
})

export const getFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity =
      await ctx.auth.getUserIdentity()

    if(!identity) {
      return [];
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    )

    // if (!hasAccess) {
    //   return []
    // }

    return ctx.db.query(
      "files"
    ).withIndex(
      "by_orgId", q => q.eq('orgId', args.orgId)
    ).collect()
  }
})