import { Router } from "express";
import { requireAdmin } from "../middleware/auth.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import {
  login,
  changePassword,
  recoverPassword,
} from "../controllers/authController.js";

const router = Router();

// 5 attempts per 15 minutes per IP — the recovery secret has no other
// brute-force protection, since by design it can't require being logged in.
const recoveryRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

router.post("/login", login);
router.post("/change-password", requireAdmin, changePassword);
router.post("/recover-password", recoveryRateLimit, recoverPassword);

export default router;
