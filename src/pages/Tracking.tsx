import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Navigation, Package, Train, Bus } from "lucide-react";
import { Link } from "react-router-dom";
import ParticleBackground from "@/components/ParticleBackground";
import RealTimeMap from "@/components/tracking/RealTimeMap";
import TransportTracker from "@/components/tracking/TransportTracker";
import LanguageSelector from "@/components/LanguageSelector";
import BottomNav from "@/components/layout/BottomNav";

const Tracking = () => {
  const [activeTab, setActiveTab] = useState("parcel");

  return (
    <div className="min-h-screen relative pb-20 md:pb-0">
      <ParticleBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-gradient-gold">Live</span> Tracking
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time parcel & transport tracking
                </p>
              </div>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 backdrop-blur-sm border border-border/50 p-1 rounded-2xl grid grid-cols-3">
            <TabsTrigger 
              value="parcel" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md gap-2"
            >
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">My Parcel</span>
            </TabsTrigger>
            <TabsTrigger 
              value="train" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md gap-2"
            >
              <Train className="h-4 w-4" />
              <span className="hidden sm:inline">Train</span>
            </TabsTrigger>
            <TabsTrigger 
              value="bus" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md gap-2"
            >
              <Bus className="h-4 w-4" />
              <span className="hidden sm:inline">Bus</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parcel" className="space-y-6">
            {/* Live Map */}
            <RealTimeMap showControls={true} />

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2 rounded-2xl"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "Live Parcel Tracking",
                      text: "Track my parcel in real-time on SAARTHI",
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    import("sonner").then(({ toast }) => toast.success("Link copied to clipboard!"));
                  }
                }}
              >
                <Navigation className="h-6 w-6 text-accent" />
                <span className="text-sm">Share Location</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2 rounded-2xl"
                onClick={() => import("sonner").then(({ toast }) => toast.info("Delivery history coming soon!"))}
              >
                <Package className="h-6 w-6 text-primary" />
                <span className="text-sm">Delivery History</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="train" className="space-y-6">
            <TransportTracker />
          </TabsContent>

          <TabsContent value="bus" className="space-y-6">
            <TransportTracker />
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Tracking;
