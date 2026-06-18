import { Router } from "express";
import { db, rewardsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { GetRewardsQueryParams, CreateRewardBody, GetRewardParams, UpdateRewardParams, UpdateRewardBody, DeleteRewardParams } from "@workspace/api-zod";

const router = Router();

router.get("/rewards", async (req, res) => {
  const parsed = GetRewardsQueryParams.safeParse({
    categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
    search: req.query.search,
    featured: req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined,
  });

  try {
    let query = db.select({
      id: rewardsTable.id,
      title: rewardsTable.title,
      description: rewardsTable.description,
      requirement: rewardsTable.requirement,
      requirementValue: rewardsTable.requirementValue,
      rewardValue: rewardsTable.rewardValue,
      categoryId: rewardsTable.categoryId,
      categoryName: categoriesTable.name,
      isFeatured: rewardsTable.isFeatured,
      isActive: rewardsTable.isActive,
      claimCount: rewardsTable.claimCount,
      createdAt: rewardsTable.createdAt,
    })
    .from(rewardsTable)
    .leftJoin(categoriesTable, eq(rewardsTable.categoryId, categoriesTable.id));

    const conditions: ReturnType<typeof eq>[] = [];

    if (parsed.success && parsed.data.categoryId !== undefined) {
      conditions.push(eq(rewardsTable.categoryId, parsed.data.categoryId));
    }
    if (parsed.success && parsed.data.featured !== undefined) {
      conditions.push(eq(rewardsTable.isFeatured, parsed.data.featured));
    }

    let rows;
    if (parsed.success && parsed.data.search) {
      rows = await query.where(ilike(rewardsTable.title, `%${parsed.data.search}%`));
    } else if (conditions.length > 0) {
      rows = await query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    } else {
      rows = await query;
    }

    res.json(rows.map(formatReward));
  } catch (err) {
    logger.error({ err }, "Get rewards failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/rewards", requireAdmin, async (req: AuthRequest, res) => {
  const parsed = CreateRewardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  try {
    const [reward] = await db.insert(rewardsTable).values({
      title: parsed.data.title,
      description: parsed.data.description,
      requirement: parsed.data.requirement,
      requirementValue: parsed.data.requirementValue ?? null,
      rewardValue: parsed.data.rewardValue,
      categoryId: parsed.data.categoryId,
      isFeatured: parsed.data.isFeatured ?? false,
      isActive: parsed.data.isActive ?? true,
    }).returning();
    res.status(201).json({ ...formatReward({ ...reward, categoryName: null }) });
  } catch (err) {
    logger.error({ err }, "Create reward failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/rewards/:id", async (req, res) => {
  const parsed = GetRewardParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const rows = await db.select({
      id: rewardsTable.id,
      title: rewardsTable.title,
      description: rewardsTable.description,
      requirement: rewardsTable.requirement,
      requirementValue: rewardsTable.requirementValue,
      rewardValue: rewardsTable.rewardValue,
      categoryId: rewardsTable.categoryId,
      categoryName: categoriesTable.name,
      isFeatured: rewardsTable.isFeatured,
      isActive: rewardsTable.isActive,
      claimCount: rewardsTable.claimCount,
      createdAt: rewardsTable.createdAt,
    })
    .from(rewardsTable)
    .leftJoin(categoriesTable, eq(rewardsTable.categoryId, categoriesTable.id))
    .where(eq(rewardsTable.id, parsed.data.id))
    .limit(1);

    if (rows.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatReward(rows[0]));
  } catch (err) {
    logger.error({ err }, "Get reward failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/rewards/:id", requireAdmin, async (req: AuthRequest, res) => {
  const paramsParsed = UpdateRewardParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateRewardBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const updates: Partial<typeof rewardsTable.$inferInsert> = {};
    if (bodyParsed.data.title !== undefined) updates.title = bodyParsed.data.title;
    if (bodyParsed.data.description !== undefined) updates.description = bodyParsed.data.description;
    if (bodyParsed.data.requirement !== undefined) updates.requirement = bodyParsed.data.requirement;
    if (bodyParsed.data.requirementValue !== undefined) updates.requirementValue = bodyParsed.data.requirementValue;
    if (bodyParsed.data.rewardValue !== undefined) updates.rewardValue = bodyParsed.data.rewardValue;
    if (bodyParsed.data.categoryId !== undefined) updates.categoryId = bodyParsed.data.categoryId;
    if (bodyParsed.data.isFeatured !== undefined) updates.isFeatured = bodyParsed.data.isFeatured;
    if (bodyParsed.data.isActive !== undefined) updates.isActive = bodyParsed.data.isActive;
    const [reward] = await db.update(rewardsTable).set(updates).where(eq(rewardsTable.id, paramsParsed.data.id)).returning();
    if (!reward) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatReward({ ...reward, categoryName: null }));
  } catch (err) {
    logger.error({ err }, "Update reward failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/rewards/:id", requireAdmin, async (req, res) => {
  const parsed = DeleteRewardParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(rewardsTable).where(eq(rewardsTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Delete reward failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatReward(r: { id: number; title: string; description: string; requirement: string; requirementValue: number | null; rewardValue: string; categoryId: number; categoryName: string | null; isFeatured: boolean; isActive: boolean; claimCount: number; createdAt: Date }) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    requirement: r.requirement,
    requirementValue: r.requirementValue,
    rewardValue: r.rewardValue,
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    isFeatured: r.isFeatured,
    isActive: r.isActive,
    claimCount: r.claimCount,
    createdAt: r.createdAt.toISOString(),
  };
}

export default router;
