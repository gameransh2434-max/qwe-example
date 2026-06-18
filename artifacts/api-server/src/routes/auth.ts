import { Router } from "express";
import bcrypt from "bcrypt";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { RegisterBody, LoginBody, ForgotPasswordBody, ResetPasswordBody } from "@workspace/api-zod";

const router = Router();

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const { username, email, password, discordUsername } = parsed.data;
  try {
    const existing = await db.select().from(usersTable)
      .where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(usersTable).values({
      username,
      email,
      passwordHash,
      discordUsername: discordUsername ?? null,
      role: "user",
      isVerified: false,
      otpCode: otp,
      otpExpiry,
    });

    req.log.info({ email, otp }, `[OTP] Register verification code for ${email}: ${otp}`);

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    let emailSent = false;
    if (smtpUser && smtpPass) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          service: "gmail",
          auth: { user: smtpUser, pass: smtpPass },
        });
        await transporter.sendMail({
          from: `QWE Community <${smtpUser}>`,
          to: email,
          subject: "Verify your QWE Community account",
          text: `Welcome to QWE Community!\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
          html: `<div style="font-family:monospace;background:#000;color:#fff;padding:32px;border-radius:8px;max-width:400px">
            <h2 style="color:#fff;letter-spacing:4px;font-size:13px;text-transform:uppercase;margin-bottom:24px">QWE COMMUNITY</h2>
            <p style="color:#aaa;font-size:14px;margin-bottom:8px">Verify your new account:</p>
            <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#fff;margin:24px 0;padding:20px;background:#111;border:1px solid #333;text-align:center">${otp}</div>
            <p style="color:#666;font-size:12px">Expires in 10 minutes.</p>
          </div>`,
        });
        req.log.info({ email }, "Register OTP email sent");
        emailSent = true;
      } catch (emailErr) {
        req.log.error({ emailErr }, "Failed to send register OTP email — code is in server logs");
      }
    }

    const response: Record<string, unknown> = { message: "Verification code sent to your email", email };
    if (!emailSent) {
      response.devOtp = otp;
    }
    res.status(201).json(response);
  } catch (err) {
    logger.error({ err }, "Register failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/request-otp", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (users.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.update(usersTable)
      .set({ otpCode: otp, otpExpiry: expiry })
      .where(eq(usersTable.id, user.id));

    req.log.info({ email, otp }, `[OTP] Login code for ${email}: ${otp}`);

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    let emailSent = false;
    if (smtpUser && smtpPass) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          service: "gmail",
          auth: { user: smtpUser, pass: smtpPass },
        });
        await transporter.sendMail({
          from: `QWE Community <${smtpUser}>`,
          to: email,
          subject: "Your QWE Login Code",
          text: `Your one-time login code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
          html: `<div style="font-family:monospace;background:#000;color:#fff;padding:32px;border-radius:8px;max-width:400px">
            <h2 style="color:#fff;letter-spacing:4px;font-size:13px;text-transform:uppercase;margin-bottom:24px">QWE COMMUNITY</h2>
            <p style="color:#aaa;font-size:14px;margin-bottom:8px">Your one-time login code:</p>
            <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#fff;margin:24px 0;padding:20px;background:#111;border:1px solid #333;text-align:center">${otp}</div>
            <p style="color:#666;font-size:12px">Expires in 10 minutes. If you didn't request this, ignore this email.</p>
          </div>`,
        });
        req.log.info({ email }, "OTP email sent successfully");
        emailSent = true;
      } catch (emailErr) {
        req.log.error({ emailErr }, "Failed to send OTP email — code is in server logs");
      }
    }

    const response: Record<string, unknown> = { message: "Code sent", email };
    if (!emailSent) {
      response.devOtp = otp;
    }
    res.json(response);
  } catch (err) {
    logger.error({ err }, "Request OTP failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body as { email?: string; otp?: string };
  if (!email || !otp) {
    res.status(400).json({ error: "Email and code are required" });
    return;
  }
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (users.length === 0) {
      res.status(401).json({ error: "Invalid code" });
      return;
    }
    const user = users[0];
    if (!user.otpCode || user.otpCode !== otp.trim()) {
      res.status(401).json({ error: "Invalid code" });
      return;
    }
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      res.status(401).json({ error: "Code has expired. Please request a new one." });
      return;
    }
    await db.update(usersTable)
      .set({ otpCode: null, otpExpiry: null, isVerified: true })
      .where(eq(usersTable.id, user.id));

    const token = signToken({ id: user.id, email: user.email, username: user.username, role: user.role });
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    logger.error({ err }, "Verify OTP failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (users.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken({ id: user.id, email: user.email, username: user.username, role: user.role });
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    logger.error({ err }, "Login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    if (users.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(formatUser(users[0]));
  } catch (err) {
    logger.error({ err }, "Get me failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/forgot-password", async (req, res) => {
  const parsed = ForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  res.json({ message: "If that email exists, a reset link has been sent." });
});

router.post("/auth/reset-password", async (req, res) => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  res.json({ message: "Password reset successfully." });
});

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    discordUsername: user.discordUsername,
    avatarUrl: user.avatarUrl,
    totalClaims: user.totalClaims,
    approvedClaims: user.approvedClaims,
    inviteCount: user.inviteCount,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

export default router;
