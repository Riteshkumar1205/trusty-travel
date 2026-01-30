import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, User, Package, Clock } from "lucide-react";

interface Location {
  lat: number;
  lng: number;
  label: string;
  type: "user" | "partner" | "destination";
}

interface LiveTrackingMapProps {
  userLocation?: { lat: number; lng: number };
  partnerLocation?: { lat: number; lng: number };
  destinationLocation?: { lat: number; lng: number };
  isLive?: boolean;
}

const LiveTrackingMap = ({ 
  userLocation,
  partnerLocation, 
  destinationLocation,
  isLive = true 
}: LiveTrackingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState(userLocation);
  const [currentPartnerLocation, setCurrentPartnerLocation] = useState(partnerLocation);
  const [distance, setDistance] = useState<string>("--");
  const [eta, setEta] = useState<string>("--");

  // Simulate GPS updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Simulate partner movement
      if (currentPartnerLocation && destinationLocation) {
        const newLat = currentPartnerLocation.lat + (destinationLocation.lat - currentPartnerLocation.lat) * 0.02;
        const newLng = currentPartnerLocation.lng + (destinationLocation.lng - currentPartnerLocation.lng) * 0.02;
        setCurrentPartnerLocation({ lat: newLat, lng: newLng });

        // Calculate distance (simplified)
        const dLat = destinationLocation.lat - newLat;
        const dLng = destinationLocation.lng - newLng;
        const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
        setDistance(`${distanceKm.toFixed(1)} km`);
        setEta(`${Math.ceil(distanceKm * 2)} min`);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive, currentPartnerLocation, destinationLocation]);

  // Get user's actual location
  useEffect(() => {
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Default to Delhi
          setCurrentUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  }, [userLocation]);

  return (
    <div className="card-glass overflow-hidden">
      {/* Map Container */}
      <div 
        ref={mapRef}
        className="relative h-64 md:h-80 bg-gradient-to-br from-secondary via-card to-secondary overflow-hidden"
      >
        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Route Line */}
        {currentPartnerLocation && destinationLocation && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <line
              x1="30%"
              y1="60%"
              x2="70%"
              y2="40%"
              stroke="url(#routeGradient)"
              strokeWidth="3"
              strokeDasharray="8 4"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Partner Location Marker */}
        {currentPartnerLocation && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
            style={{ left: "30%", top: "60%" }}
          >
            <div className="relative">
              <div className="absolute inset-0 w-12 h-12 bg-primary/30 rounded-full animate-ping" />
              <div className="relative w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-card px-2 py-1 rounded-full border border-border">
                Saarthi
              </div>
            </div>
          </div>
        )}

        {/* User Location Marker */}
        {currentUserLocation && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: "50%", top: "70%" }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-electric rounded-full flex items-center justify-center shadow-lg shadow-electric/30">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-card px-2 py-1 rounded-full border border-border">
                You
              </div>
            </div>
          </div>
        )}

        {/* Destination Marker */}
        {destinationLocation && (
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: "70%", top: "40%" }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center shadow-lg shadow-success/30">
                <MapPin className="w-4 h-4 text-success-foreground" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-card px-2 py-1 rounded-full border border-border">
                Destination
              </div>
            </div>
          </div>
        )}

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-xs font-medium text-foreground">LIVE</span>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="p-4 bg-card/50 border-t border-border/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Navigation className="w-3.5 h-3.5" />
              <span className="text-xs">Distance</span>
            </div>
            <div className="font-mono text-lg font-semibold text-foreground">{distance}</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">ETA</span>
            </div>
            <div className="font-mono text-lg font-semibold text-primary">{eta}</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">Status</span>
            </div>
            <div className="text-sm font-medium text-success">On Route</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
