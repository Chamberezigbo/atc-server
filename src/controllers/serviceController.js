import prisma from '../db/prismaClient.js'

// Public — only active services, grouped by category then display order
export async function getActiveServices(req, res) {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  })
  res.json(services)
}

// Admin — sees everything, active or not
export async function getAllServices(req, res) {
  const services = await prisma.service.findMany({
    orderBy: [{ category: 'asc' }, { order: 'asc' }],
  })
  res.json(services)
}

export async function createService(req, res) {
  const { name, slug, category, pricingType, unitPrice, unitLabel, tierLabel, description, order } =
    req.body

  if (!name || !slug || !category || !pricingType || unitPrice === undefined) {
    return res.status(400).json({
      error: 'name, slug, category, pricingType, and unitPrice are required',
    })
  }

  try {
    const service = await prisma.service.create({
      data: {
        name,
        slug,
        category,
        pricingType,
        unitPrice: Number(unitPrice),
        unitLabel: unitLabel || null,
        tierLabel: tierLabel || null,
        description: description || null,
        order: Number.isFinite(Number(order)) ? Number(order) : 0,
      },
    })
    res.status(201).json(service)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'That slug is already in use' })
    }
    throw err
  }
}

export async function updateService(req, res) {
  const { id } = req.params
  const { name, slug, category, pricingType, unitPrice, unitLabel, tierLabel, description, order } =
    req.body

  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        slug,
        category,
        pricingType,
        unitPrice: unitPrice !== undefined ? Number(unitPrice) : undefined,
        unitLabel: unitLabel || null,
        tierLabel: tierLabel || null,
        description: description || null,
        order: order !== undefined ? Number(order) : undefined,
      },
    })
    res.json(service)
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'That slug is already in use' })
    }
    throw err
  }
}

export async function deleteService(req, res) {
  const { id } = req.params
  await prisma.service.delete({ where: { id } })
  res.status(204).send()
}

export async function toggleServiceActive(req, res) {
  const { id } = req.params

  const existing = await prisma.service.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Service not found' })
  }

  const service = await prisma.service.update({
    where: { id },
    data: { isActive: !existing.isActive },
  })
  res.json(service)
}
