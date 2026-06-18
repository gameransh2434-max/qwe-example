import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { Link, useLocation } from "wouter";
import { Search } from "lucide-react";
import { useSearch } from "@workspace/api-client-react";

export default function SearchResults() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const q = queryParams.get("q") || "";

  const { data: results, isLoading } = useSearch(q, { query: { queryKey: [`/api/search`, q], enabled: !!q } });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black font-mono uppercase tracking-tighter mb-2">Search Results</h1>
          <p className="text-muted-foreground font-mono">Query: <span className="text-primary">"{q}"</span></p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-white/5 rounded-sm"></div>
            <div className="h-24 bg-white/5 rounded-sm"></div>
          </div>
        ) : !results ? (
          <div>Enter a search query to begin</div>
        ) : (
          <div className="space-y-12">
            
            {/* Rewards */}
            <section>
              <h2 className="text-xl font-bold font-mono uppercase border-b border-border/50 pb-2 mb-4">Targets ({results.rewards.length})</h2>
              {results.rewards.length === 0 ? (
                <p className="text-sm text-muted-foreground font-mono">No matching targets found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.rewards.map(reward => (
                    <Link key={reward.id} href={`/rewards/${reward.id}`}>
                      <CyberCard className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
                        <h3 className="font-bold">{reward.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{reward.description}</p>
                        <div className="mt-2 text-xs font-mono text-primary">{reward.rewardValue}</div>
                      </CyberCard>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Users */}
            <section>
              <h2 className="text-xl font-bold font-mono uppercase border-b border-border/50 pb-2 mb-4">Operatives ({results.users.length})</h2>
              {results.users.length === 0 ? (
                <p className="text-sm text-muted-foreground font-mono">No matching operatives found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.users.map(user => (
                    <CyberCard key={user.id} className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted/20 border border-border flex items-center justify-center rounded-sm">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-bold text-sm uppercase">{user.username.substring(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{user.username}</div>
                        <div className="text-xs text-muted-foreground font-mono">{user.role}</div>
                      </div>
                    </CyberCard>
                  ))}
                </div>
              )}
            </section>
            
          </div>
        )}
      </div>
    </AppLayout>
  );
}
