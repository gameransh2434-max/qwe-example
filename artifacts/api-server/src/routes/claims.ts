import { Router } from "express";
import { db, claimsTable, claimMessagesTable, usersTable, rewardsTable, notificationsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { GetClaimsQueryParams, GetClaimParams, UpdateClaimStatusParams, UpdateClaimStatusBody } from "@workspace/api-zod";

const router = Router();

router.get("/claims", requireAuth, async (req: AuthRequest, res) => {
  const isAdmin = req.user!.role === "admin";
  try {
    const rows = await db.select({
      id: claimsTable.id,
      userId: claimsTable.userId,
      username: usersTable.username,
      rewardId: claimsTable.rewardId,
      rewardTitle: rewardsTable.title,
      rewardValue: rewardsTable.rewardValue,
      status: claimsTable.status,
      discordUsername: claimsTable.discordUsername,
      discordLink: claimsTable.discordLink,
      email: claimsTable.email,
      paymentMethod: claimsTable.paymentMethod,
      paymentAmount: claimsTable.paymentAmount,
      proofUrl: claimsTable.proofUrl,
      notes: claimsTable.notes,
      adminNotes: claimsTable.adminNotes,
      createdAt: claimsTable.createdAt,
      updatedAt: claimsTable.updatedAt,
    })
    .from(claimsTable)
    .leftJoin(usersTable, eq(claimsTable.userId, usersTable.id))
    .leftJoin(rewardsTable, eq(claimsTable.rewardId, rewardsTable.id))
    .where(isAdmin ? undefined : eq(claimsTable.userId, req.user!.id))
    .orderBy(sql`${claimsTable.createdAt} DESC`);

    const parsed = GetClaimsQueryParams.safeParse({ status: req.query.status, userId: req.query.userId ? Number(req.query.userId) : undefined });
    let filtered = rows;
    if (parsed.success && parsed.data.status) {
      filtered = rows.filter((r) => r.status === parsed.data.status);
    }

    res.json(filtered.map(formatClaim));
  } catch (err) {
    logger.error({ err }, "Get claims failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/claims", requireAuth, async (req: AuthRequest, res) => {
  const body = req.body;
  if (!body.rewardId || !body.discordUsername) {
    res.status(400).json({ error: "rewardId and discordUsername are required" });
    return;
  }
  try {
    const [claim] = await db.insert(claimsTable).values({
      userId: req.user!.id,
      rewardId: body.rewardId,
      discordUsername: body.discordUsername,
      discordLink: body.discordLink ?? null,
      email: body.email ?? req.user!.email ?? "",
      paymentMethod: body.paymentMethod ?? "gmail",
      paymentAmount: body.paymentAmount ?? null,
      proofUrl: body.proofUrl ?? null,
      notes: body.notes ?? null,
      status: "pending",
    }).returning();

    await db.update(usersTable)
      .set({ totalClaims: sql`${usersTable.totalClaims} + 1` })
      .where(eq(usersTable.id, req.user!.id));

    await db.update(rewardsTable)
      .set({ claimCount: sql`${rewardsTable.claimCount} + 1` })
      .where(eq(rewardsTable.id, body.rewardId));

    res.status(201).json(formatClaim({ ...claim, username: req.user!.username, rewardTitle: null, rewardValue: null }));
  } catch (err) {
    logger.error({ err }, "Create claim failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/claims/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = GetClaimParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const rows = await db.select({
      id: claimsTable.id,
      userId: claimsTable.userId,
      username: usersTable.username,
      rewardId: claimsTable.rewardId,
      rewardTitle: rewardsTable.title,
      rewardValue: rewardsTable.rewardValue,
      status: claimsTable.status,
      discordUsername: claimsTable.discordUsername,
      discordLink: claimsTable.discordLink,
      email: claimsTable.email,
      paymentMethod: claimsTable.paymentMethod,
      paymentAmount: claimsTable.paymentAmount,
      proofUrl: claimsTable.proofUrl,
      notes: claimsTable.notes,
      adminNotes: claimsTable.adminNotes,
      createdAt: claimsTable.createdAt,
      updatedAt: claimsTable.updatedAt,
    })
    .from(claimsTable)
    .leftJoin(usersTable, eq(claimsTable.userId, usersTable.id))
    .leftJoin(rewardsTable, eq(claimsTable.rewardId, rewardsTable.id))
    .where(and(
      eq(claimsTable.id, parsed.data.id),
      req.user!.role === "admin" ? undefined : eq(claimsTable.userId, req.user!.id)
    ))
    .limit(1);

    if (rows.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(formatClaim(rows[0]));
  } catch (err) {
    logger.error({ err }, "Get claim failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/claims/:id/status", requireAdmin, async (req: AuthRequest, res) => {
  const paramsParsed = UpdateClaimStatusParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateClaimStatusBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const [existing] = await db.select({ status: claimsTable.status, userId: claimsTable.userId })
      .from(claimsTable)
      .where(eq(claimsTable.id, paramsParsed.data.id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const [claim] = await db.update(claimsTable)
      .set({
        status: bodyParsed.data.status,
        adminNotes: bodyParsed.data.adminNotes ?? null,
        updatedAt: new Date(),
      })
      .where(eq(claimsTable.id, paramsParsed.data.id))
      .returning();

    if (!claim) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const newIsCountable = bodyParsed.data.status === "approved" || bodyParsed.data.status === "completed";
    const oldIsCountable = existing.status === "approved" || existing.status === "completed";
    if (newIsCountable && !oldIsCountable) {
      await db.update(usersTable)
        .set({ approvedClaims: sql`${usersTable.approvedClaims} + 1` })
        .where(eq(usersTable.id, claim.userId));
    }

    const notifType = bodyParsed.data.status === "approved" || bodyParsed.data.status === "completed"
      ? "claim_approved" : bodyParsed.data.status === "rejected" ? "claim_rejected" : "system";
    const notifTitle = bodyParsed.data.status === "approved" || bodyParsed.data.status === "completed"
      ? "Claim Approved ✓" : bodyParsed.data.status === "rejected" ? "Claim Rejected" : "Claim Updated";
    const notifMessage = `Your claim #${claim.id} has been ${bodyParsed.data.status}.${bodyParsed.data.adminNotes ? " Note: " + bodyParsed.data.adminNotes : ""}`;

    await db.insert(notificationsTable).values({
      userId: claim.userId,
      type: notifType,
      title: notifTitle,
      message: notifMessage,
    });

    res.json(formatClaim({ ...claim, username: null, rewardTitle: null, rewardValue: null }));
  } catch (err) {
    logger.error({ err }, "Update claim status failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/claims/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const claimId = Number(req.params.id);
  if (!claimId) {
    res.status(400).json({ error: "Invalid claim id" });
    return;
  }
  try {
    const [claim] = await db.select({ userId: claimsTable.userId })
      .from(claimsTable)
      .where(eq(claimsTable.id, claimId))
      .limit(1);
    if (!claim || (req.user!.role !== "admin" && claim.userId !== req.user!.id)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const messages = await db.select({
      id: claimMessagesTable.id,
      claimId: claimMessagesTable.claimId,
      userId: claimMessagesTable.userId,
      username: usersTable.username,
      content: claimMessagesTable.content,
      isAdmin: claimMessagesTable.isAdmin,
      createdAt: claimMessagesTable.createdAt,
    })
    .from(claimMessagesTable)
    .leftJoin(usersTable, eq(claimMessagesTable.userId, usersTable.id))
    .where(eq(claimMessagesTable.claimId, claimId))
    .orderBy(claimMessagesTable.createdAt);

    res.json(messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })));
  } catch (err) {
    logger.error({ err }, "Get claim messages failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/claims/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const claimId = Number(req.params.id);
  const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
  if (!claimId || !content || content.length > 2000) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const [claim] = await db.select({ userId: claimsTable.userId })
      .from(claimsTable)
      .where(eq(claimsTable.id, claimId))
      .limit(1);
    if (!claim || (req.user!.role !== "admin" && claim.userId !== req.user!.id)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const [msg] = await db.insert(claimMessagesTable).values({
      claimId,
      userId: req.user!.id,
      content,
      isAdmin: req.user!.role === "admin",
    }).returning();

    if (req.user!.role === "admin") {
      await db.insert(notificationsTable).values({
        userId: claim.userId,
        type: "system",
        title: "Admin replied to your claim",
        message: `New message on claim #${claimId}: "${content.substring(0, 80)}"`,
      });
    }

    res.status(201).json({ ...msg, createdAt: msg.createdAt.toISOString(), username: req.user!.username });
  } catch (err) {
    logger.error({ err }, "Post claim message failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

function formatClaim(c: {
  id: number; userId: number; username: string | null; rewardId: number; rewardTitle: string | null;
  rewardValue?: string | null;
  status: string; discordUsername: string; discordLink?: string | null; email: string;
  paymentMethod?: string | null; paymentAmount?: number | null;
  proofUrl: string | null; notes: string | null; adminNotes: string | null;
  createdAt: Date; updatedAt: Date;
}) {
  return {
    id: c.id,
    userId: c.userId,
    username: c.username,
    rewardId: c.rewardId,
    rewardTitle: c.rewardTitle,
    rewardValue: c.rewardValue ?? null,
    status: c.status,
    discordUsername: c.discordUsername,
    discordLink: c.discordLink ?? null,
    email: c.email,
    paymentMethod: c.paymentMethod ?? "gmail",
    paymentAmount: c.paymentAmount ?? null,
    proofUrl: c.proofUrl,
    notes: c.notes,
    adminNotes: c.adminNotes,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export default router;
