import prisma from '../db/prismaClient.js'
import { deleteImageByUrl } from '../services/cloudinaryService.js'

// Public — only approved testimonials, newest first
export async function getApprovedTestimonials(req, res) {
  const testimonials = await prisma.testimonial.findMany({
    where: { status: 'approved' },
    orderBy: { createdAt: 'desc' },
  })
  res.json(testimonials)
}

// Public — anyone can submit; always starts as pending
export async function submitTestimonial(req, res) {
  const { authorName, message, authorPhotoUrl } = req.body

  if (!authorName || !message) {
    return res.status(400).json({ error: 'authorName and message are required' })
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      authorName,
      message,
      authorPhotoUrl: authorPhotoUrl || null,
      status: 'pending',
    },
  })
  res.status(201).json(testimonial)
}

// Admin — sees every status
export async function getAllTestimonials(req, res) {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(testimonials)
}

export async function approveTestimonial(req, res) {
  const { id } = req.params
  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: { status: 'approved' },
  })
  res.json(testimonial)
}

export async function rejectTestimonial(req, res) {
  const { id } = req.params
  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: { status: 'rejected' },
  })
  res.json(testimonial)
}

export async function deleteTestimonial(req, res) {
  const { id } = req.params

  const existing = await prisma.testimonial.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Testimonial not found' })
  }

  await prisma.testimonial.delete({ where: { id } })
  await deleteImageByUrl(existing.authorPhotoUrl)

  res.status(204).send()
}
