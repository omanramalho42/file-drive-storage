import { ConvexError, v } from "convex/values"
import {
  internalMutation,
  mutation,
  MutationCtx,
  query,
  QueryCtx
} from "./_generated/server"
import { fileTypes } from "./schema"
import { Doc, Id } from "./_generated/dataModel"

export const getFileUrl = query({
  args: {
    fileId: v.id("_storage"),
  },
  async handler(ctx, args) {
    return await ctx.storage.getUrl(args.fileId);
  },
})

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("you must be logged in to upload a file");
  }

  return await ctx.storage.generateUploadUrl();
});

export async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const identity = await ctx.auth.getUserIdentity();
  console.log(identity," identity")
  if (!identity) {
    return null;
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    return null;
  }

  console.log(user)

  const hasAccess =
    user.tokenIdentifier.includes(orgId) ||
    user.orgIds.some((item) => item.orgId === orgId)
  
  console.log(user.tokenIdentifier, "token")

  console.log(hasAccess)

  if (!hasAccess) {
    return null;
  }

  return { user };
}

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<"files">
) {
  const file = await ctx.db.get(fileId);

  if (!file) {
    return null;
  }

  const hasAccess = await hasAccessToOrg(ctx, file.orgId);

  if (!hasAccess) {
    return null;
  }

  return { user: hasAccess.user, file };
}

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
    type: fileTypes,

    // novos
    folderId: v.optional(v.string()),
    sizeKb: v.optional(v.number()),
  },

  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId)

    if (!hasAccess) {
      throw new ConvexError("you do not have access to this org")
    }

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
      userId: hasAccess.user._id,

      // novos
      folderId: args.folderId,
      sizeKb: args.sizeKb,
      addedAt: new Date().toISOString(),
    })
  },
})

export const toggleFavorite = mutation({
  args: {
    fileId: v.id("files")
  },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("no access to file");
    }

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q
          .eq("userId", access.user._id)
          .eq("orgId", access.file.orgId)
          .eq("fileId", access.file._id)
      )
      .first();

    if (!favorite) {
      await ctx.db.insert("favorites", {
        fileId: access.file._id,
        userId: access.user._id,
        orgId: access.file.orgId,
      });
    } else {
      await ctx.db.delete(favorite._id);
    }
  },
});

export const getAllFavorites = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      return [];
    }

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_userId_orgId_fileId", (q) =>
        q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
      )
      .collect();

    return favorites;
  },
});

export const deleteAllFiles = internalMutation({
  args: {},
  async handler(ctx) {
    const files = await ctx.db
      .query("files")
      .withIndex("by_shouldDelete", (q) => q.eq("shouldDelete", true))
      .collect();

    await Promise.all(
      files.map(async (file) => {
        await ctx.storage.delete(file.fileId);
        return await ctx.db.delete(file._id);
      })
    );
  },
});

function assertCanDeleteFile(user: Doc<"users">, file: Doc<"files">) {
  const canDelete =
    file.userId === user._id ||
    user.orgIds.find((org) => org.orgId === file.orgId)?.role === "admin";

  if (!canDelete) {
    throw new ConvexError("you have no acces to delete this file");
  }
}

export const deleteFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("no access to file");
    }

    assertCanDeleteFile(access.user, access.file);

    await ctx.db.patch(args.fileId, {
      shouldDelete: true,
    });
  },
});

export const restoreFile = mutation({
  args: { fileId: v.id("files") },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("no access to file");
    }

    assertCanDeleteFile(access.user, access.file);

    await ctx.db.patch(args.fileId, {
      shouldDelete: false,
    });
  },
})

export const getFiles = query({
  args: {
    orgId: v.string(),
    query: v.optional(v.string()),
    favorites: v.optional(v.boolean()),
    deletedOnly: v.optional(v.boolean()),
    type: v.optional(fileTypes),

    // ✅ NOVO
    folderId: v.optional(v.string()),
  },

  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId)
    if (!hasAccess) return []

    let files = await ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect()

    if (args.query) {
      files = files.filter((file) =>
        file.name.toLowerCase().includes(args.query!.toLowerCase())
      )
    }

    // ✅ FILTRO POR PASTA (AGORA FUNCIONA)
    if (args.folderId) {
      files = files.filter((file) => file.folderId === args.folderId)
    }

    if (args.favorites) {
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_userId_orgId_fileId", (q) =>
          q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId)
        )
        .collect()

      files = files.filter((file) =>
        favorites.some((fav) => fav.fileId === file._id)
      )
    }

    if (args.deletedOnly) {
      files = files.filter((file) => file.shouldDelete)
    } else {
      files = files.filter((file) => !file.shouldDelete)
    }

    if (args.type) {
      files = files.filter((file) => file.type === args.type)
    }

    const filesWithUrl = await Promise.all(
      files.map(async (file) => {
        const user = await ctx.db.get(file.userId)

        return {
          id: file._id,      // O que você usa no front-end
          _id: file._id,     // Adicione isso também para o Convex reconhecer na mutation
          name: file.name,
          type: file.type,
          sizeKb: file.sizeKb ?? 0,
          folderId: file.folderId ?? "general",
          docId: file.docId,

          addedBy: {
            name: user?.name ?? "Unknown",
            email: "",
            avatarUrl: user?.image,
          },

          addedAt:
            file.addedAt ??
            new Date(file._creationTime).toISOString(),

          url: await ctx.storage.getUrl(file.fileId),

          isFavorited: false,
          _creationTime: file._creationTime,
        }
      })
    )

    return filesWithUrl
  },
})

export const moveFile = mutation({
  args: {
    fileId: v.id("files"),
    newFolderId: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError("no access to file");
    }

    await ctx.db.patch(args.fileId, {
      folderId: args.newFolderId,
    });
  },
});