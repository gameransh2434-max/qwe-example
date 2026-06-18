import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { AdminUpdateUserRoleParams, AdminUpdateUserRoleBody } from "@workspace/api-zod";

const router = Router();

router.get("/admin/users", requireAdmin, async (_req: AuthRequest, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(sql`${usersTable.createdAt} DESC`);
    res.json(users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      discordUsername: u.discordUsername,
      avatarUrl: u.avatarUrl,
      totalClaims: u.totalClaims,
      approvedClaims: u.approvedClaims,
      inviteCount: u.inviteCount,
      isVerified: u.isVerified,
      createdAt: u.createdAt.toISOString(),
    })));
  } catch (err) {
    logger.error({ err }, "Admin get users failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/users/:id/role", requireAdmin, async (req: AuthRequest, res) => {
  const paramsParsed = AdminUpdateUserRoleParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = AdminUpdateUserRoleBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const [user] = await db.update(usersTable)
      .set({ role: bodyParsed.data.role })
      .where(eq(usersTable.id, paramsParsed.data.id))
      .returning();

    if (!user) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json({
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
    });
  } catch (err) {
    logger.error({ err }, "Admin update role failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
