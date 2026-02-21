import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Phone, MessageSquare, Send, Star, Shield, 
  CheckCircle2, Clock, Video, Copy, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "call" | "message";
  contact: {
    name: string;
    avatar?: string;
    initials: string;
    phone: string;
    trustScore: number;
    verified: boolean;
  };
}

const ContactModal = ({
  open,
  onOpenChange,
  mode,
  contact,
}: ContactModalProps) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Sanitize phone number: only allow digits, +, spaces, hyphens, parens
  const sanitizePhone = (phone: string): string => {
    return phone.replace(/[^0-9+\s()-]/g, "").trim();
  };

  const isValidPhone = (phone: string): boolean => {
    const sanitized = sanitizePhone(phone);
    return /^\+?[0-9\s()-]{7,15}$/.test(sanitized);
  };

  const handleCall = () => {
    if (!isValidPhone(contact.phone)) {
      toast.error("Invalid phone number format");
      return;
    }
    const sanitized = sanitizePhone(contact.phone).replace(/\s/g, "");
    window.location.href = `tel:${encodeURIComponent(sanitized)}`;
    toast.success(`Calling ${contact.name}...`);
  };

  const handleVideoCall = () => {
    toast.info("Video call feature coming soon!");
  };

  const handleCopyNumber = () => {
    const sanitized = sanitizePhone(contact.phone).replace(/\s/g, "");
    navigator.clipboard.writeText(sanitized);
    toast.success("Phone number copied!");
  };

  const handleWhatsApp = () => {
    if (!isValidPhone(contact.phone)) {
      toast.error("Invalid phone number format");
      return;
    }
    const phoneNumber = sanitizePhone(contact.phone).replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${encodeURIComponent(phoneNumber)}`, "_blank");
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSending(false);
    setMessageSent(true);
    toast.success("Message sent successfully!");
    
    setTimeout(() => {
      setMessage("");
      setMessageSent(false);
    }, 2000);
  };

  const quickMessages = [
    "Hi! Where are you currently?",
    "What's your ETA?",
    "I'm at the pickup location",
    "Can you call me?",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {mode === "call" ? "Call" : "Message"} {contact.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Contact Header */}
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <Avatar className="h-20 w-20 mx-auto ring-4 ring-primary/20">
                <AvatarImage src={contact.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl font-bold">
                  {contact.initials}
                </AvatarFallback>
              </Avatar>
              {contact.verified && (
                <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                  <CheckCircle2 className="h-4 w-4 text-success-foreground" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">{contact.name}</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-primary fill-primary" />
                <span>{contact.trustScore}% Trust Score</span>
                {contact.verified && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {mode === "call" ? (
            /* Call Options */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/30">
                <p className="text-center font-mono text-lg">{contact.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={handleCall}
                >
                  <Phone className="h-6 w-6" />
                  <span>Voice Call</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto py-4 flex-col gap-2"
                  onClick={handleVideoCall}
                >
                  <Video className="h-6 w-6" />
                  <span>Video Call</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={handleCopyNumber}
                >
                  <Copy className="h-4 w-4" />
                  Copy Number
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366]"
                  onClick={handleWhatsApp}
                >
                  <ExternalLink className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            /* Message Options */
            <div className="space-y-4">
              {/* Quick Messages */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quick messages</p>
                <div className="flex flex-wrap gap-2">
                  {quickMessages.map((msg, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-full"
                      onClick={() => setMessage(msg)}
                    >
                      {msg}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  variant="hero"
                  className="w-full gap-2"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                >
                  {messageSent ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Sent!
                    </>
                  ) : isSending ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>

              {/* WhatsApp Option */}
              <Button
                variant="secondary"
                className="w-full gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366]"
                onClick={handleWhatsApp}
              >
                <MessageSquare className="h-4 w-4" />
                Continue on WhatsApp
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
