import { Router } from "express";
import { db, ticketsTable, messagesTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { CreateTicketBody, GetTicketParams, SendTicketMessageParams, SendTicketMessageBody, CloseTicketParams } from "@workspace/api-zod";

const router = Router();

router.get("/tickets", requireAuth, async (req: AuthRequest, res) => {
  const isAdmin = req.user!.role === "admin";
  try {
    const rows = await db.select({
      id: ticketsTable.id,
      userId: ticketsTable.userId,
      username: usersTable.username,
      subject: ticketsTable.subject,
      status: ticketsTable.status,
      createdAt: ticketsTable.createdAt,
      updatedAt: ticketsTable.updatedAt,
    })
    .from(ticketsTable)
    .leftJoin(usersTable, eq(ticketsTable.userId, usersTable.id))
    .where(isAdmin ? undefined : eq(ticketsTable.userId, req.user!.id))
    .orderBy(sql`${ticketsTable.updatedAt} DESC`);

    const msgCounts = await db.select({
      ticketId: messagesTable.ticketId,
      count: sql<number>`count(*)`,
    }).from(messagesTable).groupBy(messagesTable.ticketId);

    const countMap = new Map(msgCounts.map((m) => [m.ticketId, Number(m.count)]));

    res.json(rows.map((t) => ({
      id: t.id,
      userId: t.userId,
      username: t.username,
      subject: t.subject,
      status: t.status,
      messageCount: countMap.get(t.id) ?? 0,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })));
  } catch (err) {
    logger.error({ err }, "Get tickets failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tickets", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  try {
    const [ticket] = await db.insert(ticketsTable).values({
      userId: req.user!.id,
      subject: parsed.data.subject,
      status: "open",
    }).returning();

    await db.insert(messagesTable).values({
      ticketId: ticket.id,
      userId: req.user!.id,
      content: parsed.data.message,
      isAdmin: false,
    });

    res.status(201).json({
      id: ticket.id,
      userId: ticket.userId,
      username: req.user!.username,
      subject: ticket.subject,
      status: ticket.status,
      messageCount: 1,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Create ticket failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tickets/:id", requireAuth, async (req: AuthRequest, res) => {
  const parsed = GetTicketParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const isAdmin = req.user!.role === "admin";
    const tickets = await db.select({
      id: ticketsTable.id,
      userId: ticketsTable.userId,
      username: usersTable.username,
      subject: ticketsTable.subject,
      status: ticketsTable.status,
      createdAt: ticketsTable.createdAt,
    })
    .from(ticketsTable)
    .leftJoin(usersTable, eq(ticketsTable.userId, usersTable.id))
    .where(eq(ticketsTable.id, parsed.data.id))
    .limit(1);

    if (tickets.length === 0) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const ticket = tickets[0];
    if (!isAdmin && ticket.userId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const msgs = await db.select({
      id: messagesTable.id,
      ticketId: messagesTable.ticketId,
      userId: messagesTable.userId,
      username: usersTable.username,
      content: messagesTable.content,
      isAdmin: messagesTable.isAdmin,
      proofUrl: messagesTable.proofUrl,
      createdAt: messagesTable.createdAt,
    })
    .from(messagesTable)
    .leftJoin(usersTable, eq(messagesTable.userId, usersTable.id))
    .where(eq(messagesTable.ticketId, parsed.data.id))
    .orderBy(messagesTable.createdAt);

    res.json({
      id: ticket.id,
      userId: ticket.userId,
      username: ticket.username,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt!.toISOString(),
      messages: msgs.map((m) => ({
        id: m.id,
        ticketId: m.ticketId,
        userId: m.userId,
        username: m.username,
        content: m.content,
        isAdmin: m.isAdmin,
        proofUrl: m.proofUrl,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    logger.error({ err }, "Get ticket failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tickets/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const paramsParsed = SendTicketMessageParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = SendTicketMessageBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const isAdmin = req.user!.role === "admin";
    const [msg] = await db.insert(messagesTable).values({
      ticketId: paramsParsed.data.id,
      userId: req.user!.id,
      content: bodyParsed.data.content,
      isAdmin,
      proofUrl: bodyParsed.data.proofUrl ?? null,
    }).returning();

    await db.update(ticketsTable)
      .set({ updatedAt: new Date(), status: isAdmin ? "in_progress" : "open" })
      .where(eq(ticketsTable.id, paramsParsed.data.id));

    res.status(201).json({
      id: msg.id,
      ticketId: msg.ticketId,
      userId: msg.userId,
      username: req.user!.username,
      content: msg.content,
      isAdmin: msg.isAdmin,
      proofUrl: msg.proofUrl,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Send message failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tickets/:id/close", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CloseTicketParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [ticket] = await db.update(ticketsTable)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(ticketsTable.id, parsed.data.id))
      .returning();

    if (!ticket) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json({
      id: ticket.id,
      userId: ticket.userId,
      username: null,
      subject: ticket.subject,
      status: ticket.status,
      messageCount: 0,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Close ticket failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
