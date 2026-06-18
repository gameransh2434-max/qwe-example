import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetRewards, useGetCategories } from "@workspace/api-client-react";
import { CyberCard } from "@/components/ui/cyber-card";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader2, ChevronRight, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RewardsList() {
  const [searchParams] = useLocation();
  const queryParams = new URLSearchParams(window.location.search);
  const initialCategory = queryParams.get("category");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(initialCategory ? parseInt(initialCategory) : null);

  const { data: categories, isLoading: isCategoriesLoading } = useGetCategories();
  
  const { data: rewards, isLoading: isRewardsLoading } = useGetRewards({
    categoryId: activeCategory || undefined,
    search: searchQuery || undefined,
  });

  return (
    <AppLayout>
      <div className="flex flex-col md:flex-row h-full">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden p-4 border-b border-border/50 bg-black/50 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm font-bold uppercase tracking-widest">Filters</span>
          </div>
        </div>

        {/* Categories Sidebar (Discord-style inner sidebar) */}
        <div className="w-full md:w-64 border-r border-border/50 bg-[#0a0a0a] flex-shrink-0 hidden md:block">
          <div className="p-4 border-b border-border/50">
            <h2 className="font-mono text-sm font-bold text-primary uppercase tracking-widest">Categories</h2>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-sm font-mono text-sm flex items-center gap-2 transition-all ${
                activeCategory === null 
                  ? "bg-primary/10 text-primary border border-primary/30" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
              }`}
            >
              <Hash className="w-4 h-4" /> All Targets
            </button>
            
            {isCategoriesLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
            ) : (
              categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-sm font-mono text-sm flex items-center gap-2 transition-all ${
                    activeCategory === cat.id 
                      ? "bg-primary/10 text-primary border border-primary/30" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                  }`}
                >
                  <Hash className="w-4 h-4 opacity-50" /> {cat.name}
                  {cat.rewardCount !== undefined && cat.rewardCount > 0 && (
                    <span className="ml-auto text-[10px] bg-black px-1.5 rounded-sm border border-border/50">{cat.rewardCount}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black font-mono uppercase tracking-tighter">Bounty Board</h1>
                <p className="text-sm text-muted-foreground font-mono">Available targets for operatives.</p>
              </div>
              
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search targets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 font-mono bg-black/50 border-border/50 focus-visible:ring-primary h-10 rounded-sm"
                />
              </div>
            </div>

            {isRewardsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : rewards?.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border/50 rounded-sm bg-black/20">
                <p className="font-mono text-muted-foreground uppercase tracking-widest">No targets found matching criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards?.map((reward) => (
                  <Link key={reward.id} href={`/rewards/${reward.id}`}>
                    <CyberCard className="p-5 cursor-pointer h-full flex flex-col group hover:bg-white/[0.02]">
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-[10px] font-mono text-primary/80 uppercase px-2 py-0.5 border border-primary/20 bg-primary/5 rounded-sm">
                          {reward.categoryName || "Uncategorized"}
                        </div>
                        {reward.isFeatured && (
                          <div className="text-[10px] font-mono text-yellow-400 uppercase px-2 py-0.5 border border-yellow-500/30 bg-yellow-500/10 rounded-sm">
                            High Priority
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-mono">{reward.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                        <div className="font-mono text-sm font-bold text-white group-hover:text-primary transition-colors">
                          {reward.rewardValue}
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 font-mono text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CyberCard>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
