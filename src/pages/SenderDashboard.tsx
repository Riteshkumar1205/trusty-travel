import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Package, Users, LayoutDashboard, Plus, ArrowLeft, 
  Shield, Sparkles, Loader2, TrendingUp, Clock, 
  CheckCircle2, MapPin, ArrowRight, Star, Zap,
  IndianRupee, Calendar
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
import { useAuth } from "@/hooks/useAuth";

// Simulated live activity data
const liveActivity = [
  { id: 1, type: "pickup", message: "Parcel picked up in Delhi", time: "2 min ago", icon: Package },
  { id: 2, type: "transit", message: "Saarthi en route to Mumbai", time: "15 min ago", icon: MapPin },
  { id: 3, type: "delivered", message: "Delivered in Bangalore", time: "1 hour ago", icon: CheckCircle2 },
];

const quickStats = [
  { label: "Active Deliveries", value: "3", icon: Package, color: "text-accent" },
  { label: "In Transit", value: "2", icon: MapPin, color: "text-primary" },
  { label: "Avg Delivery Time", value: "18h", icon: Clock, color: "text-success" },
  { label: "Money Saved", value: "₹2.4K", icon: IndianRupee, color: "text-primary" },
];

const SenderDashboard = () => {
  const { user, isLoading, isAuthenticated, signOut } = useAuth({ requireAuth: true });
  const [activeTab, setActiveTab] = useState("overview");

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Get user display info
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const userInitial = userName[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen relative pb-20 md:pb-0">
      <ParticleBackground />
      
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10">
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
                  Welcome back, <span className="text-foreground font-medium">{userName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSelector />
              <NotificationBell />
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl" 
                onClick={signOut} 
                title="Logout"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
                  {userInitial}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 backdrop-blur-sm border border-border/50 p-1.5 rounded-2xl">
            <TabsTrigger 
              value="overview" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="post" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2"
            >
              <Plus className="h-4 w-4" />
              Post Parcel
            </TabsTrigger>
            <TabsTrigger 
              value="parcels" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2"
            >
              <Package className="h-4 w-4" />
              My Parcels
            </TabsTrigger>
            <TabsTrigger 
              value="matching" 
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg gap-2"
            >
              <Users className="h-4 w-4" />
              Find Saarthis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Premium Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-border/30">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-success/10" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
              <div className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="badge-trusted">
                        <Shield className="h-3 w-3 mr-1" />
                        All Saarthis Verified
                      </Badge>
                      <Badge variant="outline" className="border-accent/30 text-accent">
                        <Zap className="h-3 w-3 mr-1" />
                        Live Tracking
                      </Badge>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      Your parcels are in <span className="text-gradient-gold">trusted hands</span>
                    </h2>
                    <p className="text-muted-foreground max-w-lg">
                      Track every parcel in real-time. Connect with verified travelers and save up to 40% on delivery costs.
                    </p>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold h-12 px-6 rounded-xl shadow-lg"
                    onClick={() => setActiveTab("post")}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Post New Parcel
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <Card key={index} className="card-glass border-border/30 hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-muted/50 ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Stats Column */}
              <div className="lg:col-span-1 space-y-6">
                <SenderStats />
                
                {/* Live Activity Feed */}
                <Card className="card-premium">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        Live Activity
                      </h3>
                      <Badge variant="outline" className="text-xs">Real-time</Badge>
                    </div>
                    <div className="space-y-3">
                      {liveActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-2 rounded-xl bg-muted/30">
                          <div className={`p-1.5 rounded-lg ${
                            activity.type === "delivered" ? "bg-success/20 text-success" :
                            activity.type === "pickup" ? "bg-accent/20 text-accent" :
                            "bg-primary/20 text-primary"
                          }`}>
                            <activity.icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Active Parcels */}
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
