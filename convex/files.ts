import { ConvexError, v } from "convex/values"
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server"
import { getUser } from "./users"
import { fileTypes } from "./schema";

export const getFileUrl = query({
  args: {
    fileId: v.id("_storage"),
  },
  async handler(ctx, args) {
    return await ctx.storage.getUrl(args.fileId);
  },
});


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

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }

  return await ctx.storage.generateUploadUrl();
});


export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("you do not have access to this org");
    }

    const file = await ctx.db.get(args.fileId);

    if (!file) {
      throw new ConvexError("this file does not exist");
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      file.orgId
    );

    if (!hasAccess) {
      throw new ConvexError("you do not have access to delete this file");
    }

    await ctx.db.delete(args.fileId);
  },
});

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,
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

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
    });
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

    if (!hasAccess) {
      return []
    }

    return ctx.db.query(
      "files"
    ).withIndex(
      "by_orgId", q => q.eq('orgId', args.orgId)
    ).collect()
  }
})