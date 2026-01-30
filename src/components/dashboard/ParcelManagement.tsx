import { 
  Package, 
  User, 
  MapPin, 
  Clock, 
  Weight,
  Shield,
  MessageCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Parcel {
  id: string;
  journeyId: string;
  sender: {
    name: string;
    rating: number;
    verified: boolean;
  };
  receiver: {
    name: string;
    location: string;
  };
  category: string;
  weight: number;
  price: number;
  status: "pending-pickup" | "picked-up" | "in-transit" | "delivered";
  pickupOtp?: string;
  deliveryOtp?: string;
  confidentiality: "low" | "medium" | "high";
  insurance: boolean;
}

interface ParcelManagementProps {
  parcels: Parcel[];
  onConfirmPickup: (parcelId: string, otp: string) => void;
  onConfirmDelivery: (parcelId: string, otp: string) => void;
  onMessageSender: (parcelId: string) => void;
}

const statusConfig = {
  "pending-pickup": { 
    label: "Pickup Pending", 
    color: "badge-review",
    icon: AlertCircle 
  },
  "picked-up": { 
    label: "Picked Up", 
    color: "badge-verified",
    icon: CheckCircle2 
  },
  "in-transit": { 
    label: "In Transit", 
    color: "badge-verified",
    icon: Package 
  },
  "delivered": { 
    label: "Delivered", 
    color: "badge-trusted",
    icon: CheckCircle2 
  },
};

const confidentialityColors = {
  low: "text-muted-foreground",
  medium: "text-primary",
  high: "text-destructive",
};

const ParcelManagement = ({ 
  parcels, 
  onConfirmPickup, 
  onConfirmDelivery,
  onMessageSender 
}: ParcelManagementProps) => {
  if (parcels.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Parcels Yet</h3>
        <p className="text-muted-foreground text-sm">
          When senders match with your journey, parcels will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parcels.map((parcel) => {
        const status = statusConfig[parcel.status];
        const StatusIcon = status.icon;

        return (
          <div
            key={parcel.id}
            className="card-premium p-5 hover:border-primary/30 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{parcel.category}</span>
                    <span className={status.color}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Weight className="w-3 h-3" />
                      {parcel.weight} kg
                    </span>
                    <span className={`flex items-center gap-1 ${confidentialityColors[parcel.confidentiality]}`}>
                      <Shield className="w-3 h-3" />
                      {parcel.confidentiality} confidentiality
                    </span>
                    {parcel.insurance && (
                      <span className="text-success">Insured</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-muted-foreground">Your Earnings</div>
                <div className="font-mono text-xl font-bold text-primary">₹{parcel.price}</div>
              </div>
            </div>

            {/* Sender & Receiver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-secondary/30 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-card">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Sender</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{parcel.sender.name}</span>
                    {parcel.sender.verified && (
                      <Shield className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      ★ {parcel.sender.rating}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-card">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Deliver To</div>
                  <div className="font-medium text-foreground">{parcel.receiver.name}</div>
                  <div className="text-xs text-muted-foreground">{parcel.receiver.location}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {parcel.status === "pending-pickup" && (
                <Button 
                  variant="hero" 
                  size="sm"
                  onClick={() => onConfirmPickup(parcel.id, parcel.pickupOtp || "")}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Pickup
                </Button>
              )}

              {parcel.status === "in-transit" && (
                <Button 
                  variant="trust" 
                  size="sm"
                  onClick={() => onConfirmDelivery(parcel.id, parcel.deliveryOtp || "")}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Delivery
                </Button>
              )}

              <Button 
                variant="glass" 
                size="sm"
                onClick={() => onMessageSender(parcel.id)}
              >
                <MessageCircle className="w-4 h-4" />
                Message Sender
              </Button>
            </div>

            {/* Trust Reminder */}
            {parcel.status === "pending-pickup" && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-xs text-muted-foreground italic">
                  "You're carrying more than a parcel. Someone is trusting you with their faith."
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ParcelManagement;
