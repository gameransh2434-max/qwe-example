import { Router } from "express";
import { db, categoriesTable, rewardsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { CreateCategoryBody, DeleteCategoryParams } from "@workspace/api-zod";

const router = Router();

router.get("/categories", async (_req, res) => {
  try {
    const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.order);
    const counts = await db
      .select({ categoryId: rewardsTable.categoryId, count: count() })
      .from(rewardsTable)
      .where(eq(rewardsTable.isActive, true))
      .groupBy(rewardsTable.categoryId);

    const countMap = new Map(counts.map((c) => [c.categoryId, Number(c.count)]));

    res.json(cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      description: c.description,
      order: c.order,
      rewardCount: countMap.get(c.id) ?? 0,
    })));
  } catch (err) {
    logger.error({ err }, "Get categories failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/categories", requireAdmin, async (req: AuthRequest, res) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  try {
    const [cat] = await db.insert(categoriesTable).values({
      name: parsed.data.name,
      slug: parsed.data.slug,
      icon: parsed.data.icon,
      description: parsed.data.description ?? null,
      order: parsed.data.order ?? 0,
    }).returning();
    res.status(201).json({ ...cat, rewardCount: 0 });
  } catch (err) {
    logger.error({ err }, "Create category failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/categories/:id", requireAdmin, async (req, res) => {
  const parsed = DeleteCategoryParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Delete category failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
