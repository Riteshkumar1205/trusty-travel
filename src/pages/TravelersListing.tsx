import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, MapPin, Calendar, Clock, Package, Star, 
  Shield, Phone, MessageSquare, Filter, Train, Plane, 
  Car, Bike, Truck, ArrowRight, User, ChevronDown
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
  flight: "bg-sky-500/20 text-sky-500 border-sky-500/30",
  train: "bg-amber-500/20 text-amber-500 border-amber-500/30",
  car: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
  bike: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  truck: "bg-orange-500/20 text-orange-500 border-orange-500/30",
};

const TravelersListing = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [transportFilter, setTransportFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState("");
  const [destFilter, setDestFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
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
      
      // Fetch upcoming journeys
      const { data: journeysData, error: journeysError } = await supabase
        .from("journeys")
        .select("*")
        .gte("departure_date", new Date().toISOString().split("T")[0])
        .eq("status", "upcoming")
        .order("departure_date", { ascending: true });

      if (journeysError) throw journeysError;

      // Fetch profiles for all journey owners
      if (journeysData && journeysData.length > 0) {
        const userIds = [...new Set(journeysData.map(j => j.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", userIds);

        if (profilesError) throw profilesError;

        // Map profiles to journeys
        const journeysWithProfiles = journeysData.map(journey => ({
          ...journey,
          profile: profilesData?.find(p => p.user_id === journey.user_id),
        }));

        setJourneys(journeysWithProfiles);
      } else {
        setJourneys([]);
      }
    } catch (error) {
      console.error("Error fetching journeys:", error);
      toast.error("Failed to load travelers");
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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/30 p-4">
        <h1 className="text-xl font-bold mb-3">
          <span className="text-primary">Browse</span> Travelers
        </h1>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by city or traveler name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>

        {/* Filter Toggle */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
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
                className="bg-secondary/50"
              />
              <Input
                placeholder="To city..."
                value={destFilter}
                onChange={(e) => setDestFilter(e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <Select value={transportFilter} onValueChange={setTransportFilter}>
              <SelectTrigger className="bg-secondary/50">
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

      {/* Results Count */}
      <div className="px-4 py-2">
        <p className="text-sm text-muted-foreground">
          {filteredJourneys.length} traveler{filteredJourneys.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Journeys List */}
      <div className="px-4 space-y-4">
        {loading ? (
          // Loading Skeleton
          [...Array(3)].map((_, i) => (
            <Card key={i} className="card-glass animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-secondary/50 rounded-lg" />
              </CardContent>
            </Card>
          ))
        ) : filteredJourneys.length === 0 ? (
          <Card className="card-glass">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">No Travelers Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || sourceFilter || destFilter || transportFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No upcoming journeys available at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJourneys.map((journey) => (
            <Card key={journey.id} className="card-glass border-border/30 overflow-hidden">
              <CardContent className="p-4">
                {/* Traveler Info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                      {getInitials(journey.profile?.full_name)}
                    </div>
                    {journey.profile?.verification_status === "verified" && (
                      <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-0.5">
                        <Shield className="h-3 w-3 text-success-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{journey.profile?.full_name || "Anonymous"}</h3>
                      <Badge className={transportColors[journey.transport_mode]}>
                        {transportIcons[journey.transport_mode]}
                        <span className="ml-1 capitalize">{journey.transport_mode}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-gold fill-gold" />
                        {journey.profile?.trust_score || 50}%
                      </span>
                      <span>{journey.profile?.successful_deliveries || 0} deliveries</span>
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30 mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-success" />
                      {journey.source_city}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{journey.source_location}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-right">
                    <p className="text-xs text-muted-foreground">To</p>
                    <p className="font-semibold">{journey.destination_city}</p>
                    <p className="text-xs text-muted-foreground truncate">{journey.destination_location}</p>
                  </div>
                </div>

                {/* Journey Details */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <Calendar className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-medium">
                      {format(new Date(journey.departure_date), "MMM d")}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-medium">{journey.departure_time?.slice(0, 5)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <Package className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-medium">{journey.available_capacity} kg</p>
                  </div>
                </div>

                {/* Pricing & Actions */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-lg font-bold text-accent">₹{journey.price_per_kg}/kg</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleContact(journey, "message")}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1 bg-primary"
                      onClick={() => handleContact(journey, "call")}
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                  </div>
                </div>

                {/* Transport ID */}
                {(journey.pnr_number || journey.vehicle_number) && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground font-mono">
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
