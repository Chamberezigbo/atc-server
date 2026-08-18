import prisma from '../db/prismaClient.js'
import { generateInvoicePdf } from '../services/pdfService.js'
import { sendInvoiceEmail } from '../services/emailService.js'

export async function createInvoice(req, res) {
  const { clientName, clientEmail, lineItems } = req.body

  if (!clientName || !clientEmail || !Array.isArray(lineItems) || lineItems.length === 0) {
    return res.status(400).json({
      error: 'clientName, clientEmail, and at least one line item are required',
    })
  }

  for (const item of lineItems) {
    if (!item.description || !item.quantity || item.unitPrice === undefined) {
      return res.status(400).json({
        error: 'Each line item needs a description, quantity, and unitPrice',
      })
    }
  }

  // Computed here, never trusted from the client — the total on the
  // invoice must always match what the line items actually add up to.
  const totalAmount = lineItems.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
    0,
  )

  const invoice = await prisma.invoice.create({
    data: {
      clientName,
      clientEmail,
      issuedBy: req.adminId,
      totalAmount,
      lineItems: {
        create: lineItems.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      },
    },
    include: { lineItems: true },
  })

  res.status(201).json(invoice)
}

export async function listInvoices(req, res) {
  const invoices = await prisma.invoice.findMany({
    include: { lineItems: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(invoices)
}

export async function downloadInvoicePdf(req, res) {
  const { id } = req.params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { lineItems: true },
  })
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' })
  }

  const pdfBuffer = await generateInvoicePdf(invoice)

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="invoice-${invoice.id.slice(0, 8)}.pdf"`,
  )
  res.send(pdfBuffer)
}

export async function emailInvoice(req, res) {
  const { id } = req.params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { lineItems: true },
  })
  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' })
  }

  try {
    const pdfBuffer = await generateInvoicePdf(invoice)
    await sendInvoiceEmail({ to: invoice.clientEmail, invoice, pdfBuffer })
  } catch (err) {
    // The PDF still exists and can be downloaded manually even if the
    // email step fails — that's why generate/send are separate endpoints.
    return res.status(502).json({ error: err.message || 'Failed to send email' })
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: { status: 'sent' },
    include: { lineItems: true },
  })

  res.json(updated)
}
