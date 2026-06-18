import { Router } from "express";
import { db, usersTable, rewardsTable, claimsTable, categoriesTable, notificationsTable, announcementsTable } from "@workspace/db";
import { eq, sql, count, or, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const [totalUsersResult] = await db.select({ count: count() }).from(usersTable);
    const [totalRewardsResult] = await db.select({ count: count() }).from(rewardsTable);
    const [totalClaimsResult] = await db.select({ count: count() }).from(claimsTable);
    const [approvedClaimsResult] = await db.select({ count: count() }).from(claimsTable).where(or(eq(claimsTable.status, "approved"), eq(claimsTable.status, "completed")));
    const [categoriesResult] = await db.select({ count: count() }).from(categoriesTable);
    const [pendingClaimsResult] = await db.select({ count: count() }).from(claimsTable).where(eq(claimsTable.status, "pending"));

    res.json({
      totalUsers: Number(totalUsersResult.count),
      totalRewards: Number(totalRewardsResult.count),
      totalClaims: Number(totalClaimsResult.count),
      approvedClaims: Number(approvedClaimsResult.count),
      totalCategories: Number(categoriesResult.count),
      pendingClaims: Number(pendingClaimsResult.count),
    });
  } catch (err) {
    logger.error({ err }, "Get stats failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [totalClaimsResult] = await db.select({ count: count() }).from(claimsTable).where(eq(claimsTable.userId, req.user!.id));
    const [pendingClaimsResult] = await db.select({ count: count() }).from(claimsTable).where(and(eq(claimsTable.userId, req.user!.id), eq(claimsTable.status, "pending")));
    const [approvedClaimsResult] = await db.select({ count: count() }).from(claimsTable).where(and(eq(claimsTable.userId, req.user!.id), eq(claimsTable.status, "approved")));
    const [rejectedClaimsResult] = await db.select({ count: count() }).from(claimsTable).where(and(eq(claimsTable.userId, req.user!.id), eq(claimsTable.status, "rejected")));
    const [completedClaimsResult] = await db.select({ count: count() }).from(claimsTable).where(and(eq(claimsTable.userId, req.user!.id), eq(claimsTable.status, "completed")));
    const [unreadNotifResult] = await db.select({ count: count() }).from(notificationsTable).where(and(eq(notificationsTable.userId, req.user!.id), eq(notificationsTable.isRead, false)));

    const recentClaims = await db.select({
      id: claimsTable.id,
      userId: claimsTable.userId,
      rewardId: claimsTable.rewardId,
      rewardTitle: rewardsTable.title,
      status: claimsTable.status,
      discordUsername: claimsTable.discordUsername,
      email: claimsTable.email,
      proofUrl: claimsTable.proofUrl,
      notes: claimsTable.notes,
      adminNotes: claimsTable.adminNotes,
      createdAt: claimsTable.createdAt,
      updatedAt: claimsTable.updatedAt,
    })
    .from(claimsTable)
    .leftJoin(rewardsTable, eq(claimsTable.rewardId, rewardsTable.id))
    .where(eq(claimsTable.userId, req.user!.id))
    .orderBy(sql`${claimsTable.createdAt} DESC`)
    .limit(5);

    res.json({
      totalClaims: Number(totalClaimsResult.count),
      pendingClaims: Number(pendingClaimsResult.count),
      approvedClaims: Number(approvedClaimsResult.count),
      rejectedClaims: Number(rejectedClaimsResult.count),
      completedClaims: Number(completedClaimsResult.count),
      notifications: Number(unreadNotifResult.count),
      recentClaims: recentClaims.map((c) => ({
        id: c.id,
        userId: c.userId,
        username: null,
        rewardId: c.rewardId,
        rewardTitle: c.rewardTitle,
        status: c.status,
        discordUsername: c.discordUsername,
        email: c.email,
        proofUrl: c.proofUrl,
        notes: c.notes,
        adminNotes: c.adminNotes,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    logger.error({ err }, "Get user dashboard failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/activity", async (_req, res) => {
  try {
    const approved = await db.select({
      id: claimsTable.id,
      username: usersTable.username,
      rewardTitle: rewardsTable.title,
      createdAt: claimsTable.updatedAt,
    })
    .from(claimsTable)
    .leftJoin(usersTable, eq(claimsTable.userId, usersTable.id))
    .leftJoin(rewardsTable, eq(claimsTable.rewardId, rewardsTable.id))
    .where(or(eq(claimsTable.status, "approved"), eq(claimsTable.status, "completed")))
    .orderBy(sql`${claimsTable.updatedAt} DESC`)
    .limit(5);

    const newUsers = await db.select({ id: usersTable.id, username: usersTable.username, createdAt: usersTable.createdAt })
      .from(usersTable)
      .orderBy(sql`${usersTable.createdAt} DESC`)
      .limit(3);

    const newAnnouncements = await db.select().from(announcementsTable).orderBy(sql`${announcementsTable.createdAt} DESC`).limit(3);

    const activities = [
      ...approved.map((c) => ({
        id: c.id,
        type: "claim_approved" as const,
        username: c.username,
        message: `${c.username} earned ${c.rewardTitle}`,
        createdAt: c.createdAt!.toISOString(),
      })),
      ...newUsers.map((u) => ({
        id: u.id + 10000,
        type: "new_user" as const,
        username: u.username,
        message: `${u.username} joined the community`,
        createdAt: u.createdAt.toISOString(),
      })),
      ...newAnnouncements.map((a) => ({
        id: a.id + 20000,
        type: "announcement" as const,
        username: null,
        message: `Announcement: ${a.title}`,
        createdAt: a.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

    res.json(activities);
  } catch (err) {
    logger.error({ err }, "Get activity failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leaderboard", async (req, res) => {
  const parsed = GetLeaderboardQueryParams.safeParse({ type: req.query.type });
  const type = parsed.success ? (parsed.data.type ?? "claims") : "claims";

  try {
    const users = await db.select().from(usersTable).orderBy(
      type === "invites" ? sql`${usersTable.inviteCount} DESC` : sql`${usersTable.approvedClaims} DESC`
    ).limit(20);

    res.json(users.map((u, idx) => ({
      rank: idx + 1,
      userId: u.id,
      username: u.username,
      avatarUrl: u.avatarUrl,
      score: type === "invites" ? u.inviteCount : u.approvedClaims,
      label: type === "invites" ? "invites" : "rewards",
    })));
  } catch (err) {
    logger.error({ err }, "Get leaderboard failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/search", async (req, res) => {
  const q = req.query.q as string;
  if (!q) {
    res.status(400).json({ error: "q is required" });
    return;
  }
  try {
    const term = `%${q.toLowerCase()}%`;
    const rewards = await db.select({
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
    .where(sql`LOWER(${rewardsTable.title}) LIKE ${term}`)
    .limit(10);

    const cats = await db.select().from(categoriesTable)
      .where(sql`LOWER(${categoriesTable.name}) LIKE ${term}`).limit(5);

    const users = await db.select().from(usersTable)
      .where(sql`LOWER(${usersTable.username}) LIKE ${term}`).limit(5);

    res.json({
      rewards: rewards.map((r) => ({
        id: r.id, title: r.title, description: r.description,
        requirement: r.requirement, requirementValue: r.requirementValue,
        rewardValue: r.rewardValue, categoryId: r.categoryId,
        categoryName: r.categoryName, isFeatured: r.isFeatured,
        isActive: r.isActive, claimCount: r.claimCount,
        createdAt: r.createdAt.toISOString(),
      })),
      categories: cats.map((c) => ({
        id: c.id, name: c.name, slug: c.slug, icon: c.icon,
        description: c.description, order: c.order, rewardCount: 0,
      })),
      users: users.map((u) => ({
        id: u.id, username: u.username, email: u.email, role: u.role,
        discordUsername: u.discordUsername, avatarUrl: u.avatarUrl,
        totalClaims: u.totalClaims, approvedClaims: u.approvedClaims,
        inviteCount: u.inviteCount, isVerified: u.isVerified,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    logger.error({ err }, "Search failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
