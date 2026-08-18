import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { uploadImage } from '../controllers/uploadController.js'

const router = Router()

// Admin — news post images
router.post('/admin/uploads/image', requireAdmin, upload.single('image'), uploadImage)

// Public — testimonial submitters aren't logged in, so this one has no
// auth gate. Still bounded by multer's 5MB/image-only limits above.
router.post('/uploads/testimonial-photo', upload.single('image'), uploadImage)

export default router
