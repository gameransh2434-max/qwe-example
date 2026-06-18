import { AppLayout } from "@/components/layout/AppLayout";
import { useGetStats, useGetRewards, useGetAnnouncements } from "@workspace/api-client-react";
import { CyberCard } from "@/components/ui/cyber-card";
import { Link } from "wouter";
import { Users, Trophy, Zap, ChevronRight, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { WorldChat } from "@/components/WorldChat";

export default function Home() {
  const { data: stats } = useGetStats();
  const { data: featuredRewards } = useGetRewards({ featured: true });
  const { data: announcements } = useGetAnnouncements();
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      <div className="flex flex-col min-h-full">
        {/* Hero */}
        <div className="relative border-b border-border/50 overflow-hidden bg-card">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.06),transparent)]" />
          <div className="relative max-w-5xl mx-auto px-6 py-20 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white/70 text-xs font-mono mb-6 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"></span>
              Season 3 Active
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white uppercase">
              Enter{" "}
              <span className="bg-white text-black px-2 mx-1 skew-x-[-3deg] inline-block">
                QWE
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl font-mono mb-8 border-l-2 border-white/20 pl-4">
              Complete tasks. Submit proof. Earn digital rewards.
              Discord boosts, TikTok views, Instagram growth — all rewarded.
            </p>
            <div className="flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link href="/register">
                    <Button size="lg" className="font-mono tracking-widest uppercase bg-white text-black hover:bg-white/90 shadow-lg">
                      Join Now
                    </Button>
                  </Link>
                  <Link href="/rewards">
                    <Button size="lg" variant="outline" className="font-mono tracking-widest uppercase">
                      Browse Rewards
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/rewards">
                    <Button size="lg" className="font-mono tracking-widest uppercase bg-white text-black hover:bg-white/90">
                      Browse Rewards
                    </Button>
                  </Link>
                  <Link href="/claims">
                    <Button size="lg" variant="outline" className="font-mono tracking-widest uppercase">
                      My Claims
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Announcement ticker */}
        {announcements && announcements.length > 0 && (
          <div className="bg-white/5 border-b border-white/10 py-2.5">
            <div className="max-w-5xl mx-auto px-6 flex items-center gap-3">
              <Megaphone className="w-4 h-4 text-white/60 shrink-0" />
              <p className="font-mono text-sm text-white/70 truncate">
                <span className="font-bold text-white mr-2">{announcements[0].title}:</span>
                {announcements[0].content}
              </p>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-10">
            {/* Stats */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <CyberCard className="p-4 flex flex-col gap-1.5">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div className="text-3xl font-black font-mono">{stats?.totalUsers ?? "—"}</div>
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Operatives</div>
                </CyberCard>
                <CyberCard className="p-4 flex flex-col gap-1.5">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <div className="text-3xl font-black font-mono">{stats?.totalRewards ?? "—"}</div>
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Rewards</div>
                </CyberCard>
                <CyberCard className="p-4 flex flex-col gap-1.5">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <div className="text-3xl font-black font-mono">{stats?.totalClaims ?? "—"}</div>
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Claims</div>
                </CyberCard>
                <CyberCard className="p-4 flex flex-col gap-1.5 border-white/30 bg-white/5">
                  <Zap className="w-4 h-4 text-white" />
                  <div className="text-3xl font-black font-mono text-white">{stats?.approvedClaims ?? "—"}</div>
                  <div className="text-xs font-mono text-white/60 uppercase tracking-wider">Approved</div>
                </CyberCard>
              </div>
            </section>

            {/* Featured Rewards */}
            <section>
              <div className="flex items-center justify-between mb-5 border-b border-border/50 pb-2">
                <h2 className="text-lg font-bold uppercase tracking-widest">
                  ✦ Featured Rewards
                </h2>
                <Link href="/rewards">
                  <Button variant="link" className="font-mono text-xs text-muted-foreground hover:text-white p-0 h-auto">
                    View All <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featuredRewards?.slice(0, 4).map((reward) => (
                  <Link key={reward.id} href={`/rewards/${reward.id}`}>
                    <CyberCard className="p-4 cursor-pointer h-full flex flex-col group hover:border-white/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-mono text-muted-foreground uppercase px-2 py-0.5 border border-white/10 bg-white/5 rounded">
                          {reward.categoryName}
                        </span>
                        <span className="text-sm font-black font-mono text-white">
                          {reward.rewardValue}
                        </span>
                      </div>
                      <h3 className="text-base font-bold mb-1 group-hover:underline underline-offset-4 decoration-white/30">{reward.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-auto font-mono">{reward.description}</p>
                    </CyberCard>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* World Chat */}
            <div>
              <WorldChat />
            </div>

            <CyberCard className="p-5">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-border/50 pb-2">
                Top Earners
              </h3>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Trophy className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="font-mono text-xs text-muted-foreground uppercase">No data yet</p>
                <Link href="/leaderboard" className="mt-4">
                  <Button variant="outline" size="sm" className="font-mono text-xs h-7">View Leaderboard</Button>
                </Link>
              </div>
            </CyberCard>

            {announcements && announcements.length > 1 && (
              <CyberCard className="p-5">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-border/50 pb-2">
                  Announcements
                </h3>
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((ann) => (
                    <div key={ann.id} className="border-l-2 border-white/20 pl-3">
                      <p className="text-xs font-bold text-white mb-0.5">{ann.title}</p>
                      <p className="text-xs text-muted-foreground font-mono line-clamp-2">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </CyberCard>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
