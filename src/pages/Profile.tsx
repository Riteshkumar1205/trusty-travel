import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, Mail, Phone, Shield, Star, Edit2, Camera,
  ArrowLeft, LogOut, CheckCircle2, Settings, Bell,
  Package, Navigation, Award, TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ParticleBackground from "@/components/ParticleBackground";
import BottomNav from "@/components/layout/BottomNav";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "Test User",
    phone: "+91 98765 43210",
    email: "",
    trustScore: 88,
    verificationStatus: "verified",
    totalDeliveries: 15,
    successRate: 98,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setProfile((prev) => ({ ...prev, email: session.user.email || "" }));
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setProfile((prev) => ({ ...prev, email: session.user.email || "" }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen relative pb-20 md:pb-0">
      <ParticleBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container-wide py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">My Profile</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-6 relative z-10 space-y-6">
        {/* Profile Card */}
        <Card className="card-glass border-border/30 overflow-hidden">
          {/* Cover */}
          <div className="h-24 bg-gradient-to-r from-primary/30 via-accent/20 to-success/30" />
          
          <CardContent className="pt-0 -mt-12">
            {/* Avatar */}
            <div className="flex items-end gap-4 mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground border-4 border-background shadow-xl">
                  {profile.fullName.split(" ").map(n => n[0]).join("")}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-accent rounded-xl shadow-lg">
                  <Camera className="h-4 w-4 text-accent-foreground" />
                </button>
                {profile.verificationStatus === "verified" && (
                  <div className="absolute -top-1 -right-1 bg-success rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4 text-success-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 pb-2">
                <h2 className="text-xl font-bold">{profile.fullName}</h2>
                <Badge className="badge-verified">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified User
                </Badge>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="text-center p-3 rounded-xl bg-secondary/30">
                <Shield className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{profile.trustScore}</p>
                <p className="text-[10px] text-muted-foreground">Trust Score</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/30">
                <Package className="h-5 w-5 mx-auto text-accent mb-1" />
                <p className="text-lg font-bold">{profile.totalDeliveries}</p>
                <p className="text-[10px] text-muted-foreground">Deliveries</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/30">
                <TrendingUp className="h-5 w-5 mx-auto text-success mb-1" />
                <p className="text-lg font-bold">{profile.successRate}%</p>
                <p className="text-[10px] text-muted-foreground">Success</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/30">
                <Star className="h-5 w-5 mx-auto text-primary fill-primary mb-1" />
                <p className="text-lg font-bold">4.9</p>
                <p className="text-[10px] text-muted-foreground">Rating</p>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.email || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
                <Badge variant="outline" className="text-success border-success/30">
                  Verified
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="card-glass border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { icon: "🎯", label: "First Delivery", earned: true },
                { icon: "⭐", label: "5-Star Rating", earned: true },
                { icon: "🚀", label: "10 Deliveries", earned: true },
                { icon: "💎", label: "Premium User", earned: false },
                { icon: "🏆", label: "Top Saarthi", earned: false },
              ].map((achievement, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 w-20 text-center p-3 rounded-xl border ${
                    achievement.earned 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-secondary/20 border-border/30 opacity-50"
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <p className="text-[10px] mt-1 font-medium">{achievement.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 rounded-2xl"
            onClick={() => navigate("/dashboard/sender")}
          >
            <Package className="h-6 w-6 text-accent" />
            <span className="text-sm">Send Parcel</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2 rounded-2xl"
            onClick={() => navigate("/dashboard/traveler")}
          >
            <Navigation className="h-6 w-6 text-primary" />
            <span className="text-sm">Post Journey</span>
          </Button>
        </div>

        {/* Logout Button */}
        {user && (
          <Button 
            variant="destructive" 
            className="w-full rounded-2xl h-14"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        )}

        {/* Login Prompt */}
        {!user && (
          <Card className="card-glass border-accent/30 bg-accent/5">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground mb-3">
                Login to access all features and track your deliveries
              </p>
              <Button onClick={() => navigate("/auth")} className="bg-accent">
                Login / Sign Up
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Profile;
