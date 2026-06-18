import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  order: number;
  rewardCount: number;
}

interface CatForm {
  name: string;
  slug: string;
  icon: string;
  description: string;
  order: string;
}

const emptyForm: CatForm = {
  name: "",
  slug: "",
  icon: "🎯",
  description: "",
  order: "0",
};

export default function AdminCategories() {
  const { token, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CatForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories", { headers });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const body = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        icon: form.icon,
        description: form.description || undefined,
        order: Number(form.order) || 0,
      };
      const res = await fetch("/api/categories", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to create");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setDialogOpen(false);
      setForm(emptyForm);
      toast.success("Category created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE", headers });
      if (!res.ok && res.status !== 204) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to delete");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setDeleteId(null);
      toast.success("Category removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setForm(f => ({ ...f, name, slug }));
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center font-mono text-muted-foreground">
        Access denied.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">Manage Categories</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {categories.length} categories
          </p>
        </div>
        <Button
          onClick={() => { setForm(emptyForm); setDialogOpen(true); }}
          className="bg-white text-black hover:bg-white/90 font-mono uppercase tracking-widest text-xs h-9"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-sm border border-border/50 overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-border/50 bg-white/5">
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground w-8"></th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Icon</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Slug</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Order</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Rewards</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-border/30 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">
                    <GripVertical className="w-3.5 h-3.5" />
                  </td>
                  <td className="px-4 py-3 text-xl">{c.icon}</td>
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.order}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.rewardCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteId(c.id)}
                        disabled={c.rewardCount > 0}
                        className="p-1.5 rounded-sm hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={c.rewardCount > 0 ? "Remove all rewards first" : "Delete category"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-xs">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="font-mono text-xs text-muted-foreground mt-4">
        * Categories with active rewards cannot be deleted. Remove their rewards first.
      </p>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setForm(emptyForm); }}>
        <DialogContent className="bg-black border border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-widest text-sm">New Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Icon</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="🎯"
                  className="font-mono bg-black/50 h-9 text-xl text-center"
                  maxLength={2}
                />
              </div>
              <div className="col-span-3">
                <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. TikTok Growth"
                  className="font-mono bg-black/50 h-9 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Slug (auto-generated)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="tiktok-growth"
                className="font-mono bg-black/50 h-9 text-sm text-muted-foreground"
              />
            </div>

            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short description..."
                className="font-mono bg-black/50 h-9 text-sm"
              />
            </div>

            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Display Order</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}
                placeholder="0"
                className="font-mono bg-black/50 h-9 text-sm w-24"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="font-mono text-xs uppercase border-border/50"
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !form.name}
              className="bg-white text-black hover:bg-white/90 font-mono uppercase tracking-widest text-xs"
            >
              {createMutation.isPending ? (
                <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Creating...</>
              ) : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent className="bg-black border border-border/50 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-widest text-sm text-red-400">Delete Category</DialogTitle>
          </DialogHeader>
          <p className="font-mono text-sm text-muted-foreground">
            This will permanently remove the category. Make sure no rewards are using it.
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
              {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
