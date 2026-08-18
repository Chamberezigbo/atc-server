import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import {
  getActiveServices,
  getAllServices,
  createService,
  updateService,
  deleteService,
  toggleServiceActive,
} from '../controllers/serviceController.js'

const router = Router()

// Public
router.get('/services', getActiveServices)

// Admin
router.get('/admin/services', requireAdmin, getAllServices)
router.post('/admin/services', requireAdmin, createService)
router.put('/admin/services/:id', requireAdmin, updateService)
router.delete('/admin/services/:id', requireAdmin, deleteService)
router.patch('/admin/services/:id/toggle-active', requireAdmin, toggleServiceActive)

export default router
