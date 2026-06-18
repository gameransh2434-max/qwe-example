import { AppLayout } from "@/components/layout/AppLayout";
import { CyberCard } from "@/components/ui/cyber-card";
import { useGetNotifications, getGetNotificationsQueryKey, useMarkAllNotificationsRead, useMarkNotificationRead } from "@workspace/api-client-react";
import { Loader2, Bell, CheckCircle2, ShieldAlert, Megaphone, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useGetNotifications();
  const markAllMutation = useMarkAllNotificationsRead();
  const markReadMutation = useMarkNotificationRead();

  const handleMarkAll = () => {
    markAllMutation.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() })
    });
  };

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate(id, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() })
    });
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'claim_approved': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'claim_rejected': return <ShieldAlert className="w-5 h-5 text-red-500" />;
      case 'announcement': return <Megaphone className="w-5 h-5 text-primary" />;
      case 'admin_message': return <Terminal className="w-5 h-5 text-primary" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 py-12">
        <div className="flex justify-between items-end mb-8 border-b border-border/50 pb-4">
          <div>
            <h1 className="text-3xl font-black font-mono uppercase tracking-tighter mb-2">System Alerts</h1>
            <p className="text-sm text-muted-foreground font-mono">Incoming transmissions from the nexus.</p>
          </div>
          {notifications && notifications.some(n => !n.isRead) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAll}
              disabled={markAllMutation.isPending}
              className="font-mono text-xs uppercase tracking-widest rounded-sm border-primary/20 text-primary hover:bg-primary/10"
            >
              Clear All Logs
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <CyberCard className="p-12 text-center border-dashed bg-black/20">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-mono text-muted-foreground uppercase tracking-widest">No unread transmissions</p>
          </CyberCard>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => (
              <CyberCard 
                key={notif.id} 
                className={`p-4 transition-all cursor-pointer ${!notif.isRead ? 'bg-white/[0.03] border-primary/30' : 'opacity-70'}`}
                onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              >
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-bold font-mono text-sm ${!notif.isRead ? 'text-white' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                        {format(new Date(notif.createdAt), "MM.dd HH:mm")}
                      </span>
                    </div>
                    <p className={`text-sm font-mono ${!notif.isRead ? 'text-gray-300' : 'text-muted-foreground'}`}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="shrink-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,255,255,0.8)]"></div>
                    </div>
                  )}
                </div>
              </CyberCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
