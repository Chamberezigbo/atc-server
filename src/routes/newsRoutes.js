import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import {
  getPublishedNews,
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  togglePublish,
} from "../controllers/newsController.js";

const router = Router();

// Public
router.get("/news", getPublishedNews);

// Admin — every route below requires a valid JWT
router.get("/admin/news", requireAdmin, getAllNews);
router.post("/admin/news", requireAdmin, createNews);
router.put("/admin/news/:id", requireAdmin, updateNews);
router.delete("/admin/news/:id", requireAdmin, deleteNews);
router.patch("/admin/news/:id/publish", requireAdmin, togglePublish);

export default router;
