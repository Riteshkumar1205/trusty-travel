import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Train, Bus, Search, MapPin, Clock, RefreshCw,
  CheckCircle2, AlertCircle, ArrowRight, Navigation
} from "lucide-react";

interface TrainStatus {
  trainNumber: string;
  trainName: string;
  currentStation: string;
  nextStation: string;
  delay: number;
  lastUpdated: string;
  expectedArrival: string;
  status: "on-time" | "delayed" | "early";
  route: Array<{
    station: string;
    scheduledArrival: string;
    actualArrival?: string;
    status: "departed" | "upcoming" | "current";
  }>;
}

interface BusStatus {
  busNumber: string;
  operator: string;
  source: string;
  destination: string;
  currentLocation: string;
  delay: number;
  expectedArrival: string;
  status: "on-time" | "delayed";
  amenities: string[];
}

// Mock train data
const mockTrainData: TrainStatus = {
  trainNumber: "12951",
  trainName: "Mumbai Rajdhani Express",
  currentStation: "Bhopal Jn",
  nextStation: "Itarsi Jn",
  delay: 15,
  lastUpdated: "2 min ago",
  expectedArrival: "22:45",
  status: "delayed",
  route: [
    { station: "New Delhi", scheduledArrival: "16:55", actualArrival: "16:55", status: "departed" },
    { station: "Mathura Jn", scheduledArrival: "18:35", actualArrival: "18:42", status: "departed" },
    { station: "Agra Cantt", scheduledArrival: "19:15", actualArrival: "19:28", status: "departed" },
    { station: "Gwalior", scheduledArrival: "20:05", actualArrival: "20:18", status: "departed" },
    { station: "Jhansi Jn", scheduledArrival: "21:05", actualArrival: "21:20", status: "departed" },
    { station: "Bhopal Jn", scheduledArrival: "00:35", actualArrival: "00:50", status: "current" },
    { station: "Itarsi Jn", scheduledArrival: "02:15", status: "upcoming" },
    { station: "Nagpur", scheduledArrival: "05:35", status: "upcoming" },
    { station: "Mumbai CST", scheduledArrival: "08:35", status: "upcoming" },
  ],
};

// Mock bus data
const mockBusData: BusStatus[] = [
  {
    busNumber: "RB-2847",
    operator: "RedBus",
    source: "Delhi ISBT",
    destination: "Jaipur",
    currentLocation: "Near Manesar Toll",
    delay: 0,
    expectedArrival: "14:30",
    status: "on-time",
    amenities: ["AC", "WiFi", "Charging Point"],
  },
  {
    busNumber: "VRL-1923",
    operator: "VRL Travels",
    source: "Bangalore",
    destination: "Hyderabad",
    currentLocation: "Anantapur",
    delay: 25,
    expectedArrival: "18:45",
    status: "delayed",
    amenities: ["AC", "Sleeper", "Blanket"],
  },
];

const TransportTracker = () => {
  const [trainNumber, setTrainNumber] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [trainData, setTrainData] = useState<TrainStatus | null>(null);
  const [busData, setBusData] = useState<BusStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("train");

  const searchTrain = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTrainData(mockTrainData);
    setIsLoading(false);
  };

  const searchBus = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setBusData(mockBusData);
    setIsLoading(false);
  };

  // Auto-refresh train data
  useEffect(() => {
    if (!trainData) return;
    
    const interval = setInterval(() => {
      setTrainData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lastUpdated: "Just now",
          delay: prev.delay + (Math.random() > 0.7 ? 1 : 0),
        };
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [trainData]);

  return (
    <Card className="card-glass border-border/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 rounded-xl bg-primary/20">
            <Navigation className="h-5 w-5 text-primary" />
          </div>
          Live Transport Tracker
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 bg-secondary/50 mb-4">
            <TabsTrigger value="train" className="gap-2">
              <Train className="h-4 w-4" />
              Where's My Train
            </TabsTrigger>
            <TabsTrigger value="bus" className="gap-2">
              <Bus className="h-4 w-4" />
              Bus Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="train" className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Train className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Train Number (e.g., 12951)"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
              <Button onClick={searchTrain} disabled={isLoading} className="bg-primary">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Train Status Card */}
            {trainData && (
              <div className="space-y-4 animate-fade-in">
                {/* Header */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/30">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{trainData.trainName}</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        Train #{trainData.trainNumber}
                      </p>
                    </div>
                    <Badge 
                      className={
                        trainData.status === "delayed" 
                          ? "bg-destructive/20 text-destructive" 
                          : "bg-success/20 text-success"
                      }
                    >
                      {trainData.delay > 0 ? `+${trainData.delay} min` : "On Time"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Current Station</p>
                      <p className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-accent" />
                        {trainData.currentStation}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 text-right">
                      <p className="text-xs text-muted-foreground">Next Stop</p>
                      <p className="font-semibold">{trainData.nextStation}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ETA: <strong className="text-foreground">{trainData.expectedArrival}</strong>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Updated {trainData.lastUpdated}
                    </span>
                  </div>
                </div>

                {/* Route Timeline */}
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Route Timeline</h4>
                  <div className="space-y-0">
                    {trainData.route.map((stop, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {/* Timeline dot and line */}
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            stop.status === "departed" 
                              ? "bg-success border-success" 
                              : stop.status === "current"
                              ? "bg-accent border-accent animate-pulse"
                              : "bg-secondary border-muted-foreground/30"
                          }`}>
                            {stop.status === "departed" && <CheckCircle2 className="h-3 w-3 text-success-foreground" />}
                            {stop.status === "current" && <div className="w-2 h-2 rounded-full bg-accent-foreground" />}
                          </div>
                          {index < trainData.route.length - 1 && (
                            <div className={`w-0.5 h-8 ${
                              stop.status === "departed" ? "bg-success" : "bg-muted-foreground/20"
                            }`} />
                          )}
                        </div>

                        {/* Station info */}
                        <div className={`flex-1 pb-4 ${stop.status === "current" ? "font-medium" : ""}`}>
                          <div className="flex items-center justify-between">
                            <span className={stop.status === "upcoming" ? "text-muted-foreground" : ""}>
                              {stop.station}
                            </span>
                            <div className="text-right text-sm">
                              <span className={stop.actualArrival && stop.actualArrival !== stop.scheduledArrival ? "line-through text-muted-foreground mr-2" : ""}>
                                {stop.scheduledArrival}
                              </span>
                              {stop.actualArrival && stop.actualArrival !== stop.scheduledArrival && (
                                <span className="text-destructive">{stop.actualArrival}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!trainData && !isLoading && (
              <div className="text-center py-8">
                <Train className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  Enter a train number to track its live status
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bus" className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Bus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Booking ID or Bus Number"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  className="pl-10 bg-secondary/50"
                />
              </div>
              <Button onClick={searchBus} disabled={isLoading} className="bg-accent">
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Bus List */}
            {busData.length > 0 && (
              <div className="space-y-3">
                {busData.map((bus, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-2xl bg-secondary/30 border border-border/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-accent" />
                          <span className="font-semibold">{bus.operator}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          Bus #{bus.busNumber}
                        </p>
                      </div>
                      <Badge 
                        className={
                          bus.status === "delayed" 
                            ? "bg-destructive/20 text-destructive" 
                            : "bg-success/20 text-success"
                        }
                      >
                        {bus.delay > 0 ? `+${bus.delay} min` : "On Time"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-3">
                      <MapPin className="h-4 w-4 text-success" />
                      <span>{bus.source}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <MapPin className="h-4 w-4 text-destructive" />
                      <span>{bus.destination}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-background/50 mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Current Location</p>
                      <p className="font-medium flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-accent" />
                        {bus.currentLocation}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {bus.amenities.map((amenity, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm">
                        ETA: <strong className="text-accent">{bus.expectedArrival}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {busData.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Bus className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  Track RedBus, VRL, and other intercity bus services
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransportTracker;
