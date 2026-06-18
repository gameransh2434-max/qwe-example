import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard } from "@/components/ui/cyber-card";
import { useGetLeaderboard } from "@workspace/api-client-react";
import { Trophy } from "lucide-react";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard({ type: "claims" });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-black font-mono uppercase tracking-tighter">Global Rankings</h1>
            <p className="text-sm text-muted-foreground font-mono">Top operatives in the nexus.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-sm"></div>
            ))}
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <p className="text-muted-foreground font-mono">No ranking data available.</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <CyberCard key={entry.userId} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]" variant={index < 3 ? "glow" : "default"}>
                <div className={`w-8 h-8 flex items-center justify-center font-bold font-mono text-lg ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  #{entry.rank}
                </div>
                <div className="w-10 h-10 bg-muted/20 border border-border flex items-center justify-center rounded-sm">
                  {entry.avatarUrl ? (
                    <img src={entry.avatarUrl} alt={entry.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm uppercase">{entry.username.substring(0, 2)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{entry.username}</div>
                  {entry.label && <div className="text-xs text-muted-foreground font-mono">{entry.label}</div>}
                </div>
                <div className="font-mono text-primary font-bold text-xl">{entry.score}</div>
              </CyberCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
