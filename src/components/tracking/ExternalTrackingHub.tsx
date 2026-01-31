import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Train, Bus, Plane, Search, MapPin, Clock, RefreshCw,
  ArrowRight, Navigation, ExternalLink, Globe, Radio
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface TrackingLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const trackingServices: Record<string, TrackingLink[]> = {
  train: [
    {
      name: "Where is my Train",
      url: "https://whereismytrain.in",
      icon: <Train className="h-5 w-5" />,
      description: "Real-time train tracking with GPS",
      color: "bg-orange-500/20 text-orange-500",
    },
    {
      name: "IRCTC Rail Connect",
      url: "https://www.irctc.co.in",
      icon: <Train className="h-5 w-5" />,
      description: "Official Indian Railways booking & PNR",
      color: "bg-blue-500/20 text-blue-500",
    },
    {
      name: "RailYatri",
      url: "https://www.railyatri.in/live-train-status",
      icon: <Train className="h-5 w-5" />,
      description: "Live train status & platform info",
      color: "bg-green-500/20 text-green-500",
    },
    {
      name: "ConfirmTkt",
      url: "https://www.confirmtkt.com/train-running-status",
      icon: <Train className="h-5 w-5" />,
      description: "Train running status & predictions",
      color: "bg-purple-500/20 text-purple-500",
    },
  ],
  bus: [
    {
      name: "RedBus",
      url: "https://www.redbus.in/bus-tracking",
      icon: <Bus className="h-5 w-5" />,
      description: "Track your RedBus booking live",
      color: "bg-red-500/20 text-red-500",
    },
    {
      name: "AbhiBus",
      url: "https://www.abhibus.com",
      icon: <Bus className="h-5 w-5" />,
      description: "Live bus tracking across India",
      color: "bg-yellow-500/20 text-yellow-500",
    },
    {
      name: "MakeMyTrip Bus",
      url: "https://www.makemytrip.com/bus-tickets",
      icon: <Bus className="h-5 w-5" />,
      description: "MMT bus booking & tracking",
      color: "bg-blue-500/20 text-blue-500",
    },
    {
      name: "Paytm Bus",
      url: "https://paytm.com/bus-tickets",
      icon: <Bus className="h-5 w-5" />,
      description: "Paytm bus services",
      color: "bg-cyan-500/20 text-cyan-500",
    },
  ],
  flight: [
    {
      name: "FlightAware",
      url: "https://flightaware.com",
      icon: <Plane className="h-5 w-5" />,
      description: "Global flight tracking",
      color: "bg-sky-500/20 text-sky-500",
    },
    {
      name: "FlightRadar24",
      url: "https://www.flightradar24.com",
      icon: <Plane className="h-5 w-5" />,
      description: "Real-time flight tracker",
      color: "bg-amber-500/20 text-amber-500",
    },
    {
      name: "IndiGo Track",
      url: "https://www.goindigo.in/flight-status.html",
      icon: <Plane className="h-5 w-5" />,
      description: "IndiGo flight status",
      color: "bg-indigo-500/20 text-indigo-500",
    },
    {
      name: "Air India",
      url: "https://www.airindia.com/in/en/flight-status.html",
      icon: <Plane className="h-5 w-5" />,
      description: "Air India flight status",
      color: "bg-orange-500/20 text-orange-500",
    },
  ],
};

interface TrackingStatus {
  type: "train" | "bus" | "flight";
  identifier: string;
  name: string;
  source: string;
  destination: string;
  currentLocation: string;
  status: "on-time" | "delayed" | "early" | "cancelled";
  delay: number;
  eta: string;
  progress: number;
  lastUpdated: string;
  isMock?: boolean;
}

const ExternalTrackingHub = () => {
  const [activeTab, setActiveTab] = useState("train");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingStatus | null>(null);
  const [_isLiveData, setIsLiveData] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Call edge function for transport tracking
      const { data, error } = await supabase.functions.invoke('transport-tracking', {
        body: { type: activeTab, identifier: searchQuery }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const apiData = data.data;
        setIsLiveData(!apiData.isMock);
        
        // Map API response to TrackingStatus
        const result: TrackingStatus = {
          type: activeTab as "train" | "bus" | "flight",
          identifier: apiData.pnr || apiData.bookingId || apiData.flightNumber || searchQuery,
          name: apiData.trainName || apiData.operatorName || apiData.airline || "Unknown",
          source: apiData.source || "",
          destination: apiData.destination || "",
          currentLocation: apiData.currentStation || apiData.currentLocation || apiData.altitude || "In Transit",
          status: apiData.delay > 0 ? "delayed" : "on-time",
          delay: apiData.delay || 0,
          eta: apiData.arrivalTime || "",
          progress: activeTab === "train" ? 65 : activeTab === "bus" ? 42 : 78,
          lastUpdated: new Date(apiData.lastUpdated).toLocaleTimeString(),
          isMock: apiData.isMock,
        };
        
        setTrackingResult(result);
        
        if (apiData.isMock) {
          toast.info("Showing demo data. Add API keys for live tracking.", {
            description: "Contact support to configure live APIs"
          });
        }
      }
    } catch (error) {
      console.error("Tracking error:", error);
      toast.error("Failed to fetch tracking data");
      
      // Fallback to mock data on error
      const mockResults: Record<string, TrackingStatus> = {
        train: {
          type: "train",
          identifier: searchQuery,
          name: "Mumbai Rajdhani Express",
          source: "New Delhi",
          destination: "Mumbai CST",
          currentLocation: "Bhopal Junction",
          status: "delayed",
          delay: 15,
          eta: "08:50",
          progress: 65,
          lastUpdated: new Date().toLocaleTimeString(),
          isMock: true,
        },
        bus: {
          type: "bus",
          identifier: searchQuery,
          name: "RedBus Volvo AC",
          source: "Delhi ISBT",
          destination: "Jaipur",
          currentLocation: "Near Manesar Toll Plaza",
          status: "on-time",
          delay: 0,
          eta: "14:30",
          progress: 42,
          lastUpdated: new Date().toLocaleTimeString(),
          isMock: true,
        },
        flight: {
          type: "flight",
          identifier: searchQuery,
          name: "IndiGo Airlines",
          source: "Delhi (DEL)",
          destination: "Mumbai (BOM)",
          currentLocation: "In Air - 35,000 ft",
          status: "on-time",
          delay: 0,
          eta: "12:45",
          progress: 78,
          lastUpdated: new Date().toLocaleTimeString(),
          isMock: true,
        },
      };
      setTrackingResult(mockResults[activeTab]);
      setIsLiveData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const openExternalTracker = (url: string, query?: string) => {
    const finalUrl = query ? `${url}?q=${encodeURIComponent(query)}` : url;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-time": return "bg-success/20 text-success";
      case "delayed": return "bg-destructive/20 text-destructive";
      case "early": return "bg-primary/20 text-primary";
      case "cancelled": return "bg-destructive/30 text-destructive";
      default: return "bg-muted/20 text-muted-foreground";
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "train": return <Train className="h-4 w-4" />;
      case "bus": return <Bus className="h-4 w-4" />;
      case "flight": return <Plane className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Tracking Card */}
      <Card className="card-glass border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 rounded-xl bg-primary/20">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            Live Transport Tracking Hub
            <Badge variant="outline" className="ml-auto text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Multi-Platform
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 bg-secondary/50 mb-4">
              <TabsTrigger value="train" className="gap-2">
                <Train className="h-4 w-4" />
                <span className="hidden sm:inline">Train</span>
              </TabsTrigger>
              <TabsTrigger value="bus" className="gap-2">
                <Bus className="h-4 w-4" />
                <span className="hidden sm:inline">Bus</span>
              </TabsTrigger>
              <TabsTrigger value="flight" className="gap-2">
                <Plane className="h-4 w-4" />
                <span className="hidden sm:inline">Flight</span>
              </TabsTrigger>
            </TabsList>

            {["train", "bus", "flight"].map((tabType) => (
              <TabsContent key={tabType} value={tabType} className="space-y-4">
                {/* Search Input */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    {getTabIcon(tabType) && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {getTabIcon(tabType)}
                      </div>
                    )}
                    <Input
                      placeholder={
                        tabType === "train" 
                          ? "Enter Train Number or PNR (e.g., 12951)" 
                          : tabType === "bus"
                          ? "Enter Booking ID or Bus Number"
                          : "Enter Flight Number (e.g., 6E-2341)"
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10 bg-secondary/50"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isLoading} className="bg-primary">
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Tracking Result */}
                {trackingResult && trackingResult.type === tabType && (
                  <div className="p-4 rounded-2xl bg-secondary/30 border border-border/30 animate-fade-in">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{trackingResult.name}</h3>
                          {trackingResult.isMock ? (
                            <Badge variant="outline" className="text-xs bg-muted/30">
                              Demo Data
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-success/20 text-success border-success/30">
                              <Radio className="h-3 w-3 mr-1 animate-pulse" />
                              Live
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {tabType === "train" ? "Train" : tabType === "bus" ? "Bus" : "Flight"} #{trackingResult.identifier}
                        </p>
                      </div>
                      <Badge className={getStatusColor(trackingResult.status)}>
                        {trackingResult.delay > 0 ? `+${trackingResult.delay} min` : "On Time"}
                      </Badge>
                    </div>

                    {/* Route Info */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 mb-4">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-success" />
                          {trackingResult.source}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 text-right">
                        <p className="text-xs text-muted-foreground">To</p>
                        <p className="font-semibold">{trackingResult.destination}</p>
                      </div>
                    </div>

                    {/* Current Location */}
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Current Location</p>
                      <p className="font-medium flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-primary animate-pulse" />
                        {trackingResult.currentLocation}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Journey Progress</span>
                        <span>{trackingResult.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-primary to-gold transition-all duration-500"
                          style={{ width: `${trackingResult.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        ETA: <strong className="text-foreground">{trackingResult.eta}</strong>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Updated {trackingResult.lastUpdated}
                      </span>
                    </div>
                  </div>
                )}

                {/* External Tracking Services */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open in External Tracker
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {trackingServices[tabType]?.map((service) => (
                      <Button
                        key={service.name}
                        variant="outline"
                        className="h-auto py-3 px-4 flex flex-col items-start gap-2 hover:border-primary/50 transition-all"
                        onClick={() => openExternalTracker(service.url, searchQuery)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className={`p-1.5 rounded-lg ${service.color}`}>
                            {service.icon}
                          </div>
                          <span className="font-medium text-sm">{service.name}</span>
                          <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground text-left">
                          {service.description}
                        </p>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Empty State */}
                {!trackingResult && !isLoading && (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="flex justify-center mb-3">
                      {getTabIcon(tabType) && (
                        <div className="p-4 rounded-full bg-secondary/50">
                          {tabType === "train" && <Train className="h-8 w-8" />}
                          {tabType === "bus" && <Bus className="h-8 w-8" />}
                          {tabType === "flight" && <Plane className="h-8 w-8" />}
                        </div>
                      )}
                    </div>
                    <p>
                      Enter a {tabType === "train" ? "train number or PNR" : tabType === "bus" ? "booking ID" : "flight number"} to track
                    </p>
                    <p className="text-xs mt-1">
                      Or use the external trackers below
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card 
          className="card-glass cursor-pointer hover:border-orange-500/50 transition-all group"
          onClick={() => openExternalTracker("https://whereismytrain.in")}
        >
          <CardContent className="p-4 text-center">
            <div className="p-3 rounded-xl bg-orange-500/20 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Train className="h-6 w-6 text-orange-500" />
            </div>
            <p className="font-medium text-sm">Where is my Train</p>
            <p className="text-xs text-muted-foreground">Live GPS Tracking</p>
          </CardContent>
        </Card>

        <Card 
          className="card-glass cursor-pointer hover:border-red-500/50 transition-all group"
          onClick={() => openExternalTracker("https://www.redbus.in/bus-tracking")}
        >
          <CardContent className="p-4 text-center">
            <div className="p-3 rounded-xl bg-red-500/20 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Bus className="h-6 w-6 text-red-500" />
            </div>
            <p className="font-medium text-sm">RedBus Track</p>
            <p className="text-xs text-muted-foreground">Bus Live Status</p>
          </CardContent>
        </Card>

        <Card 
          className="card-glass cursor-pointer hover:border-sky-500/50 transition-all group"
          onClick={() => openExternalTracker("https://www.flightradar24.com")}
        >
          <CardContent className="p-4 text-center">
            <div className="p-3 rounded-xl bg-sky-500/20 w-fit mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Plane className="h-6 w-6 text-sky-500" />
            </div>
            <p className="font-medium text-sm">FlightRadar24</p>
            <p className="text-xs text-muted-foreground">Real-time Flights</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExternalTrackingHub;
