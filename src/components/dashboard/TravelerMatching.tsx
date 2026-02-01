import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Star, Shield, MapPin, Calendar, Clock, 
  CheckCircle2, MessageSquare, Plane, Train, Car, Bike, Truck,
  Sparkles, Award, TrendingUp, Loader2, IndianRupee
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PaymentModal from "@/components/payment/PaymentModal";

interface Traveler {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  trustScore: number;
  verificationStatus: string;
  totalDeliveries: number;
  successRate: number;
  transport: string;
  route: { from: string; to: string };
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  availableCapacity: number;
  pricePerKg: number;
  matchScore: number;
}

const transportIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="h-4 w-4" />,
  train: <Train className="h-4 w-4" />,
  car: <Car className="h-4 w-4" />,
  bike: <Bike className="h-4 w-4" />,
  truck: <Truck className="h-4 w-4" />,
};

const TravelerMatching = () => {
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTraveler, setSelectedTraveler] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedForPayment, setSelectedForPayment] = useState<Traveler | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTravelers();
  }, []);

  const fetchTravelers = async () => {
    setIsLoading(true);
    try {
      // Fetch journeys from public view
      const { data: journeys, error: journeysError } = await supabase
        .from("journeys_public" as "journeys")
        .select("*")
        .eq("status", "upcoming")
        .gte("departure_date", new Date().toISOString().split("T")[0])
        .order("departure_date", { ascending: true })
        .limit(10);

      if (journeysError) throw journeysError;

      // Fetch profile info for each traveler
      const travelerData: Traveler[] = [];
      
      for (const journey of journeys || []) {
        if (!journey.user_id) continue;
        
        // Fetch traveler profile using public view
        const { data: profile } = await supabase
          .from("profiles_public" as "profiles")
          .select("*")
          .eq("user_id", journey.user_id)
          .single();

        const name = profile?.full_name || "Anonymous Traveler";
        const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

        // Calculate match score (simplified - based on capacity and trust)
        const baseScore = Math.min(
          ((profile?.trust_score || 50) / 100) * 50 + 
          ((profile?.successful_deliveries || 0) / Math.max(profile?.total_deliveries || 1, 1)) * 30 +
          (journey.available_capacity > 5 ? 20 : journey.available_capacity * 4),
          100
        );

        travelerData.push({
          id: journey.id!,
          userId: journey.user_id,
          name,
          avatar: initials,
          trustScore: profile?.trust_score || 50,
          verificationStatus: profile?.verification_status || "pending",
          totalDeliveries: profile?.total_deliveries || 0,
          successRate: profile?.total_deliveries 
            ? Math.round(((profile?.successful_deliveries || 0) / profile.total_deliveries) * 100)
            : 100,
          transport: journey.transport_mode || "train",
          route: {
            from: journey.source_city || "",
            to: journey.destination_city || "",
          },
          departureDate: journey.departure_date || "",
          departureTime: journey.departure_time || "",
          arrivalTime: journey.arrival_time || "",
          availableCapacity: journey.available_capacity || 0,
          pricePerKg: journey.price_per_kg || 0,
          matchScore: Math.round(baseScore),
        });
      }

      // Sort by match score
      travelerData.sort((a, b) => b.matchScore - a.matchScore);
      setTravelers(travelerData);
    } catch (error) {
      console.error("Error fetching travelers:", error);
      toast({
        title: "Error loading travelers",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDelivery = (traveler: Traveler) => {
    setSelectedForPayment(traveler);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    toast({
      title: "Delivery Requested! 🎉",
      description: `Transaction ${transactionId} completed. The traveler will be notified.`,
    });
    setShowPaymentModal(false);
    setSelectedForPayment(null);
    setSelectedTraveler(null);
  };

  const getTrustColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-primary";
    return "text-muted-foreground";
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return "bg-success/20 text-success border-success/30";
    if (score >= 75) return "bg-primary/20 text-primary border-primary/30";
    return "bg-muted/20 text-muted-foreground border-muted/30";
  };

  if (isLoading) {
    return (
      <Card className="card-glass border-border/30">
        <CardContent className="py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Finding matching Saarthis...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="card-glass border-border/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-xl bg-success/20">
              <Users className="h-5 w-5 text-success" />
            </div>
            Matching Saarthis
            <Badge variant="outline" className="ml-auto bg-accent/10 text-accent border-accent/30">
              <Sparkles className="h-3 w-3 mr-1" />
              {travelers.length} Available
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {travelers.map((traveler, index) => (
            <div
              key={traveler.id}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedTraveler === traveler.id
                  ? "border-accent bg-accent/10"
                  : "border-border/50 bg-secondary/20 hover:bg-secondary/40"
              }`}
              onClick={() => setSelectedTraveler(traveler.id)}
            >
              {/* Header with match score */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                      {traveler.avatar}
                    </div>
                    {traveler.verificationStatus === "verified" && (
                      <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-0.5">
                        <CheckCircle2 className="h-4 w-4 text-success-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{traveler.name}</h4>
                      {index === 0 && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Best Match
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className={`flex items-center gap-1 ${getTrustColor(traveler.trustScore)}`}>
                        <Shield className="h-3 w-3" />
                        {traveler.trustScore}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-primary" />
                        {traveler.totalDeliveries} trips
                      </span>
                      <span className="flex items-center gap-1 text-success">
                        <TrendingUp className="h-3 w-3" />
                        {traveler.successRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-full border text-sm font-medium ${getMatchColor(traveler.matchScore)}`}>
                  {traveler.matchScore}% match
                </div>
              </div>

              {/* Route & Transport */}
              <div className="flex items-center gap-4 mb-3 p-3 rounded-xl bg-background/50">
                <div className="flex items-center gap-2 text-sm">
                  {transportIcons[traveler.transport]}
                  <span className="capitalize">{traveler.transport}</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">{traveler.route.from}</span>
                  <div className="flex-1 border-t border-dashed border-border/50" />
                  <MapPin className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">{traveler.route.to}</span>
                </div>
              </div>

              {/* Journey Details */}
              <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
                <div className="text-center p-2 rounded-lg bg-secondary/30">
                  <Calendar className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="font-medium">
                    {traveler.departureDate 
                      ? new Date(traveler.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : '-'
                    }
                  </p>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/30">
                  <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="font-medium">{traveler.departureTime || '-'}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/30">
                  <span className="text-lg">📦</span>
                  <p className="font-medium">{traveler.availableCapacity} kg</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-primary/10">
                  <IndianRupee className="h-4 w-4 mx-auto text-primary mb-1" />
                  <p className="font-medium text-primary">{traveler.pricePerKg}/kg</p>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Available Capacity</span>
                  <span>{traveler.availableCapacity} kg free</span>
                </div>
                <Progress value={Math.min((traveler.availableCapacity / 15) * 100, 100)} className="h-2" />
              </div>

              {/* Action Buttons */}
              {selectedTraveler === traveler.id && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                  <Button 
                    className="flex-1 bg-accent hover:bg-accent/90"
                    onClick={() => handleRequestDelivery(traveler)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Request Delivery
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Empty State */}
          {travelers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">No matching Saarthis yet</h3>
              <p className="text-muted-foreground text-sm">
                Post your parcel and we'll notify you when a matching traveler is found
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={fetchTravelers}
              >
                <Loader2 className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedForPayment && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          amount={selectedForPayment.pricePerKg * 5} // Assume 5kg parcel
          parcelTitle="Parcel Delivery"
          travelerName={selectedForPayment.name}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};

export default TravelerMatching;
