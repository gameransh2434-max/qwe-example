import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPassword } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CyberCard } from "@/components/ui/cyber-card";
import { TerminalSquare, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useForgotPassword();

  const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    forgotPasswordMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          setIsSubmitted(true);
        },
        onError: (error: any) => {
          toast.error("Process failed", {
            description: error?.message || "Could not process request",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-black p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-black to-black"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="mb-6">
          <Link href="/login" className="inline-flex items-center text-xs font-mono text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
            <ArrowLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Auth
          </Link>
        </div>
        
        <CyberCard className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-black font-mono tracking-tighter uppercase mb-1">Reset Code</h1>
            <p className="text-sm text-muted-foreground font-mono">Recover your network access.</p>
          </div>

          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/50">
                <TerminalSquare className="w-6 h-6 text-primary" />
              </div>
              <p className="font-mono text-sm text-primary mb-2">Reset link transmitted</p>
              <p className="text-xs text-muted-foreground font-mono">Check your encrypted inbox.</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase tracking-widest text-primary/80">User Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="operative@nexus.net" 
                          {...field} 
                          className="font-mono bg-black/50 border-border/50 focus-visible:ring-primary focus-visible:border-primary rounded-sm h-11"
                        />
                      </FormControl>
                      <FormMessage className="font-mono text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-11 rounded-sm font-mono tracking-widest uppercase bg-primary text-black hover:bg-primary/90 mt-6"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transmitting...</>
                  ) : (
                    "Transmit Reset Link"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CyberCard>
      </div>
    </div>
  );
}
