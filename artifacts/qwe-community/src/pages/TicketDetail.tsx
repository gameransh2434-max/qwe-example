import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { useGetTicket, getGetTicketQueryKey, useSendTicketMessage } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Loader2, ArrowLeft, Send, ShieldAlert, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function TicketDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: ticket, isLoading } = useGetTicket(id, {
    query: { enabled: !!id, queryKey: getGetTicketQueryKey(id) }
  });

  const sendMutation = useSendTicketMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const handleSend = () => {
    if (!content.trim()) return;

    sendMutation.mutate({
      id,
      body: { content }
    }, {
      onSuccess: () => {
        setContent("");
        queryClient.invalidateQueries({ queryKey: getGetTicketQueryKey(id) });
      },
      onError: (err: any) => {
        toast.error("Transmission failed", { description: err?.message || "Could not send message" });
      }
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 py-12 flex flex-col h-[calc(100vh-60px)]">
        <div className="shrink-0 mb-6">
          <Link href="/tickets">
            <button className="font-mono text-xs text-muted-foreground hover:text-primary mb-4 flex items-center bg-transparent border-none cursor-pointer">
              <ArrowLeft className="w-3 h-3 mr-1" /> Terminate Connection
            </button>
          </Link>

          {ticket && (
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/50 pb-4">
              <div>
                <p className="text-xs font-mono text-primary uppercase tracking-widest mb-1">Comms Channel #{ticket.id.toString().padStart(5, '0')}</p>
                <h1 className="text-2xl font-black font-mono tracking-tighter uppercase">{ticket.subject}</h1>
              </div>
              <CyberBadge variant={
                ticket.status === 'open' ? 'pending' : 
                ticket.status === 'in_progress' ? 'under_review' : 'completed'
              }>
                {ticket.status.replace("_", " ")}
              </CyberBadge>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !ticket ? (
          <div className="flex-1 flex justify-center items-center font-mono text-muted-foreground uppercase">Channel Offline</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {ticket.messages?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] flex gap-3 ${msg.isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-sm shrink-0 flex items-center justify-center border ${
                      msg.isAdmin ? 'bg-primary/10 border-primary/50 text-primary' : 'bg-muted/20 border-border text-muted-foreground'
                    }`}>
                      {msg.isAdmin ? <ShieldAlert className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                    </div>
                    
                    <div className={`flex flex-col ${msg.isAdmin ? 'items-start' : 'items-end'}`}>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                        {msg.username || 'System'} | {format(new Date(msg.createdAt), "HH:mm")}
                      </span>
                      <CyberCard 
                        variant={msg.isAdmin ? 'glow' : 'default'} 
                        className={`p-4 rounded-sm ${msg.isAdmin ? 'bg-primary/5' : 'bg-black/60'}`}
                      >
                        <p className="font-mono text-sm whitespace-pre-wrap">{msg.content}</p>
                      </CyberCard>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {ticket.status !== 'closed' && (
              <div className="shrink-0 bg-black/50 border border-border/50 p-2 rounded-sm glass flex gap-2">
                <Textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Transmit message..."
                  className="font-mono bg-transparent border-none focus-visible:ring-0 resize-none min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button 
                  onClick={handleSend}
                  disabled={!content.trim() || sendMutation.isPending}
                  className="h-auto shrink-0 bg-primary text-black hover:bg-primary/90 rounded-sm px-6"
                >
                  {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            )}
            
            {ticket.status === 'closed' && (
              <div className="shrink-0 text-center py-4 border border-dashed border-border/50 rounded-sm bg-black/20">
                <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Channel Terminated by Administrator</p>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
