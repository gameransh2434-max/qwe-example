import { Router } from "express";
import { db, announcementsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { CreateAnnouncementBody, DeleteAnnouncementParams } from "@workspace/api-zod";

const router = Router();

router.get("/announcements", async (_req, res) => {
  try {
    const items = await db.select()
      .from(announcementsTable)
      .orderBy(sql`${announcementsTable.isPinned} DESC, ${announcementsTable.createdAt} DESC`)
      .limit(20);

    res.json(items.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      type: a.type,
      isPinned: a.isPinned,
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (err) {
    logger.error({ err }, "Get announcements failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/announcements", requireAdmin, async (req: AuthRequest, res) => {
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  try {
    const [ann] = await db.insert(announcementsTable).values({
      title: parsed.data.title,
      content: parsed.data.content,
      type: parsed.data.type,
      isPinned: parsed.data.isPinned ?? false,
    }).returning();

    res.status(201).json({
      id: ann.id,
      title: ann.title,
      content: ann.content,
      type: ann.type,
      isPinned: ann.isPinned,
      createdAt: ann.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Create announcement failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/announcements/:id", requireAdmin, async (req, res) => {
  const parsed = DeleteAnnouncementParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(announcementsTable).where(eq(announcementsTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Delete announcement failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
