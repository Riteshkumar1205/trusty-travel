import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, Smartphone, Building2, Wallet, 
  Shield, CheckCircle2, Loader2, Package,
  IndianRupee, ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  parcelTitle: string;
  travelerName: string;
  onPaymentSuccess: (transactionId: string) => void;
}

const paymentMethods = [
  {
    id: "upi",
    name: "UPI",
    description: "GPay, PhonePe, Paytm",
    icon: Smartphone,
    popular: true,
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    description: "Visa, Mastercard, RuPay",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    description: "All major banks",
    icon: Building2,
  },
  {
    id: "wallet",
    name: "Wallet",
    description: "Paytm, Mobikwik, Amazon Pay",
    icon: Wallet,
  },
];

const PaymentModal = ({
  open,
  onOpenChange,
  amount,
  parcelTitle,
  travelerName,
  onPaymentSuccess,
}: PaymentModalProps) => {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"select" | "process" | "success">("select");

  const platformFee = Math.round(amount * 0.05);
  const gst = Math.round(platformFee * 0.18);
  const totalAmount = amount + platformFee + gst;

  const handlePayment = async () => {
    setIsProcessing(true);
    setStep("process");

    // Simulate Razorpay payment
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate success
    const transactionId = `TXN${Date.now()}`;
    setStep("success");
    setIsProcessing(false);

    setTimeout(() => {
      onPaymentSuccess(transactionId);
      toast.success("Payment successful! Your parcel delivery is confirmed.");
      onOpenChange(false);
      setStep("select");
    }, 2000);
  };

  const renderContent = () => {
    if (step === "process") {
      return (
        <div className="py-12 text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Processing Payment</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Please wait while we process your payment...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-2xl font-bold">
            <IndianRupee className="h-6 w-6" />
            {totalAmount.toLocaleString()}
          </div>
        </div>
      );
    }

    if (step === "success") {
      return (
        <div className="py-12 text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-success/20 animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-success flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-success-foreground" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-success">Payment Successful!</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Your delivery with {travelerName} is confirmed
            </p>
          </div>
          <Badge className="bg-success/20 text-success border-success/30">
            Amount Paid: ₹{totalAmount.toLocaleString()}
          </Badge>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Order Summary */}
        <div className="p-4 rounded-2xl bg-secondary/30 border border-border/30 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{parcelTitle}</p>
              <p className="text-sm text-muted-foreground">Traveler: {travelerName}</p>
            </div>
          </div>
          
          <Separator className="bg-border/50" />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Charge</span>
              <span>₹{amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (5%)</span>
              <span>₹{platformFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST (18%)</span>
              <span>₹{gst}</span>
            </div>
            <Separator className="bg-border/50" />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="text-primary flex items-center">
                <IndianRupee className="h-4 w-4" />
                {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Select Payment Method</h4>
          
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/30"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                <div className={`p-2 rounded-lg ${
                  selectedMethod === method.id ? "bg-primary/20" : "bg-secondary"
                }`}>
                  <method.icon className={`h-5 w-5 ${
                    selectedMethod === method.id ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={method.id} className="font-medium cursor-pointer">
                      {method.name}
                    </Label>
                    {method.popular && (
                      <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                <ChevronRight className={`h-5 w-5 ${
                  selectedMethod === method.id ? "text-primary" : "text-muted-foreground"
                }`} />
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/20">
          <Shield className="h-5 w-5 text-success shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-success">100% Secure Payment</span>
            <span className="block">Protected by Razorpay with bank-grade security</span>
          </div>
        </div>

        {/* Pay Button */}
        <Button
          variant="hero"
          size="lg"
          className="w-full"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <IndianRupee className="h-5 w-5 mr-1" />
          )}
          Pay ₹{totalAmount.toLocaleString()}
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
        {step === "select" && (
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Complete Payment</DialogTitle>
            <DialogDescription className="text-center">
              Secure payment for your parcel delivery
            </DialogDescription>
          </DialogHeader>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
