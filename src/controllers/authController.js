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
