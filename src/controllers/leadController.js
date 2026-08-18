import prisma from '../db/prismaClient.js'

// Public — the WhatsApp CTA form posts here before redirecting
export async function createLead(req, res) {
  const { name, email, phone, message } = req.body

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'name, email, and phone are required' })
  }

  const lead = await prisma.lead.create({
    data: { name, email, phone, message: message || null },
  })
  res.status(201).json(lead)
}

// Admin
export async function getAllLeads(req, res) {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(leads)
}
