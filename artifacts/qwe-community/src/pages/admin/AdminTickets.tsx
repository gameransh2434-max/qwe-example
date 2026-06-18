import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { useGetTickets } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MessageSquare, Loader2, Clock, CheckCircle2 } from "lucide-react";

export default function AdminTickets() {
  const { data: tickets, isLoading } = useGetTickets();

  const open = (tickets || []).filter((t) => t.status === "open");
  const closed = (tickets || []).filter((t) => t.status === "closed");

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-black font-mono uppercase tracking-tighter flex items-center gap-3 text-primary">
            <MessageSquare className="w-8 h-8" /> Support Tickets
          </h1>
          <CyberBadge variant="warning" className="text-sm">{open.length} open</CyberBadge>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (tickets || []).length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-mono">No support tickets yet</div>
        ) : (
          <div className="space-y-6">
            {open.length > 0 && (
              <div>
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Open ({open.length})
                </h2>
                <div className="space-y-2">
                  {open.map((t) => (
                    <Link key={t.id} href={`/tickets/${t.id}`}>
                      <CyberCard className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="w-8 h-8 rounded-sm bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono font-bold text-sm truncate">{t.subject}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            by {(t as any).username || "user"} · {new Date(t.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <CyberBadge variant="warning" className="text-xs">open</CyberBadge>
                          <p className="text-xs text-muted-foreground font-mono mt-1">{(t as any).messageCount || 0} messages</p>
                        </div>
                      </CyberCard>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {closed.length > 0 && (
              <div>
                <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" /> Closed ({closed.length})
                </h2>
                <div className="space-y-2">
                  {closed.map((t) => (
                    <Link key={t.id} href={`/tickets/${t.id}`}>
                      <CyberCard className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors opacity-60">
                        <div className="w-8 h-8 rounded-sm bg-white/5 border border-border/30 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono font-bold text-sm truncate">{t.subject}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            by {(t as any).username || "user"} · {new Date(t.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <CyberBadge variant="default" className="text-xs shrink-0">closed</CyberBadge>
                      </CyberCard>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
