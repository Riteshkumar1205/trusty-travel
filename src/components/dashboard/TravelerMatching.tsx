import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, Star, Shield, MapPin, Calendar, Clock, 
  CheckCircle2, MessageSquare, Plane, Train, Car, Bike, Truck,
  Sparkles, Award, TrendingUp
} from "lucide-react";

const mockTravelers = [
  {
    id: "1",
    name: "Rahul Sharma",
    avatar: "RS",
    trustScore: 92,
    verificationStatus: "verified",
    totalDeliveries: 47,
    successRate: 98,
    transport: "train",
    route: { from: "Delhi", to: "Mumbai" },
    departureDate: "2025-02-01",
    departureTime: "06:00",
    arrivalTime: "22:30",
    availableCapacity: 5.5,
    pricePerKg: 120,
    matchScore: 95,
    reviews: [
      { rating: 5, comment: "Super reliable, delivered on time!" },
      { rating: 5, comment: "Very professional and communicative" },
    ],
  },
  {
    id: "2",
    name: "Priya Patel",
    avatar: "PP",
    trustScore: 88,
    verificationStatus: "verified",
    totalDeliveries: 23,
    successRate: 100,
    transport: "flight",
    route: { from: "Delhi", to: "Mumbai" },
    departureDate: "2025-02-01",
    departureTime: "08:30",
    arrivalTime: "10:45",
    availableCapacity: 3.0,
    pricePerKg: 250,
    matchScore: 88,
    reviews: [
      { rating: 5, comment: "Fast and careful with fragile items" },
    ],
  },
  {
    id: "3",
    name: "Amit Kumar",
    avatar: "AK",
    trustScore: 75,
    verificationStatus: "verified",
    totalDeliveries: 12,
    successRate: 92,
    transport: "car",
    route: { from: "Delhi", to: "Jaipur" },
    departureDate: "2025-02-02",
    departureTime: "10:00",
    arrivalTime: "16:00",
    availableCapacity: 15.0,
    pricePerKg: 80,
    matchScore: 72,
    reviews: [],
  },
];

const transportIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="h-4 w-4" />,
  train: <Train className="h-4 w-4" />,
  car: <Car className="h-4 w-4" />,
  bike: <Bike className="h-4 w-4" />,
  truck: <Truck className="h-4 w-4" />,
};

const TravelerMatching = () => {
  const [selectedTraveler, setSelectedTraveler] = useState<string | null>(null);

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

  return (
    <Card className="card-glass border-border/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-xl bg-success/20">
            <Users className="h-5 w-5 text-success" />
          </div>
          Matching Saarthis
          <Badge variant="outline" className="ml-auto bg-accent/10 text-accent border-accent/30">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Matched
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {mockTravelers.map((traveler, index) => (
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
                <p className="font-medium">{new Date(traveler.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-secondary/30">
                <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                <p className="font-medium">{traveler.departureTime}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-secondary/30">
                <span className="text-lg">📦</span>
                <p className="font-medium">{traveler.availableCapacity} kg</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-primary/10">
                <span className="text-lg">₹</span>
                <p className="font-medium text-primary">{traveler.pricePerKg}/kg</p>
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Available Capacity</span>
                <span>{traveler.availableCapacity} kg free</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>

            {/* Reviews Preview */}
            {traveler.reviews.length > 0 && (
              <div className="p-2 rounded-lg bg-secondary/20 text-sm">
                <div className="flex items-center gap-1 mb-1">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Recent review:</span>
                </div>
                <p className="text-muted-foreground italic">"{traveler.reviews[0].comment}"</p>
              </div>
            )}

            {/* Action Buttons */}
            {selectedTraveler === traveler.id && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
                <Button className="flex-1 bg-accent hover:bg-accent/90">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Request Delivery
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {mockTravelers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium mb-2">No matching Saarthis yet</h3>
            <p className="text-muted-foreground text-sm">
              Post your parcel and we'll notify you when a matching traveler is found
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TravelerMatching;
