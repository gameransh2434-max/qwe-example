import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import app from "./app";
import { logger } from "./lib/logger";
import { db, worldChatTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

const MAX_MESSAGE_LENGTH = 300;
const HISTORY_LIMIT = 50;

server.on("upgrade", (request, socket, head) => {
  const { pathname } = new URL(request.url ?? "/", `http://localhost`);
  if (pathname === "/api/chat/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on("connection", async (ws: WebSocket) => {
  try {
    const history = await db
      .select()
      .from(worldChatTable)
      .orderBy(sql`${worldChatTable.createdAt} DESC`)
      .limit(HISTORY_LIMIT);

    ws.send(JSON.stringify({ type: "history", messages: history.reverse() }));
  } catch (err) {
    logger.error({ err }, "Failed to load chat history");
  }

  ws.on("message", async (raw) => {
    try {
      const data = JSON.parse(raw.toString()) as { username?: string; message?: string };
      const username = String(data.username ?? "Guest").trim().slice(0, 32);
      const message = String(data.message ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);

      if (!username || !message) return;

      const [saved] = await db
        .insert(worldChatTable)
        .values({ username, message })
        .returning();

      const packet = JSON.stringify({ type: "message", message: saved });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(packet);
        }
      });
    } catch (err) {
      logger.error({ err }, "Chat message error");
    }
  });
});

server.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
