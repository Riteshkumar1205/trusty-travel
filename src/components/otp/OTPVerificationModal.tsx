import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, AlertCircle, Loader2, Package, 
  MapPin, Shield, RefreshCw 
} from "lucide-react";
import { toast } from "sonner";

interface OTPVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "pickup" | "delivery";
  parcelTitle: string;
  expectedOTP: string;
  onVerified: () => void;
  travelerName?: string;
}

const OTPVerificationModal = ({
  open,
  onOpenChange,
  type,
  parcelTitle,
  expectedOTP,
  onVerified,
  travelerName = "Traveler",
}: OTPVerificationModalProps) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setOtp(["", "", "", ""]);
      setIsVerified(false);
      setError(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(false);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when complete
    if (newOtp.every((digit) => digit) && newOtp.join("").length === 4) {
      verifyOTP(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = pastedData.split("");
    while (newOtp.length < 4) newOtp.push("");
    setOtp(newOtp);
    
    if (pastedData.length === 4) {
      verifyOTP(pastedData);
    }
  };

  const verifyOTP = async (enteredOTP: string) => {
    setIsVerifying(true);
    
    // Simulate API verification delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (enteredOTP === expectedOTP) {
      setIsVerified(true);
      setIsVerifying(false);
      toast.success(`${type === "pickup" ? "Pickup" : "Delivery"} verified successfully!`);
      setTimeout(() => {
        onVerified();
        onOpenChange(false);
      }, 1500);
    } else {
      setError(true);
      setIsVerifying(false);
      setAttempts((prev) => prev + 1);
      toast.error("Invalid OTP. Please try again.");
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const resendOTP = () => {
    toast.success("OTP resent to registered mobile number");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className={`p-4 rounded-full ${
              type === "pickup" 
                ? "bg-success/20" 
                : "bg-accent/20"
            }`}>
              {type === "pickup" ? (
                <Package className={`h-8 w-8 ${
                  type === "pickup" ? "text-success" : "text-accent"
                }`} />
              ) : (
                <MapPin className="h-8 w-8 text-accent" />
              )}
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {type === "pickup" ? "Pickup" : "Delivery"} Verification
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter the 4-digit OTP shared by {type === "pickup" ? "sender" : "receiver"} to confirm {type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Parcel Info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
            <div className="p-2 rounded-lg bg-primary/20">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{parcelTitle}</p>
              <p className="text-sm text-muted-foreground">with {travelerName}</p>
            </div>
            <Badge variant="outline" className={
              type === "pickup" 
                ? "bg-success/10 text-success border-success/30" 
                : "bg-accent/10 text-accent border-accent/30"
            }>
              {type}
            </Badge>
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isVerifying || isVerified}
                  className={`w-14 h-14 text-center text-2xl font-mono font-bold rounded-xl transition-all
                    ${error ? "border-destructive bg-destructive/10 animate-shake" : ""}
                    ${isVerified ? "border-success bg-success/10" : ""}
                    ${digit ? "border-primary" : ""}
                  `}
                />
              ))}
            </div>

            {/* Status Messages */}
            {isVerifying && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying OTP...</span>
              </div>
            )}

            {isVerified && (
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Verified Successfully!</span>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Invalid OTP. {3 - attempts} attempts remaining.</span>
              </div>
            )}
          </div>

          {/* Resend Option */}
          {!isVerified && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={resendOTP}
                disabled={isVerifying}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resend OTP
              </Button>
            </div>
          )}

          {/* Security Note */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              OTP ensures secure handoff. Never share with unauthorized persons.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button
            variant={type === "pickup" ? "trust" : "hero"}
            className="flex-1"
            onClick={() => verifyOTP(otp.join(""))}
            disabled={otp.some((d) => !d) || isVerifying || isVerified}
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : isVerified ? (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            ) : null}
            {isVerified ? "Verified" : "Verify"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerificationModal;
