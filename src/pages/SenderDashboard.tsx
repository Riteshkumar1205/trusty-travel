import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, Users, LayoutDashboard, Plus, ArrowLeft, 
  Shield, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import ParticleBackground from "@/components/ParticleBackground";
import ParcelPostForm from "@/components/dashboard/ParcelPostForm";
import TravelerMatching from "@/components/dashboard/TravelerMatching";
import SenderStats from "@/components/dashboard/SenderStats";
import ActiveParcels from "@/components/dashboard/ActiveParcels";
import LanguageSelector from "@/components/LanguageSelector";
import BottomNav from "@/components/layout/BottomNav";
import NotificationBell from "@/components/notifications/NotificationBell";

const SenderDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
                  <span className="text-gradient-gold">Sender</span> Dashboard
                  <Badge className="badge-review ml-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Smart Match
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Send with trust, track with ease
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector />
              <NotificationBell />
              <Button variant="ghost" size="icon" className="rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-primary-foreground">
                  U
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 backdrop-blur-sm border border-border/50 p-1 rounded-2xl">
            <TabsTrigger 
              value="overview" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="post" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Parcel
            </TabsTrigger>
            <TabsTrigger 
              value="parcels" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md"
            >
              <Package className="h-4 w-4 mr-2" />
              My Parcels
            </TabsTrigger>
            <TabsTrigger 
              value="matching" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md"
            >
              <Users className="h-4 w-4 mr-2" />
              Find Saarthis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent/20 via-primary/20 to-success/20 p-6 border border-border/30">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Welcome back! 👋
                    </h2>
                    <p className="text-muted-foreground max-w-lg">
                      Your parcels are traveling safely. Track them in real-time and connect with verified Saarthis.
                    </p>
                  </div>
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setActiveTab("post")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post New Parcel
                  </Button>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span>2 parcels in transit</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>All travelers verified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats + Active Parcels */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <SenderStats />
              </div>
              <div className="lg:col-span-2">
                <ActiveParcels />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="post" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <ParcelPostForm />
              <TravelerMatching />
            </div>
          </TabsContent>

          <TabsContent value="parcels" className="space-y-6">
            <ActiveParcels />
          </TabsContent>

          <TabsContent value="matching" className="space-y-6">
            <TravelerMatching />
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default SenderDashboard;
