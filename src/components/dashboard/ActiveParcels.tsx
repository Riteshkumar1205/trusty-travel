import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, Clock, MessageSquare, 
  Phone, CheckCircle2, Plane, Train, Car, Eye, Star, IndianRupee,
  Bike, Bus, Truck
} from "lucide-react";
import OTPVerificationModal from "@/components/otp/OTPVerificationModal";
import PaymentModal from "@/components/payment/PaymentModal";
import ContactModal from "@/components/communication/ContactModal";
import { useSenderData, SenderParcel } from "@/hooks/useSenderData";

const transportIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="h-4 w-4" />,
  train: <Train className="h-4 w-4" />,
  car: <Car className="h-4 w-4" />,
  bike: <Bike className="h-4 w-4" />,
  bus: <Bus className="h-4 w-4" />,
  truck: <Truck className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  pending: "bg-muted/20 text-muted-foreground border-muted/30",
  matched: "bg-accent/20 text-accent border-accent/30",
  "picked-up": "bg-primary/20 text-primary border-primary/30",
  "in-transit": "bg-electric/20 text-accent border-accent/30",
  delivered: "bg-success/20 text-success border-success/30",
};

interface ActiveParcelsProps {
  parcels?: SenderParcel[];
  isLoading?: boolean;
}

const ActiveParcels = ({ parcels: propParcels, isLoading: propLoading }: ActiveParcelsProps = {}) => {
  const navigate = useNavigate();
  const { parcels: hookParcels, isLoading: hookLoading } = useSenderData();
  
  // Use props if provided, otherwise use hook data
  const parcels = propParcels !== undefined ? propParcels : hookParcels;
  const isLoading = propLoading !== undefined ? propLoading : hookLoading;
  
  // Filter to only show active parcels (not delivered)
  const activeParcels = parcels.filter(p => p.status !== "delivered");
  
  const [expandedParcel, setExpandedParcel] = useState<string | null>(activeParcels[0]?.id || null);
  const [otpModal, setOtpModal] = useState<{
    open: boolean;
    type: "pickup" | "delivery";
    parcelId: string;
  } | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    parcelId: string;
  } | null>(null);
  const [contactModal, setContactModal] = useState<{
    open: boolean;
    mode: "call" | "message";
    parcelId: string;
  } | null>(null);

  const getActiveParcel = () => parcels.find((p) => p.id === (otpModal?.parcelId || paymentModal?.parcelId || contactModal?.parcelId));
  const activeParcel = getActiveParcel();

  if (isLoading) {
    return (
      <Card className="card-glass border-border/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-primary/20">
              <Package className="h-5 w-5 text-primary" />
            </div>
            Active Parcels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-2xl border border-border/50 bg-secondary/20">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full mt-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glass border-border/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-xl bg-primary/20">
            <Package className="h-5 w-5 text-primary" />
          </div>
          Active Parcels
          <Badge variant="outline" className="ml-auto">
            {activeParcels.length} active
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {activeParcels.map((parcel) => (
          <div
            key={parcel.id}
            className={`p-4 rounded-2xl border transition-all ${
              expandedParcel === parcel.id
                ? "border-accent bg-accent/5"
                : "border-border/50 bg-secondary/20"
            }`}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedParcel(expandedParcel === parcel.id ? null : parcel.id)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent/20">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-semibold">{parcel.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {parcel.transport && transportIcons[parcel.transport]}
                    <span>{parcel.route.from} → {parcel.route.to}</span>
                  </div>
                </div>
              </div>
              <Badge className={statusColors[parcel.status]}>
                {parcel.status.replace("-", " ")}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Journey Progress</span>
                {parcel.eta && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ETA: {parcel.eta}
                  </span>
                )}
              </div>
              <Progress value={parcel.progress} className="h-2" />
            </div>

            {/* Expanded Content */}
            {expandedParcel === parcel.id && (
              <div className="mt-4 pt-4 border-t border-border/30 space-y-4">
                {/* Traveler Info */}
                {parcel.traveler ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-primary-foreground">
                        {parcel.traveler.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{parcel.traveler.name}</span>
                          {parcel.traveler.verified && <CheckCircle2 className="h-4 w-4 text-success" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 text-primary fill-primary" />
                          <span>{(parcel.traveler.trustScore * 20).toFixed(0)}% Trust</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setContactModal({ open: true, mode: "message", parcelId: parcel.id })}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setContactModal({ open: true, mode: "call", parcelId: parcel.id })}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-secondary/30 text-center">
                    <p className="text-sm text-muted-foreground">Waiting for a Saarthi to accept your parcel...</p>
                  </div>
                )}

                {/* OTP Verification Section - only show if matched with delivery */}
                {parcel.traveler && parcel.deliveryId && (
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      className="p-3 rounded-xl bg-success/10 border border-success/30 text-center hover:bg-success/20 transition-colors cursor-pointer"
                      onClick={() => setOtpModal({ open: true, type: "pickup", parcelId: parcel.id })}
                    >
                      <p className="text-xs text-muted-foreground mb-1">Pickup Verification</p>
                      <p className="text-sm font-medium text-success">Enter OTP from sender</p>
                      <p className="text-xs text-success mt-1">Tap to verify</p>
                    </button>
                    <button 
                      className="p-3 rounded-xl bg-accent/10 border border-accent/30 text-center hover:bg-accent/20 transition-colors cursor-pointer"
                      onClick={() => setOtpModal({ open: true, type: "delivery", parcelId: parcel.id })}
                    >
                      <p className="text-xs text-muted-foreground mb-1">Delivery Verification</p>
                      <p className="text-sm font-medium text-accent">Enter OTP from receiver</p>
                      <p className="text-xs text-accent mt-1">Tap to verify</p>
                    </button>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    Delivery Timeline
                  </h5>
                  <div className="space-y-1">
                    {parcel.timeline.map((step, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-success text-success-foreground"
                            : "bg-secondary border border-border"
                        }`}>
                          {step.completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className={step.completed ? "font-medium" : "text-muted-foreground"}>
                            {step.status}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{step.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Weight: <strong>{parcel.weight} kg</strong></span>
                      {parcel.price && (
                        <span className="text-muted-foreground">Price: <strong className="text-primary">₹{parcel.price}</strong></span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate("/tracking")}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Track Live
                    </Button>
                  </div>
                  
                  {/* Payment Button - only for matched parcels */}
                  {parcel.traveler && parcel.price && parcel.status !== "delivered" && (
                    <Button
                      variant="hero"
                      className="w-full"
                      onClick={() => setPaymentModal({ open: true, parcelId: parcel.id })}
                    >
                      <IndianRupee className="h-4 w-4 mr-1" />
                      Pay ₹{parcel.price} to Confirm Delivery
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {activeParcels.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No active parcels</h3>
            <p className="text-muted-foreground text-sm">
              Post your first parcel to get started!
            </p>
          </div>
        )}
      </CardContent>

      {/* OTP Verification Modal */}
      {otpModal && activeParcel && activeParcel.traveler && activeParcel.deliveryId && (
        <OTPVerificationModal
          open={otpModal.open}
          onOpenChange={(open) => !open && setOtpModal(null)}
          type={otpModal.type}
          parcelTitle={activeParcel.title}
          deliveryId={activeParcel.deliveryId}
          travelerName={activeParcel.traveler.name}
          onVerified={() => {
            console.log(`${otpModal.type} verified for parcel ${otpModal.parcelId}`);
          }}
        />
      )}

      {/* Payment Modal */}
      {paymentModal && activeParcel && activeParcel.traveler && (
        <PaymentModal
          open={paymentModal.open}
          onOpenChange={(open) => !open && setPaymentModal(null)}
          amount={activeParcel.price || 0}
          parcelTitle={activeParcel.title}
          travelerName={activeParcel.traveler.name}
          onPaymentSuccess={(transactionId) => {
            console.log(`Payment successful: ${transactionId}`);
          }}
        />
      )}

      {/* Contact Modal */}
      {contactModal && activeParcel && activeParcel.traveler && (
        <ContactModal
          open={contactModal.open}
          onOpenChange={(open) => !open && setContactModal(null)}
          mode={contactModal.mode}
          contact={{
            name: activeParcel.traveler.name,
            initials: activeParcel.traveler.avatar,
            phone: activeParcel.traveler.phone || "",
            trustScore: activeParcel.traveler.trustScore * 20,
            verified: activeParcel.traveler.verified,
          }}
        />
      )}
    </Card>
  );
};

export default ActiveParcels;
