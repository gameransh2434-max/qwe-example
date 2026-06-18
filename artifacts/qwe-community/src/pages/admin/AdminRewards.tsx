import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil, Trash2, Star, ToggleLeft, ToggleRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Reward {
  id: number;
  title: string;
  description: string;
  requirement: string;
  requirementValue: number | null;
  rewardValue: string;
  categoryId: number;
  categoryName: string | null;
  isFeatured: boolean;
  isActive: boolean;
  claimCount: number;
  createdAt: string;
}

interface RewardForm {
  title: string;
  description: string;
  requirement: string;
  requirementValue: string;
  rewardValue: string;
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
}

const emptyForm: RewardForm = {
  title: "",
  description: "",
  requirement: "",
  requirementValue: "",
  rewardValue: "",
  categoryId: "",
  isFeatured: false,
  isActive: true,
};

export default function AdminRewards() {
  const { token, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RewardForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const { data: rewards = [], isLoading } = useQuery<Reward[]>({
    queryKey: ["admin-rewards"],
    queryFn: async () => {
      const res = await fetch("/api/rewards", { headers });
      if (!res.ok) throw new Error("Failed to fetch rewards");
      return res.json();
    },
  });

  const { data: categoriesData } = useGetCategories();
  const categories = categoriesData ?? [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        title: form.title,
        description: form.description,
        requirement: form.requirement,
        requirementValue: form.requirementValue ? Number(form.requirementValue) : undefined,
        rewardValue: form.rewardValue,
        categoryId: Number(form.categoryId),
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };
      const url = editingId ? `/api/rewards/${editingId}` : "/api/rewards";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      toast.success(editingId ? "Reward updated" : "Reward created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/rewards/${id}`, { method: "DELETE", headers });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      setDeleteId(null);
      toast.success("Reward removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (r: Reward) => {
    setEditingId(r.id);
    setForm({
      title: r.title,
      description: r.description,
      requirement: r.requirement,
      requirementValue: r.requirementValue?.toString() ?? "",
      rewardValue: r.rewardValue,
      categoryId: r.categoryId.toString(),
      isFeatured: r.isFeatured,
      isActive: r.isActive,
    });
    setDialogOpen(true);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center font-mono text-muted-foreground">
        Access denied.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Manage Rewards</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {rewards.length} rewards listed
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-white text-black hover:bg-white/90 font-mono uppercase tracking-widest text-xs h-9"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Reward
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-sm border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border/50 bg-white/5">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Title</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Requirement</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Reward Value</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Claims</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((r) => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.isFeatured && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                        <span className="font-semibold truncate max-w-[180px]">{r.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{r.categoryName ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px]">
                      <span className="truncate block">{r.requirement}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs border-white/20 text-white font-mono">
                        {r.rewardValue}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{r.claimCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className={`text-xs border-none ${r.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
                        >
                          {r.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded-sm hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="p-1.5 rounded-sm hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rewards.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-xs">
                      No rewards yet. Click "Add Reward" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent className="bg-black border border-border/50 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-widest text-sm">
              {editingId ? "Edit Reward" : "New Reward"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Buy Server Boost"
                className="font-mono bg-black/50 h-9 text-sm"
              />
            </div>

            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Description</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe what the user needs to do..."
                rows={2}
                className="w-full font-mono text-sm bg-black/50 border border-input rounded-sm px-3 py-2 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Requirement (instruction text)</Label>
              <Input
                value={form.requirement}
                onChange={(e) => setForm(f => ({ ...f, requirement: e.target.value }))}
                placeholder="e.g. Follow @account and like 3 posts"
                className="font-mono bg-black/50 h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Req. Value (optional #)</Label>
                <Input
                  type="number"
                  value={form.requirementValue}
                  onChange={(e) => setForm(f => ({ ...f, requirementValue: e.target.value }))}
                  placeholder="e.g. 1000"
                  className="font-mono bg-black/50 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Reward Value (price)</Label>
                <Input
                  value={form.rewardValue}
                  onChange={(e) => setForm(f => ({ ...f, rewardValue: e.target.value }))}
                  placeholder="e.g. 5 Gmail Credits"
                  className="font-mono bg-black/50 h-9 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Category</Label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full font-mono text-sm bg-black/50 border border-input rounded-sm px-3 py-2 h-9 text-white focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select category...</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isFeatured: !f.isFeatured }))}
                className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-white transition-colors"
              >
                {form.isFeatured ? (
                  <ToggleRight className="w-5 h-5 text-yellow-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                Featured
              </button>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-white transition-colors"
              >
                {form.isActive ? (
                  <ToggleRight className="w-5 h-5 text-green-400" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                Active
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="font-mono text-xs uppercase border-border/50"
              disabled={saveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.title || !form.rewardValue || !form.categoryId}
              className="bg-white text-black hover:bg-white/90 font-mono uppercase tracking-widest text-xs"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Saving...</>
              ) : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent className="bg-black border border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-widest text-sm text-red-400">Remove Reward</DialogTitle>
          </DialogHeader>
          <p className="font-mono text-sm text-muted-foreground">
            This will permanently delete the reward. Any existing claims will remain but the reward won't be listed.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="font-mono text-xs uppercase border-border/50"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 text-white hover:bg-red-600 font-mono uppercase tracking-widest text-xs"
            >
              {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
