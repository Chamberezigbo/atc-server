import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import {
  getActiveHeroSlides,
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlideActive,
} from '../controllers/heroSlideController.js'

const router = Router()

// Public
router.get('/hero-slides', getActiveHeroSlides)

// Admin
router.get('/admin/hero-slides', requireAdmin, getAllHeroSlides)
router.post('/admin/hero-slides', requireAdmin, createHeroSlide)
router.put('/admin/hero-slides/:id', requireAdmin, updateHeroSlide)
router.delete('/admin/hero-slides/:id', requireAdmin, deleteHeroSlide)
router.patch('/admin/hero-slides/:id/toggle-active', requireAdmin, toggleHeroSlideActive)

export default router
