import { 
  Plane, 
  Train, 
  Car, 
  Bike, 
  Truck,
  LucideIcon
} from "lucide-react";

export type TransportMode = "flight" | "train" | "car" | "bike" | "truck";

export interface TransportModeConfig {
  id: TransportMode;
  labelKey: string;
  descKey: string;
  icon: LucideIcon;
  category: "air" | "rail" | "road" | "commercial";
  categoryLabelKey: string;
  maxCapacity: number;
  idealFor: string[];
  trustControls: string[];
  speedRating: number; // 1-5
  costRating: number; // 1-5 (lower is cheaper)
  trustRating: number; // 1-5
  weightCapacity: number; // 1-5
}

export const transportModes: TransportModeConfig[] = [
  {
    id: "flight",
    labelKey: "transport.flight",
    descKey: "transport.flightDesc",
    icon: Plane,
    category: "air",
    categoryLabelKey: "transport.air",
    maxCapacity: 7, // cabin luggage limit
    idealFor: ["Urgent parcels", "Documents", "Medical items", "High-priority"],
    trustControls: ["Ticket verification", "Cabin weight limits", "Higher verification tier"],
    speedRating: 5,
    costRating: 5,
    trustRating: 5,
    weightCapacity: 2,
  },
  {
    id: "train",
    labelKey: "transport.train",
    descKey: "transport.trainDesc",
    icon: Train,
    category: "rail",
    categoryLabelKey: "transport.rail",
    maxCapacity: 15,
    idealFor: ["Medium distance", "Reliable schedules", "Cost-effective"],
    trustControls: ["PNR verification", "Coach & seat mapping", "Station-based pickup"],
    speedRating: 3,
    costRating: 2,
    trustRating: 4,
    weightCapacity: 3,
  },
  {
    id: "car",
    labelKey: "transport.car",
    descKey: "transport.carDesc",
    icon: Car,
    category: "road",
    categoryLabelKey: "transport.road",
    maxCapacity: 20,
    idealFor: ["Intercity/intracity", "Flexible timing", "Medium capacity"],
    trustControls: ["Vehicle RC", "Driver license", "Geo-fenced routes"],
    speedRating: 4,
    costRating: 3,
    trustRating: 3,
    weightCapacity: 4,
  },
  {
    id: "bike",
    labelKey: "transport.bike",
    descKey: "transport.bikeDesc",
    icon: Bike,
    category: "road",
    categoryLabelKey: "transport.road",
    maxCapacity: 5,
    idealFor: ["Hyperlocal", "Last-mile", "Small lightweight parcels", "Fast & economical"],
    trustControls: ["Vehicle RC", "Driver license", "Geo-fenced routes"],
    speedRating: 4,
    costRating: 1,
    trustRating: 2,
    weightCapacity: 1,
  },
  {
    id: "truck",
    labelKey: "transport.truck",
    descKey: "transport.truckDesc",
    icon: Truck,
    category: "commercial",
    categoryLabelKey: "transport.commercial",
    maxCapacity: 100,
    idealFor: ["Heavy items", "Bulk items", "Longer timelines"],
    trustControls: ["Vehicle fitness", "Driver KYC", "Cargo category restrictions"],
    speedRating: 2,
    costRating: 2,
    trustRating: 4,
    weightCapacity: 5,
  },
];

export const getTransportModeById = (id: TransportMode): TransportModeConfig | undefined => {
  return transportModes.find(mode => mode.id === id);
};

export const getTransportModesByCategory = () => {
  const categories = {
    air: transportModes.filter(m => m.category === "air"),
    rail: transportModes.filter(m => m.category === "rail"),
    road: transportModes.filter(m => m.category === "road"),
    commercial: transportModes.filter(m => m.category === "commercial"),
  };
  return categories;
};

export type Priority = "speed" | "cost" | "trust" | "weight";

export interface SmartRecommendation {
  mode: TransportModeConfig;
  score: number;
  reason: string;
}

export const getSmartRecommendations = (priority: Priority): SmartRecommendation[] => {
  const ratingKey: Record<Priority, keyof TransportModeConfig> = {
    speed: "speedRating",
    cost: "costRating", // inverted - lower cost = better
    trust: "trustRating",
    weight: "weightCapacity",
  };

  const sorted = [...transportModes].sort((a, b) => {
    const aRating = a[ratingKey[priority]] as number;
    const bRating = b[ratingKey[priority]] as number;
    
    // For cost, lower is better
    if (priority === "cost") {
      return aRating - bRating;
    }
    return bRating - aRating;
  });

  const reasons: Record<Priority, (mode: TransportModeConfig) => string> = {
    speed: (m) => `Fastest option - ${m.speedRating === 5 ? "reaches in hours" : m.speedRating >= 3 ? "same-day possible" : "reliable timing"}`,
    cost: (m) => `Most economical - ${m.costRating === 1 ? "lowest cost" : m.costRating <= 2 ? "budget-friendly" : "reasonable pricing"}`,
    trust: (m) => `Highest trust - ${m.trustRating === 5 ? "maximum verification" : m.trustRating >= 4 ? "verified & secure" : "standard safety"}`,
    weight: (m) => `Best for heavy items - ${m.weightCapacity === 5 ? "bulk cargo" : m.weightCapacity >= 3 ? "large parcels" : "medium weight"}`,
  };

  return sorted.map((mode, index) => ({
    mode,
    score: 100 - (index * 15),
    reason: reasons[priority](mode),
  }));
};
