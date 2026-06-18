import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGetAnnouncements, getGetAnnouncementsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Megaphone, Plus, Trash2, Loader2, Pin } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type AnnType = "info" | "warning" | "success";

export default function AdminAnnouncements() {
  const { token } = useAuth();
  const qc = useQueryClient();
  const { data: announcements, isLoading } = useGetAnnouncements();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<AnnType>("info");
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content, type, isPinned }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Announcement posted!");
      setTitle("");
      setContent("");
      setType("info");
      setIsPinned(false);
      qc.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() });
    } catch {
      toast.error("Failed to post announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Announcement deleted");
      qc.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() });
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const typeVariant: Record<AnnType, "default" | "warning" | "success"> = {
    info: "default",
    warning: "warning",
    success: "success",
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 py-10">
        <h1 className="text-3xl font-black font-mono uppercase tracking-tighter flex items-center gap-3 text-primary mb-8">
          <Megaphone className="w-8 h-8" /> Announcements
        </h1>

        {/* Create form */}
        <CyberCard variant="glow" className="p-6 mb-8">
          <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground mb-4">New Announcement</h2>
          <div className="space-y-4">
            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title..."
                className="font-mono bg-black/50 h-10 mt-1"
              />
            </div>
            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement..."
                className="font-mono bg-black/50 mt-1 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-4 flex-wrap items-center">
              <div>
                <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Type</Label>
                <div className="flex gap-2 mt-1">
                  {(["info", "warning", "success"] as AnnType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`font-mono text-xs px-3 py-1 rounded-sm border transition-colors ${
                        type === t
                          ? "bg-primary text-black border-primary"
                          : "border-border/50 text-muted-foreground hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="accent-primary"
                />
                <Label htmlFor="pinned" className="font-mono text-xs text-muted-foreground cursor-pointer">
                  Pin to top
                </Label>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={submitting}
              className="font-mono bg-primary text-black hover:bg-primary/90 h-10"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Post Announcement
            </Button>
          </div>
        </CyberCard>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (announcements || []).length === 0 ? (
          <div className="text-center py-10 text-muted-foreground font-mono">No announcements yet</div>
        ) : (
          <div className="space-y-3">
            {(announcements || []).map((a) => (
              <CyberCard key={a.id} className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {a.isPinned && <Pin className="w-3 h-3 text-primary" />}
                    <span className="font-mono font-bold text-sm">{a.title}</span>
                    <CyberBadge variant={typeVariant[a.type as AnnType] || "default"} className="text-xs">
                      {a.type}
                    </CyberBadge>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{a.content}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
                  disabled={deletingId === a.id}
                  onClick={() => handleDelete(a.id)}
                >
                  {deletingId === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                </Button>
              </CyberCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
