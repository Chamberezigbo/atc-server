import PDFDocument from 'pdfkit'
import { formatNairaForPdf } from '../utils/currency.js'

const LAVENDER = '#a083dc'
const TEXT_MUTED = '#5a5a5a'

// Builds an invoice PDF in memory and resolves with the finished Buffer —
// pdfkit is a stream, so we collect its output chunks rather than write
// to a file (no disk writes anywhere in this app, same reasoning as the
// image uploads going straight to Cloudinary).
export function generateInvoicePdf(invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Header
    doc
      .fillColor(LAVENDER)
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('ATClean', 50, 50)
    doc
      .fillColor(TEXT_MUTED)
      .fontSize(10)
      .font('Helvetica')
      .text('Professional Cleaning Services', 50, 80)

    doc
      .fillColor('#000000')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('INVOICE', 400, 50, { align: 'right' })
    doc
      .fillColor(TEXT_MUTED)
      .fontSize(10)
      .font('Helvetica')
      .text(`Invoice #${invoice.id.slice(0, 8).toUpperCase()}`, 400, 75, { align: 'right' })
      .text(new Date(invoice.createdAt).toLocaleDateString(), 400, 90, { align: 'right' })

    doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#e6d9f5').stroke()

    // Bill to
    doc
      .fillColor(TEXT_MUTED)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('BILL TO', 50, 140)
    doc
      .fillColor('#000000')
      .fontSize(12)
      .font('Helvetica')
      .text(invoice.clientName, 50, 155)
      .text(invoice.clientEmail, 50, 172)

    // Line items table — "NGN 150,000.00" is wider than a "$150.00"-sized
    // column, so Description/Qty are narrower here than a $-only layout
    // would need, leaving Unit Price/Total room to not wrap to 2 lines.
    let y = 220
    doc.fillColor('#ffffff').rect(50, y, 495, 24).fill(LAVENDER)
    doc
      .fillColor('#ffffff')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Description', 60, y + 7)
      .text('Qty', 300, y + 7, { width: 40, align: 'right' })
      .text('Unit Price', 345, y + 7, { width: 95, align: 'right' })
      .text('Total', 450, y + 7, { width: 90, align: 'right' })

    y += 24
    doc.font('Helvetica').fillColor('#000000')

    for (const item of invoice.lineItems) {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice)
      doc
        .fontSize(10)
        .text(item.description, 60, y + 8, { width: 230 })
        .text(String(item.quantity), 300, y + 8, { width: 40, align: 'right' })
        .text(formatNairaForPdf(item.unitPrice), 345, y + 8, { width: 95, align: 'right' })
        .text(formatNairaForPdf(lineTotal), 450, y + 8, { width: 90, align: 'right' })
      doc.moveTo(50, y + 28).lineTo(545, y + 28).strokeColor('#e6d9f5').stroke()
      y += 28
    }

    // Total
    y += 15
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(LAVENDER)
      .text('Total', 345, y, { width: 60, align: 'right' })
      .text(formatNairaForPdf(invoice.totalAmount), 400, y, { width: 140, align: 'right' })

    // Footer
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(TEXT_MUTED)
      .text('Thank you for choosing ATClean!', 50, 750, { align: 'center', width: 495 })

    doc.end()
  })
}
