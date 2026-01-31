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
  Sliders
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
import JourneyPostForm from "@/components/dashboard/JourneyPostForm";
import ActiveJourneys, { Journey } from "@/components/dashboard/ActiveJourneys";
import ParcelManagement, { Parcel } from "@/components/dashboard/ParcelManagement";
import LiveTrackingMap from "@/components/dashboard/LiveTrackingMap";
import LanguageSelector from "@/components/LanguageSelector";
import BottomNav from "@/components/layout/BottomNav";

// Mock data
const mockStats = {
  totalEarnings: 24580,
  thisMonthEarnings: 4200,
  totalJourneys: 42,
  totalParcels: 78,
  trustScore: 4.9,
  successRate: 99.2,
};

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
    transportMode: "bus",
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
  const [activeTab, setActiveTab] = useState("overview");
  const [showPostForm, setShowPostForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

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
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">स</span>
              </div>
              <span className="font-semibold text-lg text-foreground">SAARTHI</span>
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
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <LanguageSelector />
              
              <Button variant="hero" size="sm" onClick={() => setShowPostForm(true)}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t("nav.postJourney")}</span>
              </Button>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="hidden md:inline text-sm">Arjun M.</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-border">
                    <div className="font-medium">Arjun Mehta</div>
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
                  <DropdownMenuItem className="text-destructive">
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
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Traveler Status Card - Rapido Style */}
            <section>
              <TravelerStatusCard
                isOnline={isOnline}
                currentJourney={mockJourneys.find(j => j.status === "in-transit") ? {
                  id: mockJourneys[1].id,
                  source: mockJourneys[1].source,
                  destination: mockJourneys[1].destination,
                  departureTime: mockJourneys[1].time,
                  progress: 62,
                  parcelsCount: mockJourneys[1].parcelsCount,
                  earnings: mockJourneys[1].earnings
                } : null}
                stats={{
                  todayEarnings: 1250,
                  todayParcels: 3,
                  weeklyEarnings: mockStats.thisMonthEarnings,
                  rating: mockStats.trustScore
                }}
                onToggleOnline={setIsOnline}
                onViewJourney={handleViewDetails}
              />
            </section>

            {/* Stats */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">{t("dashboard.yourStats")}</h2>
              <TravelerStats stats={mockStats} />
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
                journeys={mockJourneys.filter(j => j.status !== "completed").slice(0, 2)}
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
                parcels={mockParcels.filter(p => p.status === "pending-pickup").slice(0, 2)}
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
              journeys={mockJourneys}
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
              parcels={mockParcels}
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
