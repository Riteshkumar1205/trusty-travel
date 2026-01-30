import { 
  Clock, 
  Weight, 
  Package,
  Train,
  Plane,
  Car,
  Bike,
  Truck,
  MoreVertical,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

export interface Journey {
  id: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  transportMode: "train" | "flight" | "bus" | "car" | "bike" | "truck";
  availableCapacity: number;
  usedCapacity: number;
  parcelsCount: number;
  status: "upcoming" | "in-transit" | "completed";
  earnings: number;
}

interface ActiveJourneysProps {
  journeys: Journey[];
  onViewDetails: (id: string) => void;
  onCancelJourney: (id: string) => void;
}

const transportIcons = {
  train: Train,
  flight: Plane,
  bus: Car, // Using car for bus as fallback
  car: Car,
  bike: Bike,
  truck: Truck,
};

const ActiveJourneys = ({ journeys, onViewDetails, onCancelJourney }: ActiveJourneysProps) => {
  const { t } = useLanguage();

  const statusColors = {
    upcoming: "badge-review",
    "in-transit": "badge-verified",
    completed: "badge-trusted",
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming": return t("general.upcoming");
      case "in-transit": return t("general.inTransit");
      case "completed": return t("general.completed");
      default: return status;
    }
  };

  if (journeys.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Active Journeys</h3>
        <p className="text-muted-foreground text-sm">
          Post your first journey to start earning as a Saarthi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {journeys.map((journey) => {
        const TransportIcon = transportIcons[journey.transportMode] || Car;
        
        return (
          <div
            key={journey.id}
            className="card-glass p-4 hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Route Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <TransportIcon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <span className="truncate">{journey.source}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="truncate">{journey.destination}</span>
                  </div>
                  <span className={statusColors[journey.status]}>
                    {getStatusLabel(journey.status)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{journey.date} at {journey.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Weight className="w-3.5 h-3.5" />
                    <span>{journey.usedCapacity}/{journey.availableCapacity} kg used</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>{journey.parcelsCount} parcel{journey.parcelsCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Right: Earnings & Actions */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Earnings</div>
                  <div className="font-mono text-lg font-semibold text-primary">
                    ₹{journey.earnings}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(journey.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {journey.status === "upcoming" && (
                      <DropdownMenuItem 
                        onClick={() => onCancelJourney(journey.id)}
                        className="text-destructive"
                      >
                        {t("general.cancel")} Journey
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="mt-4">
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-500"
                  style={{ width: `${(journey.usedCapacity / journey.availableCapacity) * 100}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveJourneys;
