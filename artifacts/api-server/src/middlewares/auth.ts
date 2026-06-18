import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const JWT_SECRET = process.env.SESSION_SECRET || "qwe-community-secret-2024";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
}

export function signToken(payload: { id: number; email: string; username: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; username: string; role: string };
    const users = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id)).limit(1);
    if (users.length === 0) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn({ err }, "Auth token invalid");
    res.status(401).json({ error: "Invalid token" });
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; username: string; role: string };
    req.user = decoded;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
