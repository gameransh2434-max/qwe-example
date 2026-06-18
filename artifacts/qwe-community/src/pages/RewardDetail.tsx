import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-card";
import { useGetReward, getGetRewardQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams, Link } from "wouter";
import {
  ArrowLeft, Loader2, Target, Send, Gift, Mail, Users,
  Eye, EyeOff, Plus, Trash2, ImagePlus, X, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PaymentMethod = "gmail" | "invites";

interface GmailCred {
  email: string;
  password: string;
  showPassword: boolean;
}

const QWE_DISCORD = "https://discord.gg/zyCQTu3rnT";

export default function RewardDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { isAuthenticated, user, token } = useAuth();
  const [, setLocation] = useLocation();

  const { data: reward, isLoading } = useGetReward(id, {
    query: { enabled: !!id, queryKey: getGetRewardQueryKey(id) }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gmail");

  // Gmail payment fields
  const [gmailCreds, setGmailCreds] = useState<GmailCred[]>([]);

  // Invite payment fields
  const [myServerLink, setMyServerLink] = useState("");

  // Common fields
  const [targetLink, setTargetLink] = useState("");
  const [discordUsername, setDiscordUsername] = useState(user?.discordUsername || "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Screenshot upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // Parse Gmail count from rewardValue string e.g. "3 Gmail" → 3
  const gmailNeeded = reward ? (parseInt(reward.rewardValue) || 1) : 1;
  const invitesNeeded = gmailNeeded * 5;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Image too large", { description: "Max 6MB per screenshot" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshotPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const openDialog = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to claim this reward");
      setLocation("/login");
      return;
    }
    setDiscordUsername(user?.discordUsername || "");
    setTargetLink("");
    setMyServerLink("");
    setNotes("");
    setScreenshotPreview(null);
    setGmailCreds(
      Array.from({ length: gmailNeeded }, () => ({ email: "", password: "", showPassword: false }))
    );
    setDialogOpen(true);
  };

  const updateGmailCred = (index: number, field: "email" | "password", value: string) => {
    setGmailCreds(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const toggleShowPassword = (index: number) => {
    setGmailCreds(prev => prev.map((c, i) => i === index ? { ...c, showPassword: !c.showPassword } : c));
  };

  const handleSubmit = async () => {
    if (!discordUsername.trim()) {
      toast.error("Discord username is required");
      return;
    }
    if (paymentMethod === "gmail") {
      const allFilled = gmailCreds.every(c => c.email.trim() && c.password.trim());
      if (!allFilled) {
        toast.error("Fill in all Gmail accounts and passwords");
        return;
      }
    }
    if (!targetLink.trim()) {
      toast.error("Please enter the target link (your Discord/social media)");
      return;
    }

    setSubmitting(true);
    try {
      let paymentNote = "";
      if (paymentMethod === "gmail") {
        const credLines = gmailCreds.map((c, i) => `Gmail ${i + 1}: ${c.email} / ${c.password}`).join("\n");
        paymentNote = `[PAYMENT: ${gmailCreds.length} Gmail Account${gmailCreds.length > 1 ? "s" : ""}]\n${credLines}`;
      } else {
        paymentNote = `[PAYMENT: ${invitesNeeded} Discord Invites]\nInvites sent to: ${QWE_DISCORD}${myServerLink ? `\nMy Server: ${myServerLink}` : ""}`;
      }
      const fullNotes = `${paymentNote}\n[TARGET: ${targetLink}]${notes.trim() ? `\n[NOTES: ${notes}]` : ""}`;

      const res = await fetch("/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          rewardId: id,
          discordUsername,
          discordLink: paymentMethod === "invites" ? myServerLink || null : null,
          email: user?.email || "",
          paymentMethod,
          paymentAmount: paymentMethod === "gmail" ? gmailCreds.length : invitesNeeded,
          proofUrl: screenshotPreview || null,
          notes: fullNotes,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to submit claim");
      }

      toast.success("Claim submitted!", { description: "Admin will review within 24h." });
      setDialogOpen(false);
      setLocation("/claims");
    } catch (err: any) {
      toast.error("Submission failed", { description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 py-10">
        <Link href="/rewards">
          <Button variant="link" className="font-mono text-xs text-muted-foreground hover:text-white mb-6 p-0 h-auto">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Rewards
          </Button>
        </Link>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-white/5 rounded-lg" />
            <div className="h-40 bg-white/5 rounded-lg" />
          </div>
        ) : !reward ? (
          <div className="text-center py-20 text-muted-foreground font-mono">Reward not found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-5">
              <CyberCard className="p-7">
                <div className="flex justify-between items-start mb-4">
                  <CyberBadge variant="primary">{reward.categoryName}</CyberBadge>
                  <div className="text-xl font-black font-mono text-white">{reward.rewardValue}</div>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">{reward.title}</h1>
                <p className="text-muted-foreground font-mono text-sm mb-6 leading-relaxed">{reward.description}</p>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="font-mono text-sm font-bold uppercase mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Requirement
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground">
                    {reward.requirement}{reward.requirementValue && ` — ${reward.requirementValue}`}
                  </p>
                </div>

                <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="font-mono text-sm font-bold uppercase mb-3 flex items-center gap-2">
                    <Gift className="w-4 h-4" /> Payment Options
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md p-3">
                      <Mail className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-mono text-muted-foreground">Gmail Accounts</p>
                        <p className="text-sm font-bold">{gmailNeeded} Gmail{gmailNeeded > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-md p-3">
                      <Users className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-mono text-muted-foreground">Discord Invites</p>
                        <p className="text-sm font-bold">{invitesNeeded} Invites</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mt-3">
                    Rate: 1 Gmail = 5 Discord Invites · J4J & S4S allowed
                  </p>
                </div>
              </CyberCard>
            </div>

            <div>
              <CyberCard className="p-5 sticky top-20">
                <h2 className="font-mono text-base font-bold uppercase tracking-tight mb-4 border-b border-border/50 pb-2">
                  Claim Reward
                </h2>
                {!isAuthenticated ? (
                  <div className="text-center py-6 space-y-3">
                    <p className="font-mono text-sm text-muted-foreground">Sign in to claim this reward.</p>
                    <Link href="/login">
                      <Button className="w-full font-mono uppercase text-xs bg-white text-black hover:bg-white/90">Sign In</Button>
                    </Link>
                  </div>
                ) : !reward.isActive ? (
                  <div className="text-center py-6">
                    <p className="font-mono text-sm text-muted-foreground uppercase">Reward Unavailable</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-xs font-mono text-muted-foreground space-y-1">
                      <p>✓ Pay with Gmail or Discord Invites</p>
                      <p>✓ Upload proof screenshot</p>
                      <p>✓ Admin reviews within 24h</p>
                    </div>
                    <Button onClick={openDialog} className="w-full font-mono uppercase text-xs bg-white text-black hover:bg-white/90">
                      <Send className="w-3.5 h-3.5 mr-2" /> Submit Claim
                    </Button>
                  </div>
                )}
              </CyberCard>
            </div>
          </div>
        )}
      </div>

      {/* Claim Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg bg-card border border-white/15 font-mono max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base uppercase tracking-tight">Claim: {reward?.title}</DialogTitle>
            <DialogDescription className="font-mono text-xs text-muted-foreground">
              Choose payment, provide details, and upload a proof screenshot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            {/* Payment Method Selector */}
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("gmail")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-mono transition-all",
                    paymentMethod === "gmail" ? "bg-white text-black border-white" : "bg-white/5 border-white/10 hover:border-white/20"
                  )}
                >
                  <Mail className="w-4 h-4" />
                  <span className="font-bold">{gmailNeeded} Gmail{gmailNeeded > 1 ? "s" : ""}</span>
                  <span className="text-xs opacity-60">+ password</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("invites")}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-mono transition-all",
                    paymentMethod === "invites" ? "bg-white text-black border-white" : "bg-white/5 border-white/10 hover:border-white/20"
                  )}
                >
                  <Users className="w-4 h-4" />
                  <span className="font-bold">{invitesNeeded} Invites</span>
                  <span className="text-xs opacity-60">J4J / S4S</span>
                </button>
              </div>
            </div>

            {/* === GMAIL PAYMENT === */}
            {paymentMethod === "gmail" && (
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-widest text-muted-foreground block">
                  Gmail Accounts — {gmailCreds.length} required
                </Label>
                <div className="space-y-2.5">
                  {gmailCreds.map((cred, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gmail {i + 1}</span>
                        {gmailCreds.length > gmailNeeded && (
                          <button type="button" onClick={() => setGmailCreds(p => p.filter((_, idx) => idx !== i))}
                            className="text-muted-foreground hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <Input
                        type="email"
                        value={cred.email}
                        onChange={(e) => updateGmailCred(i, "email", e.target.value)}
                        placeholder="example@gmail.com"
                        className="bg-black/40 h-8 font-mono text-sm"
                      />
                      <div className="relative">
                        <Input
                          type={cred.showPassword ? "text" : "password"}
                          value={cred.password}
                          onChange={(e) => updateGmailCred(i, "password", e.target.value)}
                          placeholder="Gmail password"
                          className="bg-black/40 h-8 font-mono text-sm pr-9"
                        />
                        <button type="button" onClick={() => toggleShowPassword(i)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                          {cred.showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setGmailCreds(p => [...p, { email: "", password: "", showPassword: false }])}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors font-mono">
                  <Plus className="w-3.5 h-3.5" /> Add another Gmail account
                </button>
              </div>
            )}

            {/* === INVITE PAYMENT === */}
            {paymentMethod === "invites" && (
              <div className="space-y-3">
                {/* QWE Server — where to send invites */}
                <div className="bg-white/10 border border-white/20 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Step 1 — Join & invite to our server</p>
                  <a
                    href={QWE_DISCORD}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-bold hover:underline"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    {QWE_DISCORD}
                  </a>
                  <p className="text-xs text-muted-foreground font-mono">
                    Send <span className="font-bold text-white">{invitesNeeded} members</span> to this server using your invite link, then screenshot your invite count and upload it below.
                  </p>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">
                    Your Discord Server Link (optional — for S4S)
                  </Label>
                  <Input
                    value={myServerLink}
                    onChange={(e) => setMyServerLink(e.target.value)}
                    placeholder="discord.gg/yourserver"
                    className="bg-black/30 h-9 font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* Target Link */}
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Target Link <span className="text-red-400">*</span>
              </Label>
              <Input
                value={targetLink}
                onChange={(e) => setTargetLink(e.target.value)}
                placeholder="discord.gg/server · instagram.com/user · tiktok.com/@user"
                className="bg-black/30 h-9 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1 font-mono">Where do you want the service applied?</p>
            </div>

            {/* Discord Username */}
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Your Discord Username</Label>
              <Input
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="username or @username"
                className="bg-black/30 h-9 font-mono text-sm"
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Proof Screenshot {paymentMethod === "invites" && <span className="text-red-400">*</span>}
              </Label>
              {screenshotPreview ? (
                <div className="relative">
                  <img
                    src={screenshotPreview}
                    alt="Proof screenshot"
                    className="w-full max-h-48 object-contain rounded-lg border border-white/20 bg-black/30"
                  />
                  <button
                    type="button"
                    onClick={() => { setScreenshotPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-white/20 rounded-lg p-5 flex flex-col items-center gap-2 text-muted-foreground hover:border-white/40 hover:text-white transition-all"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs font-mono">Click to upload screenshot (max 6MB)</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Notes */}
            <div>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 block">Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything else the admin should know..."
                className="bg-black/30 font-mono text-sm resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 font-mono text-xs h-9" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button className="flex-1 font-mono text-xs h-9 bg-white text-black hover:bg-white/90" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Submitting...</> : <><Send className="w-3.5 h-3.5 mr-2" /> Submit Claim</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
