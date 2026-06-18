import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { useGetClaim, getGetClaimQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Loader2, Send, Mail, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type ClaimMessage = {
  id: number;
  claimId: number;
  userId: number;
  username: string | null;
  content: string;
  isAdmin: boolean;
  createdAt: string;
};

export default function ClaimDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { token } = useAuth();
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const { data: claim, isLoading } = useGetClaim(id, {
    query: { enabled: !!id, queryKey: getGetClaimQueryKey(id) }
  });

  const { data: messages, refetch } = useQuery<ClaimMessage[]>({
    queryKey: ["claim-messages", id],
    queryFn: async () => {
      const res = await fetch(`/api/claims/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!id && !!token,
    refetchInterval: 5000,
  });

  const sendMessage = async () => {
    if (!msg.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/claims/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: msg }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setMsg("");
      refetch();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const statusColors: Record<string, "primary" | "success" | "destructive" | "warning" | "default"> = {
    pending: "warning",
    under_review: "primary",
    approved: "success",
    rejected: "destructive",
    completed: "success",
  };

  const userNotes = (claim as any)?.notes?.replace(/\[PAYMENT:[^\]]+\]\n?/, "") ?? "";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 py-10">
        <Link href="/claims">
          <Button variant="link" className="font-mono text-xs text-muted-foreground hover:text-white mb-6 p-0 h-auto">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Claims
          </Button>
        </Link>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-white/5 rounded-lg" />
            <div className="h-60 bg-white/5 rounded-lg" />
          </div>
        ) : !claim ? (
          <div className="text-center py-20 text-muted-foreground font-mono">Claim not found</div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <CyberCard className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
                    Claim #{String(claim.id).padStart(4, "0")}
                  </p>
                  <h1 className="text-xl font-black font-mono uppercase tracking-tighter">
                    {claim.rewardTitle}
                  </h1>
                </div>
                <CyberBadge variant={statusColors[claim.status] ?? "default"}>
                  {claim.status.replace("_", " ")}
                </CyberBadge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                {/* Payment */}
                <div className="bg-white/5 border border-white/8 rounded-md p-3">
                  <p className="text-muted-foreground mb-1 uppercase tracking-wide text-[10px]">Payment</p>
                  <div className="flex items-center gap-1.5 font-semibold">
                    {(claim as any).paymentMethod === "invites" ? (
                      <><Users className="w-3.5 h-3.5" /> {(claim as any).paymentAmount ?? "?"} Invites</>
                    ) : (
                      <><Mail className="w-3.5 h-3.5" /> {(claim as any).paymentAmount ?? "?"} Gmail</>
                    )}
                  </div>
                </div>

                {/* Discord */}
                <div className="bg-white/5 border border-white/8 rounded-md p-3">
                  <p className="text-muted-foreground mb-1 uppercase tracking-wide text-[10px]">Discord</p>
                  <p className="font-semibold">{claim.discordUsername}</p>
                </div>

                {/* Discord Server Link */}
                {(claim as any).discordLink && (
                  <div className="bg-white/5 border border-white/8 rounded-md p-3 col-span-2">
                    <p className="text-muted-foreground mb-1 uppercase tracking-wide text-[10px]">Server Link</p>
                    <a
                      href={(claim as any).discordLink.startsWith("http") ? (claim as any).discordLink : `https://${(claim as any).discordLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 underline hover:text-white"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {(claim as any).discordLink}
                    </a>
                  </div>
                )}

                {/* Proof */}
                {claim.proofUrl && (
                  <div className="bg-white/5 border border-white/8 rounded-md p-3 col-span-2">
                    <p className="text-muted-foreground mb-1 uppercase tracking-wide text-[10px]">Proof</p>
                    <a
                      href={claim.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 underline hover:text-white truncate"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {claim.proofUrl}
                    </a>
                  </div>
                )}

                {/* Submitted at */}
                <div className="bg-white/5 border border-white/8 rounded-md p-3 col-span-2">
                  <p className="text-muted-foreground mb-1 uppercase tracking-wide text-[10px]">Submitted</p>
                  <p>{format(new Date(claim.createdAt), "MMM dd, yyyy · HH:mm")}</p>
                </div>

                {/* Notes */}
                {userNotes && (
                  <div className="bg-white/5 border border-white/8 rounded-md p-3 col-span-2">
                    <p className="text-muted-foreground mb-1 uppercase tracking-wide text-[10px]">Notes</p>
                    <p className="whitespace-pre-wrap">{userNotes}</p>
                  </div>
                )}
              </div>

              {claim.adminNotes && (
                <div className="mt-4 bg-white/8 border border-white/20 rounded-md p-3">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                    Admin Response
                  </p>
                  <p className="text-sm font-mono">{claim.adminNotes}</p>
                </div>
              )}
            </CyberCard>

            {/* Chat */}
            <CyberCard className="p-5">
              <h2 className="font-mono text-sm font-bold uppercase tracking-tight mb-4 border-b border-border/50 pb-2">
                Chat with Admin
              </h2>

              <div className="space-y-2 max-h-64 overflow-y-auto mb-4 pr-1 scrollbar-none">
                {(!messages || messages.length === 0) ? (
                  <p className="text-xs text-muted-foreground font-mono italic py-6 text-center">
                    No messages yet. Admin will reply here after reviewing your claim.
                  </p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.isAdmin ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[75%] px-3 py-2 rounded-lg text-sm font-mono",
                        m.isAdmin ? "bg-white text-black" : "bg-white/10 text-white"
                      )}>
                        <span className="block text-[10px] opacity-50 mb-0.5">
                          {m.isAdmin ? "Admin" : m.username}
                          {" · "}
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Send a message to admin..."
                  className="h-9 text-sm font-mono bg-black/30"
                />
                <Button
                  className="h-9 px-3 bg-white text-black hover:bg-white/90 shrink-0"
                  onClick={sendMessage}
                  disabled={sending || !msg.trim()}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </CyberCard>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
