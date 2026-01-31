import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { 
  Navigation, MapPin, Clock, Package, Users,
  Power, ChevronRight, Zap, Star, TrendingUp,
  Route, Target
} from "lucide-react";

interface TravelerStatusCardProps {
  isOnline?: boolean;
  currentJourney?: {
    id: string;
    source: string;
    destination: string;
    departureTime: string;
    progress: number;
    parcelsCount: number;
    earnings: number;
  } | null;
  stats?: {
    todayEarnings: number;
    todayParcels: number;
    weeklyEarnings: number;
    rating: number;
  };
  onToggleOnline?: (online: boolean) => void;
  onViewJourney?: (id: string) => void;
}

const TravelerStatusCard = ({
  isOnline = false,
  currentJourney,
  stats = { todayEarnings: 0, todayParcels: 0, weeklyEarnings: 0, rating: 4.8 },
  onToggleOnline,
  onViewJourney
}: TravelerStatusCardProps) => {
  const [online, setOnline] = useState(isOnline);

  const handleToggle = (checked: boolean) => {
    setOnline(checked);
    onToggleOnline?.(checked);
  };

  return (
    <Card className="card-glass border-border/30 overflow-hidden">
      {/* Status Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className={`p-2 rounded-xl transition-colors ${online ? "bg-success/20" : "bg-muted/20"}`}>
              <Power className={`h-5 w-5 transition-colors ${online ? "text-success" : "text-muted-foreground"}`} />
            </div>
            Traveler Status
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${online ? "text-success" : "text-muted-foreground"}`}>
              {online ? "Online" : "Offline"}
            </span>
            <Switch
              checked={online}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-success"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Online Status Banner */}
        <div className={`p-4 rounded-xl transition-all ${
          online 
            ? "bg-gradient-to-r from-success/20 to-primary/20 border border-success/30" 
            : "bg-secondary/30 border border-border/50"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`relative ${online ? "animate-pulse" : ""}`}>
              <Navigation className={`h-6 w-6 ${online ? "text-success" : "text-muted-foreground"}`} />
              {online && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-background" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {online ? "You're visible to senders!" : "Go online to receive requests"}
              </p>
              <p className="text-xs text-muted-foreground">
                {online 
                  ? "Senders can see your journey and send requests" 
                  : "Turn on to start accepting parcel delivery requests"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Current Journey (if active) */}
        {currentJourney && online && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Route className="h-4 w-4 text-primary" />
                Active Journey
              </h4>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                In Progress
              </Badge>
            </div>
            
            <div 
              className="p-4 rounded-xl bg-secondary/30 border border-border/50 cursor-pointer hover:border-primary/30 transition-all"
              onClick={() => onViewJourney?.(currentJourney.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <MapPin className="h-4 w-4 text-success" />
                  <span className="font-medium">{currentJourney.source}</span>
                </div>
                <div className="flex-1 border-t border-dashed border-border" />
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="font-medium">{currentJourney.destination}</span>
                  <MapPin className="h-4 w-4 text-destructive" />
                </div>
              </div>
              
              <Progress value={currentJourney.progress} className="h-2 mb-3" />
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {currentJourney.parcelsCount} parcels
                </span>
                <span className="text-success font-medium">
                  ₹{currentJourney.earnings.toLocaleString()}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <p className="text-2xl font-bold text-primary">₹{stats.todayEarnings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{stats.todayParcels} deliveries</p>
          </div>
          
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">This Week</span>
            </div>
            <p className="text-2xl font-bold text-success">₹{stats.weeklyEarnings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Star className="h-3 w-3 text-primary" />
              {stats.rating} rating
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        {!online && (
          <Button 
            variant="hero" 
            className="w-full"
            onClick={() => handleToggle(true)}
          >
            <Power className="h-4 w-4 mr-2" />
            Go Online Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TravelerStatusCard;