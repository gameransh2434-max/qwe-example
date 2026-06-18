import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { useGetUserDashboard } from "@workspace/api-client-react";
import { Terminal, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: dashboard, isLoading } = useGetUserDashboard();

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 py-12">
        <h1 className="text-3xl font-black font-mono uppercase tracking-tighter mb-8">Operative Dashboard</h1>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white/5 rounded-sm"></div>
            <div className="h-64 bg-white/5 rounded-sm"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CyberCard className="p-4">
                <Terminal className="w-5 h-5 text-muted-foreground mb-2" />
                <div className="text-2xl font-black font-mono">{dashboard?.totalClaims || 0}</div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Total Claims</div>
              </CyberCard>
              <CyberCard className="p-4 border-yellow-500/30 bg-yellow-500/5">
                <ShieldAlert className="w-5 h-5 text-yellow-500 mb-2" />
                <div className="text-2xl font-black font-mono text-yellow-500">{dashboard?.pendingClaims || 0}</div>
                <div className="text-xs font-mono text-yellow-500/70 uppercase tracking-widest">Pending</div>
              </CyberCard>
              <CyberCard className="p-4 border-green-500/30 bg-green-500/5">
                <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
                <div className="text-2xl font-black font-mono text-green-500">{dashboard?.approvedClaims || 0}</div>
                <div className="text-xs font-mono text-green-500/70 uppercase tracking-widest">Approved</div>
              </CyberCard>
              <CyberCard className="p-4 border-red-500/30 bg-red-500/5">
                <XCircle className="w-5 h-5 text-red-500 mb-2" />
                <div className="text-2xl font-black font-mono text-red-500">{dashboard?.rejectedClaims || 0}</div>
                <div className="text-xs font-mono text-red-500/70 uppercase tracking-widest">Rejected</div>
              </CyberCard>
            </div>

            <div>
              <h2 className="text-xl font-bold font-mono uppercase mb-4 pb-2 border-b border-border/50">Recent Activity</h2>
              {dashboard?.recentClaims && dashboard.recentClaims.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.recentClaims.map(claim => (
                    <Link key={claim.id} href={`/claims/${claim.id}`}>
                      <CyberCard className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
                        <div>
                          <div className="font-bold">{claim.rewardTitle}</div>
                          <div className="text-xs text-muted-foreground font-mono">{new Date(claim.createdAt).toLocaleDateString()}</div>
                        </div>
                        <CyberBadge variant={claim.status}>{claim.status.replace("_", " ")}</CyberBadge>
                      </CyberCard>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-mono">No recent activity detected.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
