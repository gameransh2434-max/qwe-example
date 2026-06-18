import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Users, ShieldCheck, ShieldAlert, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  discordUsername: string | null;
  totalClaims: number;
  approvedClaims: number;
  inviteCount: number;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    },
  });

  const updateRole = async (id: number, role: "user" | "admin") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      toast.success(`User ${role === "admin" ? "promoted to admin" : "demoted to user"}`);
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
    } catch {
      toast.error("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = (users || []).filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black font-mono uppercase tracking-tighter flex items-center gap-3 text-primary">
            <Users className="w-8 h-8" /> Operatives
          </h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 font-mono text-sm bg-black/30 h-9"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-mono">No users found</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((u) => (
              <CyberCard key={u.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="font-mono font-bold text-primary text-sm">{u.username[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm">{u.username}</span>
                    <CyberBadge variant={u.role === "admin" ? "success" : "default"} className="text-xs">
                      {u.role}
                    </CyberBadge>
                    {u.isVerified && (
                      <CyberBadge variant="default" className="text-xs">✓ verified</CyberBadge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">{u.email}</p>
                  {u.discordUsername && (
                    <p className="text-xs text-muted-foreground font-mono">Discord: {u.discordUsername}</p>
                  )}
                </div>
                <div className="flex gap-4 text-center text-xs font-mono shrink-0">
                  <div>
                    <div className="font-bold">{u.totalClaims}</div>
                    <div className="text-muted-foreground">claims</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-400">{u.approvedClaims}</div>
                    <div className="text-muted-foreground">approved</div>
                  </div>
                  <div>
                    <div className="font-bold">{u.inviteCount}</div>
                    <div className="text-muted-foreground">invites</div>
                  </div>
                </div>
                <div className="shrink-0">
                  {u.role === "admin" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-mono text-xs h-8"
                      disabled={updatingId === u.id}
                      onClick={() => updateRole(u.id, "user")}
                    >
                      {updatingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><ShieldCheck className="w-3 h-3 mr-1" /> Demote</>}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="font-mono text-xs h-8 bg-primary text-black hover:bg-primary/90"
                      disabled={updatingId === u.id}
                      onClick={() => updateRole(u.id, "admin")}
                    >
                      {updatingId === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><ShieldAlert className="w-3 h-3 mr-1" /> Promote</>}
                    </Button>
                  )}
                </div>
              </CyberCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
