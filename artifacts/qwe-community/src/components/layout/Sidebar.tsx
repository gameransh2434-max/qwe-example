import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Home, Trophy, Gift, LayoutDashboard, Ticket, Bell, ShieldAlert, LogOut, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/rewards", label: "Rewards", icon: Gift },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const authItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/claims", label: "My Claims", icon: TerminalSquare },
    { href: "/tickets", label: "Support", icon: Ticket },
    { href: "/notifications", label: "Notifications", icon: Bell },
  ];

  const adminItems = [
    { href: "/admin", label: "Admin Panel", icon: ShieldAlert },
  ];

  const renderLink = (item: { href: string; label: string; icon: any }) => {
    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
    return (
      <Link key={item.href} href={item.href} className="w-full">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 group cursor-pointer",
            isActive
              ? "bg-white text-black font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-white/8"
          )}
        >
          <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-black" : "")} />
          <span className="font-mono text-sm">{item.label}</span>
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-60 border-r border-border/50 bg-sidebar flex flex-col z-10 relative shrink-0">
      <div className="h-14 flex items-center px-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
            <TerminalSquare className="w-4 h-4 text-black" />
          </div>
          <span className="font-black tracking-tighter text-lg">QWE</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-5 scrollbar-none">
        <div className="space-y-0.5">
          <p className="px-3 text-[10px] font-mono text-muted-foreground/50 mb-1.5 uppercase tracking-widest mt-3">General</p>
          {navItems.map(renderLink)}
        </div>

        {isAuthenticated && (
          <div className="space-y-0.5">
            <p className="px-3 text-[10px] font-mono text-muted-foreground/50 mb-1.5 uppercase tracking-widest">My Account</p>
            {authItems.map(renderLink)}
          </div>
        )}

        {isAdmin && (
          <div className="space-y-0.5">
            <p className="px-3 text-[10px] font-mono text-muted-foreground/50 mb-1.5 uppercase tracking-widest">Admin</p>
            {adminItems.map(renderLink)}
          </div>
        )}
      </div>

      {isAuthenticated && user && (
        <div className="p-3 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold uppercase">{user.username.substring(0, 2)}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate">{user.username}</span>
                <span className="text-xs text-muted-foreground font-mono">{user.role}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="p-3 border-t border-border/50 space-y-2">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full font-mono text-xs h-8">
              Sign In
            </Button>
          </Link>
          <Link href="/register" className="w-full">
            <Button className="w-full font-mono text-xs h-8 bg-white text-black hover:bg-white/90">
              Register
            </Button>
          </Link>
        </div>
      )}
    </aside>
  );
}
