import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import {
  createInvoice,
  listInvoices,
  downloadInvoicePdf,
  viewInvoicePdf,
  emailInvoice,
} from '../controllers/invoiceController.js'

const router = Router()

// Admin-only — invoices contain client contact info and pricing
router.post('/admin/invoices', requireAdmin, createInvoice)
router.get('/admin/invoices', requireAdmin, listInvoices)
router.get('/admin/invoices/:id/pdf', requireAdmin, downloadInvoicePdf)
router.post('/admin/invoices/:id/send-email', requireAdmin, emailInvoice)

// Public — shareable "view invoice" link (e.g. sent via WhatsApp)
router.get('/invoices/:id/pdf', viewInvoicePdf)

export default router
