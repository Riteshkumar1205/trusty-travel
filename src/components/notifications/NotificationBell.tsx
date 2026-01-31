import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellOff, Check, Package, CreditCard, MessageSquare, Shield } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "otp" | "payment" | "delivery" | "message" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "otp",
    title: "Pickup OTP Verified",
    description: "Rahul Sharma picked up your parcel successfully",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Received",
    description: "₹300 received for Birthday Gift delivery",
    time: "15 min ago",
    read: false,
  },
  {
    id: "3",
    type: "delivery",
    title: "Parcel In Transit",
    description: "Your parcel is on the way to Mumbai",
    time: "1 hour ago",
    read: true,
  },
  {
    id: "4",
    type: "message",
    title: "New Message",
    description: "Priya Patel sent you a message",
    time: "2 hours ago",
    read: true,
  },
];

const notificationIcons = {
  otp: <Shield className="h-4 w-4 text-success" />,
  payment: <CreditCard className="h-4 w-4 text-primary" />,
  delivery: <Package className="h-4 w-4 text-accent" />,
  message: <MessageSquare className="h-4 w-4 text-muted-foreground" />,
  system: <Bell className="h-4 w-4 text-muted-foreground" />,
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);
  const { isSupported, permission, requestPermission, sendNotification } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
    
    // Send a test notification if permission granted
    if (Notification.permission === "granted") {
      setTimeout(() => {
        sendNotification(
          "parcel_matched",
          "Notifications Enabled",
          "You will now receive real-time delivery updates!",
        );
      }, 1000);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground font-medium">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
          
          {/* Push Notification Toggle */}
          {isSupported && permission !== "granted" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 text-xs"
              onClick={handleEnableNotifications}
            >
              {permission === "denied" ? (
                <>
                  <BellOff className="h-3 w-3 mr-2" />
                  Notifications Blocked
                </>
              ) : (
                <>
                  <Bell className="h-3 w-3 mr-2" />
                  Enable Push Notifications
                </>
              )}
            </Button>
          )}
          
          {permission === "granted" && (
            <Badge variant="outline" className="mt-3 w-full justify-center bg-success/10 text-success border-success/30">
              <Bell className="h-3 w-3 mr-1" />
              Push Notifications Enabled
            </Badge>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border/30">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-secondary/30 transition-colors cursor-pointer ${
                    !notification.read ? "bg-accent/5" : ""
                  }`}
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((n) =>
                        n.id === notification.id ? { ...n, read: true } : n
                      )
                    )
                  }
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      {notificationIcons[notification.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t border-border/50">
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
