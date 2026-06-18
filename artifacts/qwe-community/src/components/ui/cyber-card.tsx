import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CyberCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "glow" | "danger" | "success";
  glass?: boolean;
}

export function CyberCard({ children, variant = "default", glass = true, className, ...props }: CyberCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-sm border overflow-hidden transition-all duration-300",
        glass ? "glass" : "bg-card",
        variant === "default" && "border-border/50 hover:border-white/20",
        variant === "glow" && "border-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.05)] hover:shadow-[0_0_25px_rgba(0,255,255,0.15)] hover:border-primary/50",
        variant === "danger" && "border-destructive/30 hover:border-destructive/50",
        variant === "success" && "border-green-500/30 hover:border-green-500/50",
        className
      )}
      {...props}
    >
      {variant === "glow" && (
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function CyberBadge({ children, variant = "default", className }: { children: ReactNode, variant?: string, className?: string }) {
  const getColors = () => {
    switch(variant) {
      case "pending": return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
      case "under_review": return "text-blue-400 border-blue-500/30 bg-blue-500/10";
      case "approved": return "text-green-400 border-green-500/30 bg-green-500/10";
      case "rejected": return "text-red-400 border-red-500/30 bg-red-500/10";
      case "completed": return "text-purple-400 border-purple-500/30 bg-purple-500/10";
      case "primary": return "text-primary border-primary/30 bg-primary/10";
      default: return "text-muted-foreground border-border bg-muted/20";
    }
  };

  return (
    <span className={cn(
      "px-2 py-0.5 text-xs font-mono border rounded-sm tracking-wider uppercase inline-flex items-center",
      getColors(),
      className
    )}>
      {children}
    </span>
  );
}
