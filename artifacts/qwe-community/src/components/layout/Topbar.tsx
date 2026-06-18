import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "wouter";

export function Topbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-14 border-b border-border/50 bg-black/50 glass z-20 flex items-center justify-between px-4 sticky top-0">
      <div className="flex items-center flex-1">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search network..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 bg-black/50 border-border/50 focus-visible:border-primary/50 focus-visible:ring-primary/20 font-mono text-sm h-9 rounded-sm"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-sm">
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
