import { useEffect, useRef, useState, useCallback } from "react";
import { Send, MessageCircle, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  createdAt: string;
}

function getWsUrl() {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/api/chat/ws`;
}

function getGuestName(): string {
  let name = localStorage.getItem("qwe_guest_name");
  if (!name) {
    name = `Guest${Math.floor(Math.random() * 9000) + 1000}`;
    localStorage.setItem("qwe_guest_name", name);
  }
  return name;
}

export function WorldChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [guestName, setGuestName] = useState(() => getGuestName());
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(guestName);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayName = user?.username ?? guestName;

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return;

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data as string) as
          | { type: "history"; messages: ChatMessage[] }
          | { type: "message"; message: ChatMessage };

        if (data.type === "history") {
          setMessages(data.messages);
        } else if (data.type === "message") {
          setMessages((prev) => [...prev.slice(-99), data.message]);
        }
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ username: displayName, message: text }));
    setInput("");
  };

  const saveGuestName = () => {
    const trimmed = nameInput.trim().slice(0, 32);
    if (trimmed) {
      localStorage.setItem("qwe_guest_name", trimmed);
      setGuestName(trimmed);
    }
    setEditingName(false);
  };

  function timeLabel(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-col h-80 border border-white/10 bg-black/40 rounded-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-white/60" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/80">World Chat</span>
          <span className="text-[10px] font-mono text-white/30 ml-1">live</span>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          )}
          {!user && (
            editingName ? (
              <form
                onSubmit={(e) => { e.preventDefault(); saveGuestName(); }}
                className="flex items-center gap-1"
              >
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={32}
                  className="bg-white/10 border border-white/20 text-white text-xs font-mono px-2 py-0.5 w-28 outline-none"
                  placeholder="Your name…"
                />
                <button type="submit" className="text-[10px] font-mono text-white/60 hover:text-white px-1">✓</button>
              </form>
            ) : (
              <button
                onClick={() => { setNameInput(guestName); setEditingName(true); }}
                className="text-[10px] font-mono text-white/40 hover:text-white/80 underline underline-offset-2"
              >
                {guestName}
              </button>
            )
          )}
          {user && (
            <span className="text-[10px] font-mono text-white/40">{user.username}</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-xs font-mono text-white/20 text-center mt-8">
            {connected ? "No messages yet. Say something!" : "Connecting…"}
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-[11px] font-mono font-bold text-white/70 shrink-0">{msg.username}</span>
              <span className="text-[10px] font-mono text-white/20">{timeLabel(msg.createdAt)}</span>
            </div>
            <p className="text-[13px] font-mono text-white/85 break-words leading-snug pl-0">{msg.message}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 px-3 py-2 border-t border-white/10 shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={300}
          placeholder={connected ? "Type a message…" : "Connecting…"}
          disabled={!connected}
          className="flex-1 bg-transparent text-white text-xs font-mono placeholder:text-white/20 outline-none disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!input.trim() || !connected}
          className="text-white/40 hover:text-white disabled:opacity-20 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
