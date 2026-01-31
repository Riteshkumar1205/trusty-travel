import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  CheckCheck,
  Check,
  Loader2,
  User,
  Package,
  MapPin,
  Clock,
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { format } from "date-fns";

interface ChatWindowProps {
  deliveryId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    role: "sender" | "traveler";
  };
  parcelTitle?: string;
  trigger?: React.ReactNode;
}

const quickMessages = [
  "Hi! How are you?",
  "Where are you now?",
  "I'm at the location",
  "On my way!",
  "Can you call me?",
  "Running late, sorry!",
];

const ChatWindow = ({
  deliveryId,
  currentUserId,
  otherUser,
  parcelTitle,
  trigger,
}: ChatWindowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, isSending, sendMessage, markAsRead } = useChat({
    deliveryId,
    currentUserId,
    otherUserId: otherUser.id,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when opening chat
  useEffect(() => {
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen, markAsRead]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const handleQuickMessage = async (msg: string) => {
    await sendMessage(msg);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const unreadCount = messages.filter(
    (m) => m.receiver_id === currentUserId && !m.is_read
  ).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="relative">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border/50 bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-primary-foreground">
              {otherUser.avatar || otherUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <SheetTitle className="text-left flex items-center gap-2">
                {otherUser.name}
                <Badge 
                  variant="outline" 
                  className={
                    otherUser.role === "traveler" 
                      ? "bg-accent/10 text-accent border-accent/30" 
                      : "bg-primary/10 text-primary border-primary/30"
                  }
                >
                  {otherUser.role}
                </Badge>
              </SheetTitle>
              {parcelTitle && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Package className="h-3 w-3" />
                  {parcelTitle}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start the conversation below
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.sender_id === currentUserId;
                const showTimestamp =
                  index === 0 ||
                  new Date(message.created_at).getTime() -
                    new Date(messages[index - 1].created_at).getTime() >
                    300000; // 5 minutes

                return (
                  <div key={message.id}>
                    {showTimestamp && (
                      <div className="text-center mb-3">
                        <span className="text-[10px] text-muted-foreground/60 bg-secondary/50 px-2 py-1 rounded-full">
                          {format(new Date(message.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-secondary/50 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isOwn ? "justify-end" : ""
                          }`}
                        >
                          <span className="text-[10px] opacity-70">
                            {format(new Date(message.created_at), "h:mm a")}
                          </span>
                          {isOwn && (
                            message.is_read ? (
                              <CheckCheck className="h-3 w-3 opacity-70" />
                            ) : (
                              <Check className="h-3 w-3 opacity-50" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Quick Messages */}
        <div className="px-4 py-2 border-t border-border/30">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2">
              {quickMessages.map((msg) => (
                <Button
                  key={msg}
                  variant="outline"
                  size="sm"
                  className="shrink-0 text-xs rounded-full"
                  onClick={() => handleQuickMessage(msg)}
                  disabled={isSending}
                >
                  {msg}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/30 bg-background">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 rounded-full bg-secondary/30"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              className="rounded-full shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatWindow;
