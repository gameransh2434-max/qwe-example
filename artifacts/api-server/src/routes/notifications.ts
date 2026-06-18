import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { MarkNotificationReadParams } from "@workspace/api-zod";

const router = Router();

router.get("/notifications", requireAuth, async (req: AuthRequest, res) => {
  try {
    const notifs = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, req.user!.id))
      .orderBy(sql`${notificationsTable.createdAt} DESC`)
      .limit(50);

    res.json(notifs.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    })));
  } catch (err) {
    logger.error({ err }, "Get notifications failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/read-all", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.userId, req.user!.id));
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    logger.error({ err }, "Mark all read failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", requireAuth, async (req: AuthRequest, res) => {
  const parsed = MarkNotificationReadParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, parsed.data.id));
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    logger.error({ err }, "Mark notification read failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
