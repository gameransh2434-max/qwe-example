import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard } from "@/components/ui/cyber-card";
import { useCreateTicket, getGetTicketsQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const newTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function NewTicket() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createMutation = useCreateTicket();

  const form = useForm<z.infer<typeof newTicketSchema>>({
    resolver: zodResolver(newTicketSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof newTicketSchema>) => {
    createMutation.mutate(values, {
      onSuccess: (data) => {
        toast.success("Channel Established");
        queryClient.invalidateQueries({ queryKey: getGetTicketsQueryKey() });
        setLocation(`/tickets/${data.id}`);
      },
      onError: (err: any) => {
        toast.error("Initialization Failed", { description: err?.message || "Could not create ticket" });
      }
    });
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-6 py-12">
        <Link href="/tickets">
          <button className="font-mono text-xs text-muted-foreground hover:text-primary mb-6 flex items-center bg-transparent border-none cursor-pointer">
            <ArrowLeft className="w-3 h-3 mr-1" /> Abort Initialization
          </button>
        </Link>

        <CyberCard variant="glow" className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black font-mono uppercase tracking-tighter mb-2">Initialize Comms Channel</h1>
            <p className="text-sm text-muted-foreground font-mono border-l-2 border-primary/50 pl-3">
              Open a secure line to network administrators. Provide detailed context for your query.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-widest text-primary/80">Query Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Issue summary..." {...field} className="font-mono bg-black/50 border-border/50 rounded-sm h-11" />
                    </FormControl>
                    <FormMessage className="font-mono text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono text-xs uppercase tracking-widest text-primary/80">Encrypted Payload (Message)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of your issue..." 
                        {...field} 
                        className="font-mono bg-black/50 border-border/50 rounded-sm min-h-[150px] resize-y" 
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-[10px]" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="w-full font-mono uppercase tracking-widest rounded-sm bg-primary text-black hover:bg-primary/90 h-12 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
              >
                {createMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Establishing...</>
                ) : (
                  <><Send className="w-5 h-5 mr-2" /> Establish Channel</>
                )}
              </Button>
            </form>
          </Form>
        </CyberCard>
      </div>
    </AppLayout>
  );
}
