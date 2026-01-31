import { useState } from "react";
import { 
  Plus, 
  Route, 
  Package, 
  Bell, 
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Home,
  User,
  Shield,
  MapPinned,
  Sliders,
  Wallet,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import TravelerStats from "@/components/dashboard/TravelerStats";
import TravelerStatusCard from "@/components/dashboard/TravelerStatusCard";
import TravelerPreferences from "@/components/dashboard/TravelerPreferences";
import EarningsBreakdown from "@/components/dashboard/EarningsBreakdown";
import JourneyPostForm from "@/components/dashboard/JourneyPostForm";
import ActiveJourneys, { Journey } from "@/components/dashboard/ActiveJourneys";
import ParcelManagement, { Parcel } from "@/components/dashboard/ParcelManagement";
import LiveTrackingMap from "@/components/dashboard/LiveTrackingMap";
import LanguageSelector from "@/components/LanguageSelector";
import BottomNav from "@/components/layout/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useTravelerData } from "@/hooks/useTravelerData";

// Enhanced stats for demo
const defaultStats = {
  totalEarnings: 24500,
  thisMonthEarnings: 8750,
  thisWeekEarnings: 2400,
  todayEarnings: 650,
  totalJourneys: 28,
  totalParcels: 67,
  trustScore: 4.8,
  successRate: 98.5,
  pendingPayout: 3200,
};

// Simulated journeys with richer data
const mockJourneys: Journey[] = [
  {
    id: "1",
    source: "New Delhi",
    destination: "Patna",
    date: "2026-02-01",
    time: "06:30",
    transportMode: "train",
    availableCapacity: 10,
    usedCapacity: 7,
    parcelsCount: 3,
    status: "upcoming",
    earnings: 1250,
  },
  {
    id: "2",
    source: "Mumbai",
    destination: "Pune",
    date: "2026-01-28",
    time: "14:00",
    transportMode: "car",
    availableCapacity: 5,
    usedCapacity: 5,
    parcelsCount: 2,
    status: "in-transit",
    earnings: 450,
  },
  {
    id: "3",
    source: "Bangalore",
    destination: "Chennai",
    date: "2026-01-25",
    time: "10:15",
    transportMode: "flight",
    availableCapacity: 8,
    usedCapacity: 6,
    parcelsCount: 2,
    status: "completed",
    earnings: 1800,
  },
  {
    id: "4",
    source: "Hyderabad",
    destination: "Vizag",
    date: "2026-02-05",
    time: "08:00",
    transportMode: "train",
    availableCapacity: 12,
    usedCapacity: 0,
    parcelsCount: 0,
    status: "upcoming",
    earnings: 0,
  },
];

const mockParcels: Parcel[] = [
  {
    id: "p1",
    journeyId: "1",
    sender: { name: "Rahul Kumar", rating: 4.8, verified: true },
    receiver: { name: "Priya Singh", location: "Gandhi Maidan, Patna" },
    category: "Documents",
    weight: 2,
    price: 350,
    status: "pending-pickup",
    pickupOtp: "4521",
    confidentiality: "high",
    insurance: true,
  },
  {
    id: "p2",
    journeyId: "1",
    sender: { name: "Amit Sharma", rating: 4.5, verified: true },
    receiver: { name: "Vikash Das", location: "Boring Road, Patna" },
    category: "Electronics",
    weight: 3,
    price: 520,
    status: "pending-pickup",
    pickupOtp: "7834",
    confidentiality: "medium",
    insurance: true,
  },
  {
    id: "p3",
    journeyId: "2",
    sender: { name: "Sneha Patil", rating: 4.9, verified: true },
    receiver: { name: "Rohan Deshmukh", location: "FC Road, Pune" },
    category: "Clothing",
    weight: 2.5,
    price: 220,
    status: "in-transit",
    deliveryOtp: "9012",
    confidentiality: "low",
    insurance: false,
  },
];

const TravelerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, isLoading: authLoading, signOut } = useAuth({ requireAuth: true });
  const { stats, journeys, parcels, transactions, isLoading: dataLoading } = useTravelerData();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showPostForm, setShowPostForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Show loading state while checking auth or loading data
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Use real data or defaults
  const displayStats = stats || defaultStats;
  // Convert journeys with proper type casting for transportMode
  const displayJourneys: Journey[] = journeys.length > 0 
    ? journeys.map(j => ({
        id: j.id,
        source: j.source,
        destination: j.destination,
        date: j.date,
        time: j.time,
        transportMode: j.transportMode as "bike" | "bus" | "car" | "flight" | "train" | "truck",
        availableCapacity: j.availableCapacity,
        usedCapacity: j.usedCapacity,
        parcelsCount: j.parcelsCount,
        status: j.status,
        earnings: j.earnings,
      }))
    : mockJourneys;
    
  const displayParcels: Parcel[] = parcels.length > 0
    ? parcels.map(p => ({
        id: p.id,
        journeyId: p.journeyId,
        sender: p.sender,
        receiver: p.receiver,
        category: p.category,
        weight: p.weight,
        price: p.price,
        status: p.status,
        pickupOtp: p.pickupOtp,
        deliveryOtp: p.deliveryOtp,
        confidentiality: p.confidentiality,
        insurance: p.insurance,
      }))
    : mockParcels;

  // Get user display info
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Traveler";
  const userInitial = userName[0]?.toUpperCase() || "T";

  const handleJourneySubmit = (data: any) => {
    console.log("Journey posted:", data);
    setShowPostForm(false);
  };

  const handleViewDetails = (id: string) => {
    console.log("View journey:", id);
  };

  const handleCancelJourney = (id: string) => {
    console.log("Cancel journey:", id);
  };

  const handleConfirmPickup = (parcelId: string, otp: string) => {
    console.log("Confirm pickup:", parcelId, otp);
  };

  const handleConfirmDelivery = (parcelId: string, otp: string) => {
    console.log("Confirm delivery:", parcelId, otp);
  };

  const handleMessageSender = (parcelId: string) => {
    console.log("Message sender:", parcelId);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Premium Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-xl">स</span>
              </div>
              <div>
                <span className="font-bold text-lg text-foreground">SAARTHI</span>
                <span className="text-xs text-muted-foreground block -mt-1">Traveler</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Button 
                variant={activeTab === "overview" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab("overview")}
              >
                <Home className="w-4 h-4 mr-2" />
                {t("nav.overview")}
              </Button>
              <Button 
                variant={activeTab === "journeys" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab("journeys")}
              >
                <Route className="w-4 h-4 mr-2" />
                {t("nav.journeys")}
              </Button>
              <Button 
                variant={activeTab === "parcels" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab("parcels")}
              >
                <Package className="w-4 h-4 mr-2" />
                {t("nav.parcels")}
              </Button>
              <Button 
                variant={activeTab === "tracking" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab("tracking")}
              >
                <MapPinned className="w-4 h-4 mr-2" />
                {t("tracking.liveLocation")}
              </Button>
              <Button 
                variant={activeTab === "preferences" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab("preferences")}
              >
                <Sliders className="w-4 h-4 mr-2" />
                Preferences
              </Button>
              <Button 
                variant={activeTab === "earnings" ? "secondary" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab("earnings")}
              >
                <Wallet className="w-4 h-4 mr-2" />
                Earnings
              </Button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <LanguageSelector />
              
              <Button variant="hero" size="sm" className="gap-2 rounded-xl shadow-lg" onClick={() => setShowPostForm(true)}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t("nav.postJourney")}</span>
              </Button>

              <Button variant="ghost" size="icon" className="relative rounded-xl">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 rounded-xl">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-primary-foreground">{userInitial}</span>
                    </div>
                    <span className="hidden md:inline text-sm">{userName}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-border">
                    <div className="font-medium">{userName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="w-3 h-3 text-primary" />
                      {t("dashboard.verifiedSaarthi")}
                    </div>
                  </div>
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    {t("nav.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    {t("nav.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={signOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("nav.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/50">
              <div className="flex flex-col gap-2">
                <Button 
                  variant={activeTab === "overview" ? "secondary" : "ghost"} 
                  className="justify-start"
                  onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
                >
                  <Home className="w-4 h-4 mr-2" />
                  {t("nav.overview")}
                </Button>
                <Button 
                  variant={activeTab === "journeys" ? "secondary" : "ghost"} 
                  className="justify-start"
                  onClick={() => { setActiveTab("journeys"); setMobileMenuOpen(false); }}
                >
                  <Route className="w-4 h-4 mr-2" />
                  {t("nav.journeys")}
                </Button>
                <Button 
                  variant={activeTab === "parcels" ? "secondary" : "ghost"} 
                  className="justify-start"
                  onClick={() => { setActiveTab("parcels"); setMobileMenuOpen(false); }}
                >
                  <Package className="w-4 h-4 mr-2" />
                  {t("nav.parcels")}
                </Button>
                <Button 
                  variant={activeTab === "tracking" ? "secondary" : "ghost"} 
                  className="justify-start"
                  onClick={() => { setActiveTab("tracking"); setMobileMenuOpen(false); }}
                >
                  <MapPinned className="w-4 h-4 mr-2" />
                  {t("tracking.liveLocation")}
                </Button>
                <Button 
                  variant={activeTab === "preferences" ? "secondary" : "ghost"} 
                  className="justify-start"
                  onClick={() => { setActiveTab("preferences"); setMobileMenuOpen(false); }}
                >
                  <Sliders className="w-4 h-4 mr-2" />
                  Preferences
                </Button>
                <Button 
                  variant={activeTab === "earnings" ? "secondary" : "ghost"} 
                  className="justify-start"
                  onClick={() => { setActiveTab("earnings"); setMobileMenuOpen(false); }}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Earnings
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-8">
        {/* Post Journey Modal/Section */}
        {showPostForm && (
          <div className="mb-8">
            <div className="card-premium p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{t("nav.postJourney")}</h2>
                  <p className="text-sm text-muted-foreground">
                    Share your travel plans and earn by carrying parcels
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPostForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <JourneyPostForm onSubmit={handleJourneySubmit} />
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="hidden">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="journeys">Journeys</TabsTrigger>
            <TabsTrigger value="parcels">Parcels</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Traveler Status Card - Rapido Style */}
            <section>
              <TravelerStatusCard
                isOnline={isOnline}
                currentJourney={displayJourneys.find(j => j.status === "in-transit") ? {
                  id: displayJourneys.find(j => j.status === "in-transit")!.id,
                  source: displayJourneys.find(j => j.status === "in-transit")!.source,
                  destination: displayJourneys.find(j => j.status === "in-transit")!.destination,
                  departureTime: displayJourneys.find(j => j.status === "in-transit")!.time,
                  progress: 62,
                  parcelsCount: displayJourneys.find(j => j.status === "in-transit")!.parcelsCount,
                  earnings: displayJourneys.find(j => j.status === "in-transit")!.earnings
                } : null}
                stats={{
                  todayEarnings: displayStats.todayEarnings,
                  todayParcels: displayStats.totalParcels,
                  weeklyEarnings: displayStats.thisWeekEarnings,
                  rating: displayStats.trustScore
                }}
                onToggleOnline={setIsOnline}
                onViewJourney={handleViewDetails}
              />
            </section>

            {/* Stats */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.yourStats")}</h2>
              <TravelerStats stats={{
                totalEarnings: displayStats.totalEarnings,
                thisMonthEarnings: displayStats.thisMonthEarnings,
                totalJourneys: displayStats.totalJourneys,
                totalParcels: displayStats.totalParcels,
                trustScore: displayStats.trustScore,
                successRate: displayStats.successRate,
              }} />
            </section>

            {/* Live Tracking Preview */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">{t("tracking.liveLocation")}</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("tracking")}>
                  {t("dashboard.viewAll")}
                </Button>
              </div>
              <LiveTrackingMap 
                partnerLocation={{ lat: 28.5, lng: 77.1 }}
                destinationLocation={{ lat: 25.6, lng: 85.1 }}
              />
            </section>

            {/* Recent Journeys */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">{t("dashboard.activeJourneys")}</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("journeys")}>
                  {t("dashboard.viewAll")}
                </Button>
              </div>
              <ActiveJourneys 
                journeys={displayJourneys.filter(j => j.status !== "completed").slice(0, 2)}
                onViewDetails={handleViewDetails}
                onCancelJourney={handleCancelJourney}
              />
            </section>

            {/* Pending Parcels */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">{t("dashboard.pendingActions")}</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("parcels")}>
                  {t("dashboard.viewAll")}
                </Button>
              </div>
              <ParcelManagement 
                parcels={displayParcels.filter(p => p.status === "pending-pickup").slice(0, 2)}
                onConfirmPickup={handleConfirmPickup}
                onConfirmDelivery={handleConfirmDelivery}
                onMessageSender={handleMessageSender}
              />
            </section>
          </TabsContent>

          <TabsContent value="journeys" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{t("nav.journeys")}</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your posted journeys and track parcels
                </p>
              </div>
              <Button variant="hero" onClick={() => setShowPostForm(true)}>
                <Plus className="w-4 h-4" />
                New Journey
              </Button>
            </div>
            <ActiveJourneys 
              journeys={displayJourneys}
              onViewDetails={handleViewDetails}
              onCancelJourney={handleCancelJourney}
            />
          </TabsContent>

          <TabsContent value="parcels" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t("nav.parcels")}</h2>
              <p className="text-sm text-muted-foreground">
                View and manage all parcels assigned to your journeys
              </p>
            </div>
            <ParcelManagement 
              parcels={displayParcels}
              onConfirmPickup={handleConfirmPickup}
              onConfirmDelivery={handleConfirmDelivery}
              onMessageSender={handleMessageSender}
            />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t("tracking.liveLocation")}</h2>
              <p className="text-sm text-muted-foreground">
                Real-time GPS tracking for your active journey
              </p>
            </div>
            <LiveTrackingMap 
              partnerLocation={{ lat: 28.5, lng: 77.1 }}
              destinationLocation={{ lat: 25.6, lng: 85.1 }}
              isLive={true}
            />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Delivery Preferences</h2>
              <p className="text-sm text-muted-foreground">
                Configure what types of parcels you can carry
              </p>
            </div>
            <div className="max-w-2xl">
              <TravelerPreferences 
                initialData={{
                  acceptedParcelTypes: ["documents", "electronics", "clothing", "general"],
                  maxParcelWeight: 10,
                  notes: "",
                  acceptUrgent: true
                }}
                onSave={(data) => console.log("Preferences saved:", data)}
              />
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Earnings & Payouts</h2>
              <p className="text-sm text-muted-foreground">
                Track your earnings, transaction history, and request payouts
              </p>
            </div>
            <EarningsBreakdown 
              totalEarnings={displayStats.totalEarnings}
              thisMonthEarnings={displayStats.thisMonthEarnings}
              pendingPayout={displayStats.pendingPayout}
              transactions={[]}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer Note */}
      <footer className="container-wide py-6 border-t border-border/50 hidden md:block">
        <p className="text-center text-xs text-muted-foreground italic">
          {t("trust.footerQuote")}
        </p>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default TravelerDashboard;
