import prisma from '../db/prismaClient.js'
import { sendLeadFollowUpEmail } from '../services/emailService.js'

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

export async function emailLead(req, res) {
  const { id } = req.params
  const { subject, message } = req.body

  if (!subject || !message) {
    return res.status(400).json({ error: 'subject and message are required' })
  }

  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found' })
  }

  try {
    await sendLeadFollowUpEmail({ to: lead.email, subject, message })
  } catch (err) {
    return res.status(502).json({ error: err.message || 'Failed to send email' })
  }

  res.json({ ok: true })
}
