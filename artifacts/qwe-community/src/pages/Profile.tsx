import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard } from "@/components/ui/cyber-card";
import { useAuth } from "@/contexts/AuthContext";
import { Terminal, Shield, Trophy, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 py-12">
        <h1 className="text-3xl font-black font-mono uppercase tracking-tighter mb-8">Operative Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <CyberCard variant="glow" className="p-6 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-sm bg-muted/20 border-2 border-primary/50 flex items-center justify-center mb-4 overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover grayscale contrast-125" />
                ) : (
                  <span className="font-bold text-4xl uppercase font-mono">{user.username.substring(0, 2)}</span>
                )}
              </div>
              <h2 className="text-2xl font-black font-mono uppercase">{user.username}</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono mt-2 uppercase tracking-widest">
                <Shield className="w-3 h-3" /> {user.role} Class
              </div>
              
              <div className="w-full border-t border-border/50 mt-6 pt-4 space-y-2 text-left">
                <div className="text-xs font-mono text-muted-foreground">
                  <span className="text-primary/70 uppercase tracking-widest block mb-1">Entity ID</span>
                  {user.id.toString().padStart(6, '0')}
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  <span className="text-primary/70 uppercase tracking-widest block mb-1">Init Date</span>
                  {format(new Date(user.createdAt), "MMM dd, yyyy")}
                </div>
              </div>
            </CyberCard>
          </div>

          <div className="md:col-span-2 space-y-6">
            <CyberCard className="p-6">
              <h3 className="font-mono text-sm font-bold text-primary uppercase mb-6 tracking-widest border-b border-border/50 pb-2">Network Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-sm border border-border/50">
                  <Terminal className="w-5 h-5 text-muted-foreground mb-2" />
                  <div className="text-3xl font-black font-mono">{user.totalClaims || 0}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Executions</div>
                </div>
                <div className="bg-primary/5 p-4 rounded-sm border border-primary/20">
                  <Trophy className="w-5 h-5 text-primary mb-2" />
                  <div className="text-3xl font-black font-mono text-primary drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">{user.approvedClaims || 0}</div>
                  <div className="text-[10px] font-mono text-primary/70 uppercase tracking-widest">Verified Clears</div>
                </div>
                <div className="bg-black/40 p-4 rounded-sm border border-border/50">
                  <Users className="w-5 h-5 text-muted-foreground mb-2" />
                  <div className="text-3xl font-black font-mono">{user.inviteCount || 0}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Network Invites</div>
                </div>
              </div>
            </CyberCard>

            <CyberCard className="p-6">
              <h3 className="font-mono text-sm font-bold text-primary uppercase mb-6 tracking-widest border-b border-border/50 pb-2">Comms Data</h3>
              <dl className="space-y-4 font-mono text-sm">
                <div>
                  <dt className="text-muted-foreground mb-1 uppercase tracking-widest text-[10px]">Email Address</dt>
                  <dd className="font-bold">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1 uppercase tracking-widest text-[10px]">Discord Alias</dt>
                  <dd className="font-bold">{user.discordUsername || "Not linked"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1 uppercase tracking-widest text-[10px]">Verification Status</dt>
                  <dd>
                    {user.isVerified ? (
                      <span className="text-green-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Verified</span>
                    ) : (
                      <span className="text-yellow-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Pending Sync</span>
                    )}
                  </dd>
                </div>
              </dl>
            </CyberCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
