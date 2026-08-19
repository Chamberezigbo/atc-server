import { Resend } from 'resend'
import { formatNaira } from '../utils/currency.js'

// Resend's sandbox sender only works until a real domain is verified —
// see server/.env.example for where to swap this once you have one.
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || 'ATClean <onboarding@resend.dev>'

// Constructed lazily inside each send function, not at module load — the
// Resend client throws immediately if the key is missing, which would
// crash the whole server on startup if this ran at import time instead.
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set — add it to server/.env to send emails')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendInvoiceEmail({ to, invoice, pdfBuffer }) {
  const resend = getResendClient()

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Your ATClean Invoice #${invoice.id.slice(0, 8).toUpperCase()}`,
    html: `
      <p>Hi ${invoice.clientName},</p>
      <p>Thank you for choosing ATClean. Your invoice is attached.</p>
      <p><strong>Total: ${formatNaira(invoice.totalAmount)}</strong></p>
      <p>— The ATClean Team</p>
    `,
    attachments: [
      {
        filename: `invoice-${invoice.id.slice(0, 8)}.pdf`,
        content: pdfBuffer.toString('base64'),
      },
    ],
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }
}

export async function sendLeadFollowUpEmail({ to, subject, message }) {
  const resend = getResendClient()

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    // message comes from an admin textarea (plain text) — convert
    // newlines to <br> rather than trusting it as raw HTML.
    html: message.replace(/\n/g, '<br>'),
  })

  if (error) {
    throw new Error(error.message || 'Failed to send email')
  }
}
