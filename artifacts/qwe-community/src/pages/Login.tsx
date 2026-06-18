import { useEffect, useRef, useState } from "react";
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

const credSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type Step = "credentials" | "otp";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [step, setStep] = useState<Step>("credentials");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => hiddenInputRef.current?.focus(), 100);
    }
  }, [step]);

  const credForm = useForm<z.infer<typeof credSchema>>({
    resolver: zodResolver(credSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmitCredentials = async (values: z.infer<typeof credSchema>) => {
    setIsSending(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Login failed", { description: data.error || "Invalid email or password" });
        return;
      }
      setPendingEmail(values.email);
      setOtpValue("");
      setOtpError("");
      setStep("otp");
      if (data.devOtp) {
        setOtpValue(data.devOtp);
        toast.success("Code ready!", { description: "Email not configured — code shown below." });
      } else {
        toast.success("Code sent!", { description: `Check your Gmail inbox at ${values.email}` });
      }
    } catch {
      toast.error("Network error", { description: "Could not reach the server" });
    } finally {
      setIsSending(false);
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
      toast.success(`Welcome back, ${data.user.username}!`);
      setLocation("/dashboard");
    } catch {
      toast.error("Network error", { description: "Could not reach the server" });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-lg">
            {step === "otp" ? (
              <ShieldCheck className="w-7 h-7 text-black" />
            ) : (
              <TerminalSquare className="w-7 h-7 text-black" />
            )}
          </div>
        </div>

        <CyberCard className="p-7">
          {step === "credentials" ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-black tracking-tighter uppercase mb-1">Sign In</h1>
                <p className="text-sm text-muted-foreground font-mono">A verification code will be sent to your Gmail</p>
              </div>

              <Form {...credForm}>
                <form onSubmit={credForm.handleSubmit(onSubmitCredentials)} className="space-y-4">
                  <FormField
                    control={credForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Gmail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@gmail.com" {...field} className="font-mono bg-black/30 h-10" />
                        </FormControl>
                        <FormMessage className="font-mono text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={credForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Password</FormLabel>
                          <Link href="/forgot-password">
                            <span className="font-mono text-xs text-muted-foreground hover:text-white cursor-pointer">Forgot?</span>
                          </Link>
                        </div>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="font-mono bg-black/30 h-10" />
                        </FormControl>
                        <FormMessage className="font-mono text-xs" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-10 font-mono tracking-widest uppercase bg-white text-black hover:bg-white/90 mt-2" disabled={isSending}>
                    {isSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending code...</> : "Send Verification Code"}
                  </Button>
                </form>
              </Form>

              <div className="mt-5 text-center font-mono text-xs text-muted-foreground">
                No account?{" "}
                <Link href="/register">
                  <span className="text-white hover:underline cursor-pointer underline-offset-4">Register here</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <button
                  onClick={() => { setStep("credentials"); setOtpValue(""); setOtpError(""); }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white font-mono mb-4 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                <div className="text-center">
                  <h1 className="text-2xl font-black tracking-tighter uppercase mb-2">Enter Code</h1>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-mono">
                    <Mail className="w-4 h-4" />
                    <span>{pendingEmail}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-2">Check your Gmail inbox for the 6-digit code</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">Verification Code</p>

                  {/* Hidden real input that captures keyboard */}
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
                        className={`h-12 w-11 flex items-center justify-center text-xl font-bold font-mono rounded-sm border transition-colors ${
                          otpValue.length === i
                            ? "border-white bg-white/10"
                            : otpValue[i]
                            ? "border-border/70 bg-black/30"
                            : "border-border/40 bg-black/20"
                        }`}
                      >
                        {otpValue[i] ?? ""}
                      </div>
                    ))}
                  </div>

                  {otpError && <p className="font-mono text-xs text-destructive mt-2">{otpError}</p>}
                  <p className="font-mono text-xs text-muted-foreground mt-2 text-center">Click the boxes then type your code</p>
                </div>

                <Button
                  onClick={onSubmitOtp}
                  className="w-full h-10 font-mono tracking-widest uppercase bg-white text-black hover:bg-white/90"
                  disabled={isVerifying || otpValue.length !== 6}
                >
                  {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify & Sign In"}
                </Button>

                <p className="text-center font-mono text-xs text-muted-foreground">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    onClick={() => { setStep("credentials"); setOtpValue(""); setOtpError(""); }}
                    className="text-white hover:underline underline-offset-4"
                  >
                    Send again
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
