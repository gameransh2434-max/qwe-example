import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard } from "@/components/ui/cyber-card";
import { useGetStats, useGetClaims } from "@workspace/api-client-react";
import { Users, Trophy, Terminal, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: claims, isLoading: claimsLoading } = useGetClaims({ status: "pending" });

  const pendingCount = claims?.length || 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 py-12">
        <h1 className="text-3xl font-black font-mono uppercase tracking-tighter mb-8 flex items-center gap-3 text-primary">
          <ShieldAlert className="w-8 h-8" /> Root Overview
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <CyberCard className="p-4">
            <Users className="w-5 h-5 text-muted-foreground mb-2" />
            <div className="text-2xl font-black font-mono">{stats?.totalUsers || 0}</div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Total Users</div>
          </CyberCard>
          <CyberCard className="p-4">
            <Trophy className="w-5 h-5 text-muted-foreground mb-2" />
            <div className="text-2xl font-black font-mono">{stats?.totalRewards || 0}</div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Active Rewards</div>
          </CyberCard>
          <CyberCard className="p-4">
            <Terminal className="w-5 h-5 text-muted-foreground mb-2" />
            <div className="text-2xl font-black font-mono">{stats?.totalClaims || 0}</div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Total Executions</div>
          </CyberCard>
          <CyberCard className="p-4 border-yellow-500/30 bg-yellow-500/5">
            <CheckCircle2 className="w-5 h-5 text-yellow-500 mb-2" />
            <div className="text-2xl font-black font-mono text-yellow-500">{pendingCount}</div>
            <div className="text-xs font-mono text-yellow-500/70 uppercase tracking-widest">Pending Claims</div>
          </CyberCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/claims">
            <CyberCard variant="glow" className="p-6 cursor-pointer hover:bg-white/5 transition-colors h-full">
              <h3 className="text-xl font-bold font-mono mb-2 uppercase text-primary">Claims</h3>
              <p className="text-muted-foreground font-mono text-sm">Review user submissions and update status.</p>
            </CyberCard>
          </Link>
          <Link href="/admin/rewards">
            <CyberCard variant="glow" className="p-6 cursor-pointer hover:bg-white/5 transition-colors h-full">
              <h3 className="text-xl font-bold font-mono mb-2 uppercase text-primary">Rewards</h3>
              <p className="text-muted-foreground font-mono text-sm">Manage targets, bounties, and values.</p>
            </CyberCard>
          </Link>
          <Link href="/admin/users">
            <CyberCard variant="glow" className="p-6 cursor-pointer hover:bg-white/5 transition-colors h-full">
              <h3 className="text-xl font-bold font-mono mb-2 uppercase text-primary">Users</h3>
              <p className="text-muted-foreground font-mono text-sm">View operative details and manage roles.</p>
            </CyberCard>
          </Link>
          <Link href="/admin/categories">
            <CyberCard variant="glow" className="p-6 cursor-pointer hover:bg-white/5 transition-colors h-full">
              <h3 className="text-xl font-bold font-mono mb-2 uppercase text-primary">Categories</h3>
              <p className="text-muted-foreground font-mono text-sm">Organize targets into logical groups.</p>
            </CyberCard>
          </Link>
          <Link href="/admin/tickets">
            <CyberCard variant="glow" className="p-6 cursor-pointer hover:bg-white/5 transition-colors h-full">
              <h3 className="text-xl font-bold font-mono mb-2 uppercase text-primary">Support</h3>
              <p className="text-muted-foreground font-mono text-sm">Respond to operative comms and issues.</p>
            </CyberCard>
          </Link>
          <Link href="/admin/announcements">
            <CyberCard variant="glow" className="p-6 cursor-pointer hover:bg-white/5 transition-colors h-full">
              <h3 className="text-xl font-bold font-mono mb-2 uppercase text-primary">Announcements</h3>
              <p className="text-muted-foreground font-mono text-sm">Broadcast system-wide alerts.</p>
            </CyberCard>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
