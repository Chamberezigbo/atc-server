import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import { createLead, getAllLeads } from '../controllers/leadController.js'

const router = Router()

// Public
router.post('/leads', createLead)

// Admin
router.get('/admin/leads', requireAdmin, getAllLeads)

export default router
