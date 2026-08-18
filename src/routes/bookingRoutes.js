import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import {
  createBooking,
  getAllBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js'

const router = Router()

// Public
router.post('/bookings', createBooking)

// Admin
router.get('/admin/bookings', requireAdmin, getAllBookings)
router.patch('/admin/bookings/:id/status', requireAdmin, updateBookingStatus)

export default router
