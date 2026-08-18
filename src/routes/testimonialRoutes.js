import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import {
  getApprovedTestimonials,
  submitTestimonial,
  getAllTestimonials,
  approveTestimonial,
  rejectTestimonial,
  deleteTestimonial,
} from '../controllers/testimonialController.js'

const router = Router()

// Public
router.get('/testimonials', getApprovedTestimonials)
router.post('/testimonials', submitTestimonial)

// Admin
router.get('/admin/testimonials', requireAdmin, getAllTestimonials)
router.patch('/admin/testimonials/:id/approve', requireAdmin, approveTestimonial)
router.patch('/admin/testimonials/:id/reject', requireAdmin, rejectTestimonial)
router.delete('/admin/testimonials/:id', requireAdmin, deleteTestimonial)

export default router
