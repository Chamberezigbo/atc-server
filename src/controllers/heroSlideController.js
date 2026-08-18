import prisma from '../db/prismaClient.js'

// Public — only active slides, in display order
export async function getActiveHeroSlides(req, res) {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  res.json(slides)
}

// Admin — sees everything, active or not
export async function getAllHeroSlides(req, res) {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: 'asc' },
  })
  res.json(slides)
}

export async function createHeroSlide(req, res) {
  const { tip, imageUrl, order } = req.body

  if (!tip) {
    return res.status(400).json({ error: 'tip is required' })
  }

  const slide = await prisma.heroSlide.create({
    data: {
      tip,
      imageUrl: imageUrl || null,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
    },
  })
  res.status(201).json(slide)
}

export async function updateHeroSlide(req, res) {
  const { id } = req.params
  const { tip, imageUrl, order } = req.body

  const slide = await prisma.heroSlide.update({
    where: { id },
    data: {
      tip,
      imageUrl,
      order: order !== undefined ? Number(order) : undefined,
    },
  })
  res.json(slide)
}

export async function deleteHeroSlide(req, res) {
  const { id } = req.params
  await prisma.heroSlide.delete({ where: { id } })
  res.status(204).send()
}

export async function toggleHeroSlideActive(req, res) {
  const { id } = req.params

  const existing = await prisma.heroSlide.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Slide not found' })
  }

  const slide = await prisma.heroSlide.update({
    where: { id },
    data: { isActive: !existing.isActive },
  })
  res.json(slide)
}
