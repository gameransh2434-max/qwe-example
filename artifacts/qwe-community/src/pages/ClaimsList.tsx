import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { useGetClaims, getGetClaimsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, TerminalSquare } from "lucide-react";
import { format } from "date-fns";

export default function ClaimsList() {
  const { data: claims, isLoading } = useGetClaims();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black font-mono uppercase tracking-tighter mb-2">Claim History</h1>
          <p className="text-sm text-muted-foreground font-mono">Your past executions and their status.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !claims || claims.length === 0 ? (
          <CyberCard className="p-12 text-center border-dashed bg-black/20">
            <TerminalSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-mono text-muted-foreground uppercase tracking-widest mb-4">No claim records found</p>
            <Link href="/rewards" className="text-primary hover:underline font-mono text-sm">
              Browse Targets
            </Link>
          </CyberCard>
        ) : (
          <div className="space-y-4">
            {claims.map(claim => (
              <Link key={claim.id} href={`/claims/${claim.id}`}>
                <CyberCard className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]">
                  <div>
                    <h3 className="font-bold text-lg">{claim.rewardTitle}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      ID: {claim.id.toString().padStart(5, '0')} | Date: {format(new Date(claim.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <CyberBadge variant={claim.status}>{claim.status.replace("_", " ")}</CyberBadge>
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
