import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import heroSlideRoutes from "./routes/heroSlideRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

const app = express();

// Needed so req.ip reflects the real client, not the reverse proxy
// (cPanel/Railway both put one in front of the app) — the rate limiter
// on /api/auth/recover-password relies on this being accurate.
app.set("trust proxy", 1);

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api", newsRoutes);
app.use("/api", uploadRoutes);
app.use("/api", testimonialRoutes);
app.use("/api", leadRoutes);
app.use("/api", heroSlideRoutes);
app.use("/api", invoiceRoutes);
app.use("/api", serviceRoutes);
app.use("/api", bookingRoutes);

// Multer errors (bad file type, too large) land here instead of crashing
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message || "Upload failed" });
  }
  next();
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
