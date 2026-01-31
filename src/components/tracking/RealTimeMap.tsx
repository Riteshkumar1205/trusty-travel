import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Navigation, Clock, Phone, MessageSquare, 
  Train, Plane, Car, Bike, Truck, RefreshCw, Shield,
  Locate, ZoomIn, ZoomOut
} from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  timestamp: Date;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

interface TrackingData {
  id: string;
  travelerName: string;
  travelerAvatar: string;
  transportMode: string;
  pnrNumber?: string;
  vehicleNumber?: string;
  source: { city: string; lat: number; lng: number };
  destination: { city: string; lat: number; lng: number };
  currentLocation: Location;
  estimatedArrival: string;
  distanceRemaining: number;
  journeyProgress: number;
  status: "on-time" | "delayed" | "early";
  lastUpdated: Date;
}

const transportIcons: Record<string, React.ReactNode> = {
  flight: <Plane className="h-4 w-4" />,
  train: <Train className="h-4 w-4" />,
  car: <Car className="h-4 w-4" />,
  bike: <Bike className="h-4 w-4" />,
  truck: <Truck className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  "on-time": "bg-success/20 text-success border-success/30",
  "delayed": "bg-destructive/20 text-destructive border-destructive/30",
  "early": "bg-accent/20 text-accent border-accent/30",
};

// Simulated tracking data
const mockTrackingData: TrackingData = {
  id: "track-1",
  travelerName: "Rahul Sharma",
  travelerAvatar: "RS",
  transportMode: "train",
  pnrNumber: "4521876309",
  source: { city: "Delhi", lat: 28.6139, lng: 77.2090 },
  destination: { city: "Mumbai", lat: 19.0760, lng: 72.8777 },
  currentLocation: {
    lat: 23.2599,
    lng: 77.4126,
    timestamp: new Date(),
    speed: 85,
    heading: 225,
  },
  estimatedArrival: "4h 32m",
  distanceRemaining: 782,
  journeyProgress: 62,
  status: "on-time",
  lastUpdated: new Date(),
};

interface RealTimeMapProps {
  deliveryId?: string;
  showControls?: boolean;
}

const RealTimeMap = ({ deliveryId, showControls = true }: RealTimeMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [tracking, setTracking] = useState<TrackingData>(mockTrackingData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [zoom, setZoom] = useState(6);
  const [mapCenter, setMapCenter] = useState({ lat: 23.5, lng: 78.5 });

  // Simulate real-time location updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTracking((prev) => {
        const newProgress = Math.min(prev.journeyProgress + 0.1, 100);
        const progressRatio = newProgress / 100;
        
        // Interpolate position along the route
        const newLat = prev.source.lat + (prev.destination.lat - prev.source.lat) * progressRatio;
        const newLng = prev.source.lng + (prev.destination.lng - prev.source.lng) * progressRatio;
        
        return {
          ...prev,
          journeyProgress: newProgress,
          distanceRemaining: Math.max(0, prev.distanceRemaining - 0.5),
          currentLocation: {
            ...prev.currentLocation,
            lat: newLat,
            lng: newLng,
            timestamp: new Date(),
            speed: 80 + Math.random() * 20,
          },
          lastUpdated: new Date(),
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getPositionOnMap = (lat: number, lng: number) => {
    // Convert lat/lng to map position (simplified for India map)
    const minLat = 8, maxLat = 35;
    const minLng = 68, maxLng = 97;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const sourcePos = getPositionOnMap(tracking.source.lat, tracking.source.lng);
  const destPos = getPositionOnMap(tracking.destination.lat, tracking.destination.lng);
  const currentPos = getPositionOnMap(tracking.currentLocation.lat, tracking.currentLocation.lng);

  return (
    <Card className="card-glass border-border/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 rounded-xl bg-accent/20">
              <Navigation className="h-5 w-5 text-accent" />
            </div>
            Live Tracking
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[tracking.status]}>
              {tracking.status.replace("-", " ")}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Map Container */}
        <div 
          ref={mapContainerRef}
          className="relative h-[300px] bg-gradient-to-br from-secondary/50 to-background overflow-hidden"
        >
          {/* India Map Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Grid lines */}
              {[...Array(10)].map((_, i) => (
                <g key={i}>
                  <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="currentColor" strokeWidth="0.2" />
                  <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="currentColor" strokeWidth="0.2" />
                </g>
              ))}
            </svg>
          </div>

          {/* Route Line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Full route path */}
            <line
              x1={`${sourcePos.x}%`}
              y1={`${sourcePos.y}%`}
              x2={`${destPos.x}%`}
              y2={`${destPos.y}%`}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
            {/* Completed route */}
            <line
              x1={`${sourcePos.x}%`}
              y1={`${sourcePos.y}%`}
              x2={`${currentPos.x}%`}
              y2={`${currentPos.y}%`}
              stroke="hsl(var(--accent))"
              strokeWidth="1"
            />
          </svg>

          {/* Source Marker */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${sourcePos.x}%`, top: `${sourcePos.y}%` }}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-lg">
                <MapPin className="h-4 w-4 text-success-foreground" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-background/80 px-2 py-0.5 rounded">
                {tracking.source.city}
              </div>
            </div>
          </div>

          {/* Destination Marker */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${destPos.x}%`, top: `${destPos.y}%` }}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center shadow-lg">
                <MapPin className="h-4 w-4 text-destructive-foreground" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-background/80 px-2 py-0.5 rounded">
                {tracking.destination.city}
              </div>
            </div>
          </div>

          {/* Current Position Marker (Traveler) */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-1000 ease-linear"
            style={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
          >
            <div className="relative">
              {/* Pulse ring */}
              <div className="absolute inset-0 w-12 h-12 -m-2 rounded-full bg-accent/30 animate-ping" />
              <div className="absolute inset-0 w-10 h-10 -m-1 rounded-full bg-accent/20" />
              
              {/* Main marker */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-xl border-2 border-background">
                {transportIcons[tracking.transportMode]}
              </div>
              
              {/* Speed indicator */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                {Math.round(tracking.currentLocation.speed || 0)} km/h
              </div>
            </div>
          </div>

          {/* Map Controls */}
          {showControls && (
            <div className="absolute right-3 top-3 flex flex-col gap-1">
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80">
                <Locate className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Journey Progress Bar */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Journey Progress</span>
                <span className="font-mono text-accent">{tracking.journeyProgress.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-success via-accent to-primary transition-all duration-1000"
                  style={{ width: `${tracking.journeyProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Traveler Info Panel */}
        <div className="p-4 space-y-4">
          {/* Traveler Card */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                  {tracking.travelerAvatar}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-0.5">
                  <Shield className="h-3 w-3 text-success-foreground" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold">{tracking.travelerName}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {transportIcons[tracking.transportMode]}
                  <span className="capitalize">{tracking.transportMode}</span>
                  {tracking.pnrNumber && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-xs">PNR: {tracking.pnrNumber}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-secondary/20">
              <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold text-accent">{tracking.estimatedArrival}</p>
              <p className="text-xs text-muted-foreground">ETA</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/20">
              <MapPin className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{tracking.distanceRemaining.toFixed(0)} km</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/20">
              <Navigation className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{Math.round(tracking.currentLocation.speed || 0)}</p>
              <p className="text-xs text-muted-foreground">km/h</p>
            </div>
          </div>

          {/* Last Updated */}
          <p className="text-center text-xs text-muted-foreground">
            Last updated: {tracking.lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeMap;
