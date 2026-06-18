import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { useGetTickets } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function TicketsList() {
  const { data: tickets, isLoading } = useGetTickets();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black font-mono uppercase tracking-tighter mb-2">Support Channels</h1>
            <p className="text-sm text-muted-foreground font-mono">Encrypted comms with network admins.</p>
          </div>
          <Link href="/tickets/new">
            <Button className="font-mono uppercase tracking-widest rounded-sm bg-primary text-black hover:bg-primary/90 shadow-[0_0_10px_rgba(0,255,255,0.2)]">
              <Plus className="w-4 h-4 mr-2" /> Open Channel
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <CyberCard className="p-12 text-center border-dashed bg-black/20">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-mono text-muted-foreground uppercase tracking-widest mb-4">No active comm channels</p>
          </CyberCard>
        ) : (
          <div className="space-y-4">
            {tickets.map(ticket => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                <CyberCard className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]">
                  <div>
                    <h3 className="font-bold text-lg font-mono">{ticket.subject}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      Channel: {ticket.id.toString().padStart(5, '0')} | Initiated: {format(new Date(ticket.createdAt), "MMM dd, yyyy")} | Messages: {ticket.messageCount || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <CyberBadge variant={
                      ticket.status === 'open' ? 'pending' : 
                      ticket.status === 'in_progress' ? 'under_review' : 'completed'
                    }>
                      {ticket.status.replace("_", " ")}
                    </CyberBadge>
                  </div>
                </CyberCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
