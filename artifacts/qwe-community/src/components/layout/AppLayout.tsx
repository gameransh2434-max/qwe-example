import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const [location] = useLocation();
  const isAuthPage = location === "/login" || location === "/register" || location === "/forgot-password";

  if (isAuthPage) {
    return <div className="min-h-[100dvh] w-full bg-black">{children}</div>;
  }

  return (
    <div className="flex h-[100dvh] w-full bg-black overflow-hidden selection:bg-primary selection:text-black text-foreground">
      {showSidebar && <Sidebar />}
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
          {children}
        </main>
      </div>
    </div>
  );
}
