import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { useGetClaims, useUpdateClaimStatus, getGetClaimsQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, MessageSquare, Send, Mail, Users, ChevronDown, ChevronUp, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

type ClaimMessage = {
  id: number;
  claimId: number;
  userId: number;
  username: string | null;
  content: string;
  isAdmin: boolean;
  createdAt: string;
};

function ClaimChat({ claimId, token }: { claimId: number; token: string | null }) {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const { data: messages, refetch } = useQuery<ClaimMessage[]>({
    queryKey: ["claim-messages", claimId],
    queryFn: async () => {
      const res = await fetch(`/api/claims/${claimId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const sendMessage = async () => {
    if (!msg.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Chat with user</p>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {(!messages || messages.length === 0) && (
          <p className="text-xs text-muted-foreground font-mono italic">No messages yet</p>
        )}
        {messages?.map((m) => (
          <div key={m.id} className={cn("flex gap-2 text-xs font-mono", m.isAdmin ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("px-2.5 py-1.5 rounded-lg max-w-[80%]", m.isAdmin ? "bg-white text-black" : "bg-white/10 text-white")}>
              <span className="block text-[10px] opacity-60 mb-0.5">{m.isAdmin ? "Admin" : m.username}</span>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="h-8 text-xs font-mono bg-black/30"
        />
        <Button size="sm" className="h-8 w-8 p-0 bg-white text-black hover:bg-white/90 shrink-0" onClick={sendMessage} disabled={sending || !msg.trim()}>
          {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
        </Button>
      </div>
    </div>
  );
}

export default function AdminClaims() {
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [imgExpanded, setImgExpanded] = useState<number | null>(null);
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { data: claims, isLoading } = useGetClaims({ status: filter !== "all" ? filter : undefined });
  const updateMutation = useUpdateClaimStatus();

  const handleStatusChange = (id: number, status: any) => {
    updateMutation.mutate({ id, body: { status, adminNotes: undefined } }, {
      onSuccess: () => {
        toast.success("Claim status updated");
        queryClient.invalidateQueries({ queryKey: getGetClaimsQueryKey() });
      },
      onError: (err) => toast.error("Update failed", { description: err.message }),
    });
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 py-10">
        <Link href="/admin">
          <button className="font-mono text-xs text-muted-foreground hover:text-white mb-6 flex items-center bg-transparent border-none cursor-pointer">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Admin
          </button>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-2xl font-black font-mono uppercase tracking-tighter">Manage Claims</h1>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px] bg-black/30 border-white/15 font-mono text-sm h-9">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Claims</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !claims || claims.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-mono">No claims found.</div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim: any) => (
              <CyberCard key={claim.id} className="p-4">
                {/* Header row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm font-mono truncate">{claim.rewardTitle}</span>
                      {claim.rewardValue && (
                        <span className="text-xs text-muted-foreground font-mono">→ {claim.rewardValue}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono">
                      <span>@{claim.username}</span>
                      <span>DC: {claim.discordUsername}</span>
                      {claim.paymentMethod === "gmail" ? (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {claim.paymentAmount ?? "?"} Gmail
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {claim.paymentAmount ?? "?"} Invites
                        </span>
                      )}
                      {claim.proofUrl && (
                        <span className="flex items-center gap-1 text-green-400">
                          <ImageIcon className="w-3 h-3" /> Screenshot
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/50">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <CyberBadge variant={claim.status}>{claim.status.replace("_", " ")}</CyberBadge>
                    <Select value={claim.status} onValueChange={(val) => handleStatusChange(claim.id, val)}>
                      <SelectTrigger className="w-[120px] h-7 bg-transparent border-white/15 text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Review</SelectItem>
                        <SelectItem value="approved">Approve</SelectItem>
                        <SelectItem value="rejected">Reject</SelectItem>
                        <SelectItem value="completed">Complete</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-white"
                      onClick={() => setExpandedId(expandedId === claim.id ? null : claim.id)}
                    >
                      {expandedId === claim.id ? <ChevronUp className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Expanded panel */}
                {expandedId === claim.id && (
                  <div className="mt-3 border-t border-white/10 pt-3 space-y-4">
                    {/* Claim details / credentials */}
                    {claim.notes && (
                      <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Claim Details</p>
                        <pre className="text-xs font-mono text-white/85 whitespace-pre-wrap leading-relaxed">{claim.notes}</pre>
                      </div>
                    )}

                    {/* Proof screenshot */}
                    {claim.proofUrl && (
                      <div>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Proof Screenshot
                        </p>
                        {claim.proofUrl.startsWith("data:") ? (
                          <div>
                            <img
                              src={claim.proofUrl}
                              alt="Proof screenshot"
                              className={cn(
                                "rounded-lg border border-white/10 cursor-pointer object-contain bg-black/30 transition-all",
                                imgExpanded === claim.id ? "max-h-none w-full" : "max-h-48 w-full"
                              )}
                              onClick={() => setImgExpanded(imgExpanded === claim.id ? null : claim.id)}
                            />
                            <p className="text-[10px] text-muted-foreground font-mono mt-1">
                              {imgExpanded === claim.id ? "Click to collapse" : "Click to expand"}
                            </p>
                          </div>
                        ) : (
                          <a href={claim.proofUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-mono text-blue-400 underline hover:text-blue-300 break-all">
                            {claim.proofUrl}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Chat */}
                    <ClaimChat claimId={claim.id} token={token} />
                  </div>
                )}
              </CyberCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
