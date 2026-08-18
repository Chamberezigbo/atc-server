import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import {
  createInvoice,
  listInvoices,
  downloadInvoicePdf,
  emailInvoice,
} from '../controllers/invoiceController.js'

const router = Router()

// All admin-only — invoices contain client contact info and pricing
router.post('/admin/invoices', requireAdmin, createInvoice)
router.get('/admin/invoices', requireAdmin, listInvoices)
router.get('/admin/invoices/:id/pdf', requireAdmin, downloadInvoicePdf)
router.post('/admin/invoices/:id/send-email', requireAdmin, emailInvoice)

export default router
