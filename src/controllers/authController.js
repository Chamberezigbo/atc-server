import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../db/prismaClient.js";

export async function login(req, res) {
  const { email, password } = req.body;

  const admin = await prisma.adminUser.findUnique({ where: { email } });

  // Same error whether the email doesn't exist OR the password is wrong —
  // telling an attacker which one failed lets them enumerate valid emails.
  if (!admin) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token });
}

// Admin — must be logged in, must know their current password
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "currentPassword and newPassword are required" });
  }
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters" });
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: req.adminId },
  });

  const currentMatches = await bcrypt.compare(
    currentPassword,
    admin.passwordHash,
  );
  if (!currentMatches) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({
    where: { id: req.adminId },
    data: { passwordHash },
  });

  res.json({ ok: true });
}

// Compares two strings without leaking how much of a prefix matched via
// response timing — the whole point of the recovery secret is that it
// can't be brute-forced, so a naive === comparison would undermine that.
function secretsMatch(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Public — no login required (that's the point: this is for when the
// admin is locked out). Gated entirely by ADMIN_RECOVERY_SECRET, a
// separate value from the admin's actual login password, known only to
// the developer/site owner. Resets the login password back to whatever
// SEED_ADMIN_PASSWORD currently is — the admin should log in with that
// and immediately set a new password via Settings.
export async function recoverPassword(req, res) {
  const { recoverySecret } = req.body;

  if (!recoverySecret) {
    return res.status(400).json({ error: "recoverySecret is required" });
  }

  if (!process.env.ADMIN_RECOVERY_SECRET) {
    return res
      .status(500)
      .json({ error: "Recovery is not configured on this server" });
  }

  if (!secretsMatch(recoverySecret, process.env.ADMIN_RECOVERY_SECRET)) {
    return res.status(401).json({ error: "Invalid recovery secret" });
  }

  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 10);
  await prisma.adminUser.update({
    where: { email: process.env.SEED_ADMIN_EMAIL },
    data: { passwordHash },
  });

  res.json({ ok: true });
}
