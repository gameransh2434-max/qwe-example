import { useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CyberCard } from "@/components/ui/cyber-card";
import { TerminalSquare, Loader2, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  discordUsername: z.string().optional(),
});

type Step = "form" | "otp";

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", discordUsername: "" },
  });

  const goToOtp = () => {
    setOtpValue("");
    setOtpError("");
    setTimeout(() => hiddenInputRef.current?.focus(), 100);
  };

  const onSubmitForm = async (values: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Registration failed", { description: data.error || "Could not create account" });
        return;
      }
      setPendingEmail(values.email);
      setStep("otp");
      goToOtp();
      if (data.devOtp) {
        setOtpValue(data.devOtp);
        toast.success("Code ready!", { description: "Email not configured — code pre-filled below." });
      } else {
        toast.success("Verification code sent!", { description: `Check your inbox at ${values.email}` });
      }
    } catch {
      toast.error("Network error", { description: "Could not reach the server" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitOtp = async () => {
    if (otpValue.length !== 6) {
      setOtpError("Code must be exactly 6 digits");
      return;
    }
    setOtpError("");
    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Verification failed", { description: data.error || "Invalid or expired code" });
        return;
      }
      login(data.token, data.user);
      toast.success("Account verified!", { description: `Welcome to the nexus, ${data.user.username}` });
      setLocation("/dashboard");
    } catch {
      toast.error("Network error", { description: "Could not reach the server" });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-black p-4 py-12">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-black to-black" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-sm bg-primary/10 border border-primary/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            {step === "otp" ? (
              <ShieldCheck className="w-8 h-8 text-primary" />
            ) : (
              <TerminalSquare className="w-8 h-8 text-primary" />
            )}
          </div>
        </div>

        <CyberCard variant="glow" className="p-8">
          {step === "form" ? (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-black font-mono tracking-tighter uppercase mb-1">Create ID</h1>
                <p className="text-sm text-muted-foreground font-mono">A verification code will be sent to your email.</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-widest text-primary/80">Username</FormLabel>
                        <FormControl>
                          <Input placeholder="CoolUsername" {...field} className="font-mono bg-black/50 border-border/50 focus-visible:ring-primary focus-visible:border-primary rounded-sm h-11" />
                        </FormControl>
                        <FormMessage className="font-mono text-xs text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-widest text-primary/80">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="operative@gmail.com" {...field} className="font-mono bg-black/50 border-border/50 focus-visible:ring-primary focus-visible:border-primary rounded-sm h-11" />
                        </FormControl>
                        <FormMessage className="font-mono text-xs text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-widest text-primary/80">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="font-mono bg-black/50 border-border/50 focus-visible:ring-primary focus-visible:border-primary rounded-sm h-11" />
                        </FormControl>
                        <FormMessage className="font-mono text-xs text-destructive" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discordUsername"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-widest text-primary/80">Discord (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="user#1234 or @user" {...field} className="font-mono bg-black/50 border-border/50 focus-visible:ring-primary focus-visible:border-primary rounded-sm h-11" />
                        </FormControl>
                        <FormMessage className="font-mono text-xs text-destructive" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11 rounded-sm font-mono tracking-widest uppercase bg-primary text-black hover:bg-primary/90 mt-6 shadow-[0_0_15px_rgba(0,255,255,0.2)]" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending code...</> : "Create ID & Verify Email"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center font-mono text-xs text-muted-foreground">
                Already have an active ID?{" "}
                <Link href="/login">
                  <span className="text-primary hover:underline cursor-pointer underline-offset-4">Authenticate</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <button
                  onClick={() => { setStep("form"); setOtpValue(""); setOtpError(""); }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white font-mono mb-4 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <div className="text-center">
                  <h1 className="text-2xl font-black font-mono tracking-tighter uppercase mb-2">Verify Email</h1>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-mono">
                    <Mail className="w-4 h-4" />
                    <span>{pendingEmail}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-2">Enter the 6-digit code sent to your inbox</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Verification Code</p>

                  {/* Hidden real input that captures keyboard events */}
                  <input
                    ref={hiddenInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtpValue(val);
                      setOtpError("");
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") onSubmitOtp(); }}
                    className="absolute opacity-0 w-0 h-0 pointer-events-none"
                    aria-hidden="true"
                    tabIndex={-1}
                  />

                  {/* Visual slots — click to focus hidden input */}
                  <div
                    className="flex gap-2 justify-center cursor-text"
                    onClick={() => hiddenInputRef.current?.focus()}
                  >
                    {[0,1,2,3,4,5].map((i) => (
                      <div
                        key={i}
                        className={`h-14 w-12 flex items-center justify-center text-2xl font-bold font-mono rounded-sm border transition-colors ${
                          otpValue.length === i
                            ? "border-primary bg-primary/10 shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                            : otpValue[i]
                            ? "border-border/70 bg-black/50"
                            : "border-border/40 bg-black/30"
                        }`}
                      >
                        {otpValue[i] ?? ""}
                      </div>
                    ))}
                  </div>

                  {otpError && <p className="font-mono text-xs text-destructive mt-2 text-center">{otpError}</p>}
                  <p className="font-mono text-xs text-muted-foreground mt-2 text-center">Click the boxes then type your code</p>
                </div>

                <Button
                  onClick={onSubmitOtp}
                  className="w-full h-11 rounded-sm font-mono tracking-widest uppercase bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                  disabled={isVerifying || otpValue.length !== 6}
                >
                  {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify & Enter Network"}
                </Button>

                <p className="text-center font-mono text-xs text-muted-foreground">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={() => { setStep("form"); setOtpValue(""); setOtpError(""); }}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    Go back and resend
                  </button>
                </p>
              </div>
            </>
          )}
        </CyberCard>
      </div>
    </div>
  );
}
