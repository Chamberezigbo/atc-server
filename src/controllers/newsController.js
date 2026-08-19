import prisma from "../db/prismaClient.js";
import { deleteImageByUrl } from "../services/cloudinaryService.js";

// Public — only ever returns published posts. Filtering happens here,
// server-side, never left to the frontend to "hide" unpublished ones.
export async function getPublishedNews(req, res) {
  const posts = await prisma.newsPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(posts);
}

// Admin — sees everything, published or not.
export async function getAllNews(req, res) {
  const posts = await prisma.newsPost.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(posts);
}

export async function createNews(req, res) {
  const { title, body, imageUrl } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "title and body are required" });
  }

  const post = await prisma.newsPost.create({
    data: { title, body, imageUrl: imageUrl || null },
  });
  res.status(201).json(post);
}

export async function updateNews(req, res) {
  const { id } = req.params;
  const { title, body, imageUrl } = req.body;

  const existing = await prisma.newsPost.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }

  const post = await prisma.newsPost.update({
    where: { id },
    data: { title, body, imageUrl },
  });

  // A new image replaced the old one (or it was removed) — the old
  // Cloudinary asset is now orphaned, clean it up.
  if (existing.imageUrl && existing.imageUrl !== imageUrl) {
    await deleteImageByUrl(existing.imageUrl);
  }

  res.json(post);
}

export async function deleteNews(req, res) {
  const { id } = req.params;

  const existing = await prisma.newsPost.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }

  await prisma.newsPost.delete({ where: { id } });
  await deleteImageByUrl(existing.imageUrl);

  res.status(204).send();
}

export async function togglePublish(req, res) {
  const { id } = req.params;

  const existing = await prisma.newsPost.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Post not found" });
  }

  const post = await prisma.newsPost.update({
    where: { id },
    data: { isPublished: !existing.isPublished },
  });
  res.json(post);
}
