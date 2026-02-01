import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, MapPin, Calendar, Clock, Package, Star, 
  Shield, Phone, MessageSquare, Filter, Train, Plane, 
  Car, Bike, Truck, ArrowRight, User, ChevronDown,
  Send, Heart, CheckCircle2, Sparkles, TrendingUp,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import ContactModal from "@/components/communication/ContactModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";

interface Journey {
  id: string;
  source_city: string;
  destination_city: string;
  source_location: string;
  destination_location: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  transport_mode: string;
  available_capacity: number;
  price_per_kg: number;
  pnr_number?: string;
  vehicle_number?: string;
  accepted_parcel_types: string[];
  user_id: string;
  profile?: {
    full_name: string;
    phone: string;
    trust_score: number;
    verification_status: string;
    avatar_url?: string;
    successful_deliveries: number;
  };
}

const transportIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="h-4 w-4" />,
  train: <Train className="h-4 w-4" />,
  car: <Car className="h-4 w-4" />,
  bike: <Bike className="h-4 w-4" />,
  truck: <Truck className="h-4 w-4" />,
};

const transportColors: Record<string, string> = {
  flight: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  train: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  car: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  bike: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  truck: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

// Simulated travelers for demo
const simulatedJourneys: Journey[] = [
  {
    id: "sim-1",
    source_city: "New Delhi",
    destination_city: "Mumbai",
    source_location: "IGI Airport T3",
    destination_location: "Chhatrapati Shivaji Terminal",
    departure_date: "2026-02-03",
    departure_time: "06:30:00",
    arrival_date: "2026-02-03",
    arrival_time: "09:00:00",
    transport_mode: "flight",
    available_capacity: 8,
    price_per_kg: 120,
    pnr_number: "AI301",
    accepted_parcel_types: ["documents", "electronics"],
    user_id: "sim-user-1",
    profile: {
      full_name: "Arjun Mehta",
      phone: "+91 98765 43210",
      trust_score: 92,
      verification_status: "verified",
      successful_deliveries: 47,
    }
  },
  {
    id: "sim-2",
    source_city: "Bangalore",
    destination_city: "Chennai",
    source_location: "Majestic Bus Stand",
    destination_location: "CMBT Chennai",
    departure_date: "2026-02-04",
    departure_time: "22:00:00",
    arrival_date: "2026-02-05",
    arrival_time: "05:30:00",
    transport_mode: "car",
    available_capacity: 15,
    price_per_kg: 45,
    vehicle_number: "KA 01 AB 1234",
    accepted_parcel_types: ["documents", "clothing", "general"],
    user_id: "sim-user-2",
    profile: {
      full_name: "Priya Sharma",
      phone: "+91 87654 32109",
      trust_score: 88,
      verification_status: "verified",
      successful_deliveries: 31,
    }
  },
  {
    id: "sim-3",
    source_city: "Kolkata",
    destination_city: "Patna",
    source_location: "Howrah Station",
    destination_location: "Patna Junction",
    departure_date: "2026-02-05",
    departure_time: "19:45:00",
    arrival_date: "2026-02-06",
    arrival_time: "04:15:00",
    transport_mode: "train",
    available_capacity: 12,
    price_per_kg: 35,
    pnr_number: "2841256789",
    accepted_parcel_types: ["documents", "medicines", "clothing"],
    user_id: "sim-user-3",
    profile: {
      full_name: "Vikash Kumar",
      phone: "+91 76543 21098",
      trust_score: 95,
      verification_status: "verified",
      successful_deliveries: 82,
    }
  },
  {
    id: "sim-4",
    source_city: "Hyderabad",
    destination_city: "Vijayawada",
    source_location: "Secunderabad Station",
    destination_location: "Vijayawada Junction",
    departure_date: "2026-02-06",
    departure_time: "14:30:00",
    arrival_date: "2026-02-06",
    arrival_time: "19:00:00",
    transport_mode: "train",
    available_capacity: 10,
    price_per_kg: 40,
    pnr_number: "4521893456",
    accepted_parcel_types: ["electronics", "general"],
    user_id: "sim-user-4",
    profile: {
      full_name: "Sneha Reddy",
      phone: "+91 65432 10987",
      trust_score: 78,
      verification_status: "verified",
      successful_deliveries: 19,
    }
  },
];

const TravelersListing = () => {
  const { user } = useAuth({ requireAuth: false });
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [transportFilter, setTransportFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState("");
  const [destFilter, setDestFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [interestSent, setInterestSent] = useState<Set<string>>(new Set());
  const [contactModal, setContactModal] = useState<{
    open: boolean;
    mode: "call" | "message";
    contact: {
      name: string;
      initials: string;
      phone: string;
      trustScore: number;
      verified: boolean;
    };
  } | null>(null);

  useEffect(() => {
    fetchJourneys();
  }, []);

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming journeys using public view (hides sensitive data)
      const { data: journeysData, error: journeysError } = await supabase
        .from("journeys_public" as "journeys")
        .select("*")
        .gte("departure_date", new Date().toISOString().split("T")[0])
        .eq("status", "upcoming")
        .order("departure_date", { ascending: true });

      if (journeysError) throw journeysError;

      // Fetch profiles using public view (hides phone for non-related users)
      if (journeysData && journeysData.length > 0) {
        const userIds = [...new Set(journeysData.map((j) => j.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles_public" as "profiles")
          .select("*")
          .in("user_id", userIds);

        if (profilesError) throw profilesError;

        // Map profiles to journeys
        const journeysWithProfiles = journeysData.map((journey) => ({
          ...journey,
          profile: profilesData?.find((p) => p.user_id === journey.user_id),
        }));

        // Combine real journeys with simulated ones
        setJourneys([...journeysWithProfiles, ...simulatedJourneys]);
      } else {
        // Show simulated journeys when no real data
        setJourneys(simulatedJourneys);
      }
    } catch (error) {
      console.error("Error fetching journeys:", error);
      toast.error("Failed to load travelers");
      // Fall back to simulated journeys
      setJourneys(simulatedJourneys);
    } finally {
      setLoading(false);
    }
  };

  const filteredJourneys = journeys.filter(journey => {
    const matchesSearch = 
      journey.source_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journey.destination_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journey.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTransport = transportFilter === "all" || journey.transport_mode === transportFilter;
    const matchesSource = !sourceFilter || journey.source_city.toLowerCase().includes(sourceFilter.toLowerCase());
    const matchesDest = !destFilter || journey.destination_city.toLowerCase().includes(destFilter.toLowerCase());

    return matchesSearch && matchesTransport && matchesSource && matchesDest;
  });

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleContact = (journey: Journey, mode: "call" | "message") => {
    if (!journey.profile?.phone) {
      toast.error("Contact information not available");
      return;
    }

    setContactModal({
      open: true,
      mode,
      contact: {
        name: journey.profile.full_name || "Traveler",
        initials: getInitials(journey.profile.full_name),
        phone: journey.profile.phone,
        trustScore: journey.profile.trust_score || 50,
        verified: journey.profile.verification_status === "verified",
      },
    });
  };

  const handleSendInterest = async (journey: Journey) => {
    if (interestSent.has(journey.id)) {
      toast.info("Interest already sent to this traveler");
      return;
    }

    // Simulate sending interest notification
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: "Sending interest to " + (journey.profile?.full_name || "traveler") + "...",
        success: () => {
          setInterestSent(prev => new Set([...prev, journey.id]));
          return `Interest sent! ${journey.profile?.full_name || "Traveler"} will be notified.`;
        },
        error: "Failed to send interest",
      }
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Premium Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                Find Your <span className="text-gradient-gold">Saarthi</span>
              </h1>
              <p className="text-sm text-muted-foreground">Verified travelers heading your way</p>
            </div>
            <Badge className="badge-verified gap-1.5">
              <Sparkles className="h-3 w-3" />
              Smart Match
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by city or traveler name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-secondary/50 border-border/50 rounded-2xl text-base"
            />
          </div>

          {/* Filter Toggle */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between rounded-xl">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="From city..."
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-secondary/50 rounded-xl"
                />
                <Input
                  placeholder="To city..."
                  value={destFilter}
                  onChange={(e) => setDestFilter(e.target.value)}
                  className="bg-secondary/50 rounded-xl"
                />
              </div>
              <Select value={transportFilter} onValueChange={setTransportFilter}>
                <SelectTrigger className="bg-secondary/50 rounded-xl">
                  <SelectValue placeholder="Transport mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transport Modes</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="flight">Flight</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Results Count & Quick Stats */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border/20">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredJourneys.length}</span> travelers available
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            All Verified
          </Badge>
        </div>
      </div>

      {/* Journeys List */}
      <div className="p-4 space-y-4">
        {loading ? (
          // Premium Loading Skeleton
          [...Array(3)].map((_, i) => (
            <Card key={i} className="card-glass animate-pulse overflow-hidden">
              <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-secondary/50 to-secondary/30" />
              </CardContent>
            </Card>
          ))
        ) : filteredJourneys.length === 0 ? (
          <Card className="card-glass border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Travelers Found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {searchQuery || sourceFilter || destFilter || transportFilter !== "all"
                  ? "Try adjusting your filters to see more results"
                  : "No upcoming journeys available at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJourneys.map((journey, index) => (
            <Card 
              key={journey.id} 
              className="card-premium overflow-hidden group hover:border-primary/30 transition-all duration-500"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-0">
                {/* Top Section with Gradient */}
                <div className="relative p-4 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
                  {/* Traveler Info */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                        {getInitials(journey.profile?.full_name)}
                      </div>
                      {journey.profile?.verification_status === "verified" && (
                        <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1 shadow-md">
                          <Shield className="h-3.5 w-3.5 text-success-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{journey.profile?.full_name || "Anonymous"}</h3>
                        <Badge className={`${transportColors[journey.transport_mode]} text-xs`}>
                          {transportIcons[journey.transport_mode]}
                          <span className="ml-1 capitalize">{journey.transport_mode}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm">
                        <span className="flex items-center gap-1.5 text-primary font-medium">
                          <Star className="h-4 w-4 fill-primary" />
                          {journey.profile?.trust_score || 50}% Trust
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {journey.profile?.successful_deliveries || 0} deliveries
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-accent">₹{journey.price_per_kg}</div>
                      <div className="text-xs text-muted-foreground">per kg</div>
                    </div>
                  </div>
                </div>

                {/* Route Section */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-0.5">
                        <div className="w-2 h-2 rounded-full bg-success" />
                        From
                      </div>
                      <p className="font-semibold truncate">{journey.source_city}</p>
                      <p className="text-xs text-muted-foreground truncate">{journey.source_location}</p>
                    </div>
                    <div className="flex-shrink-0 px-2">
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-0.5">
                        To
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <p className="font-semibold truncate">{journey.destination_city}</p>
                      <p className="text-xs text-muted-foreground truncate">{journey.destination_location}</p>
                    </div>
                  </div>
                </div>

                {/* Journey Details Grid */}
                <div className="px-4 pb-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-muted/30 text-center">
                      <Calendar className="h-4 w-4 mx-auto text-accent mb-1" />
                      <p className="text-xs font-medium">
                        {format(new Date(journey.departure_date), "MMM d")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Departure</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 text-center">
                      <Clock className="h-4 w-4 mx-auto text-accent mb-1" />
                      <p className="text-xs font-medium">{journey.departure_time?.slice(0, 5)}</p>
                      <p className="text-[10px] text-muted-foreground">Time</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30 text-center">
                      <Package className="h-4 w-4 mx-auto text-accent mb-1" />
                      <p className="text-xs font-medium">{journey.available_capacity} kg</p>
                      <p className="text-[10px] text-muted-foreground">Capacity</p>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="p-4 pt-0 space-y-3">
                  {/* Primary Contact Button */}
                  <Button
                    className="w-full h-12 gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold rounded-xl shadow-lg"
                    onClick={() => handleContact(journey, "message")}
                  >
                    <MessageSquare className="h-5 w-5" />
                    Contact {journey.profile?.full_name?.split(" ")[0] || "Traveler"}
                  </Button>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 rounded-xl border-border/50 hover:border-primary/50"
                      onClick={() => handleContact(journey, "call")}
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                    <Button
                      variant={interestSent.has(journey.id) ? "secondary" : "outline"}
                      className={`gap-2 rounded-xl ${
                        interestSent.has(journey.id) 
                          ? "bg-success/10 text-success border-success/30" 
                          : "border-border/50 hover:border-success/50 hover:text-success"
                      }`}
                      onClick={() => handleSendInterest(journey)}
                      disabled={interestSent.has(journey.id)}
                    >
                      {interestSent.has(journey.id) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Sent
                        </>
                      ) : (
                        <>
                          <Heart className="h-4 w-4" />
                          Interested
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Transport ID Footer */}
                {(journey.pnr_number || journey.vehicle_number) && (
                  <div className="px-4 py-2 bg-muted/20 border-t border-border/30">
                    <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                      <Zap className="h-3 w-3 text-accent" />
                      {journey.pnr_number ? `PNR: ${journey.pnr_number}` : `Vehicle: ${journey.vehicle_number}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Contact Modal */}
      {contactModal && (
        <ContactModal
          open={contactModal.open}
          onOpenChange={(open) => !open && setContactModal(null)}
          mode={contactModal.mode}
          contact={contactModal.contact}
        />
      )}
    </div>
  );
};

export default TravelersListing;
