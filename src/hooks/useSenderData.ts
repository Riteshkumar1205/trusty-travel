import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SenderStats {
  totalParcels: number;
  delivered: number;
  inTransit: number;
  pending: number;
  totalSpent: number;
  avgRating: number;
  trustScore: number;
  favoriteRoute: string;
  successRate: number;
}

export interface SenderParcel {
  id: string;
  deliveryId?: string;
  title: string;
  description?: string;
  status: "pending" | "matched" | "picked-up" | "in-transit" | "delivered";
  traveler?: {
    name: string;
    avatar: string;
    phone?: string;
    trustScore: number;
    verified: boolean;
    userId: string;
  };
  route: { from: string; to: string };
  transport?: string;
  progress: number;
  eta?: string;
  weight: number;
  price?: number;
  timeline: Array<{
    status: string;
    time: string;
    completed: boolean;
  }>;
  createdAt: string;
}

export interface MatchedTraveler {
  id: string;
  journeyId: string;
  name: string;
  avatar: string;
  trustScore: number;
  verified: boolean;
  route: { from: string; to: string };
  date: string;
  time: string;
  transportMode: string;
  availableCapacity: number;
  pricePerKg: number;
  acceptedParcelTypes: string[];
}

export function useSenderData() {
  const [stats, setStats] = useState<SenderStats | null>(null);
  const [parcels, setParcels] = useState<SenderParcel[]>([]);
  const [matchedTravelers, setMatchedTravelers] = useState<MatchedTraveler[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Fetch sender's parcels
  const fetchParcels = async (uid: string) => {
    const { data, error } = await supabase
      .from("parcels")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching parcels:", error);
      return [];
    }

    return data || [];
  };

  // Fetch deliveries for sender's parcels
  const fetchDeliveries = async (uid: string) => {
    const { data, error } = await supabase
      .from("deliveries")
      .select(`
        *,
        parcel:parcels(*),
        journey:journeys(*),
        traveler:profiles!deliveries_traveler_id_fkey(*)
      `)
      .eq("sender_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching deliveries:", error);
      return [];
    }

    return data || [];
  };

  // Fetch available travelers for matching (uses public views to hide sensitive data)
  const fetchAvailableTravelers = async () => {
    const now = new Date();
    // First fetch journeys from public view
    const { data: journeysData, error: journeysError } = await supabase
      .from("journeys_public" as "journeys")
      .select("*")
      .gte("departure_date", now.toISOString().split("T")[0])
      .gt("available_capacity", 0)
      .order("departure_date", { ascending: true })
      .limit(20);

    if (journeysError) {
      console.error("Error fetching travelers:", journeysError);
      return [];
    }

    // Fetch profiles from public view
    const userIds = [...new Set((journeysData || []).map((j) => j.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles_public" as "profiles")
      .select("*")
      .in("user_id", userIds);

    return (journeysData || []).map((j) => {
      const profile = profilesData?.find((p) => p.user_id === j.user_id);
      return {
        id: profile?.user_id || j.user_id,
        journeyId: j.id,
        name: profile?.full_name || "Traveler",
        avatar: (profile?.full_name || "T").substring(0, 2).toUpperCase(),
        trustScore: (profile?.trust_score || 50) / 10,
        verified: profile?.verification_status === "verified",
        route: { from: j.source_city, to: j.destination_city },
        date: j.departure_date,
        time: j.departure_time,
        transportMode: j.transport_mode,
        availableCapacity: j.available_capacity,
        pricePerKg: j.price_per_kg,
        acceptedParcelTypes: j.accepted_parcel_types || [],
      };
    });
  };

  // Calculate progress based on status
  const getProgress = (status: string) => {
    switch (status) {
      case "pending": return 10;
      case "matched": return 25;
      case "picked_up": return 50;
      case "in_transit": return 75;
      case "delivered": return 100;
      default: return 0;
    }
  };

  // Build timeline from delivery status
  const buildTimeline = (delivery: any, parcel: any) => {
    const timeline = [
      { 
        status: "Posted", 
        time: new Date(parcel.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }), 
        completed: true 
      },
      { 
        status: "Matched", 
        time: delivery ? new Date(delivery.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Pending",
        completed: !!delivery 
      },
      { 
        status: "Picked Up", 
        time: delivery?.pickup_at ? new Date(delivery.pickup_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Pending",
        completed: !!delivery?.pickup_at 
      },
      { 
        status: "In Transit", 
        time: delivery?.status === "in_transit" || delivery?.status === "delivered" ? "In Progress" : "Pending",
        completed: delivery?.status === "in_transit" || delivery?.status === "delivered"
      },
      { 
        status: "Delivered", 
        time: delivery?.delivered_at ? new Date(delivery.delivered_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Pending",
        completed: delivery?.status === "delivered" 
      },
    ];
    return timeline;
  };

  // Map parcel status
  const mapStatus = (parcelStatus: string, deliveryStatus?: string): SenderParcel["status"] => {
    if (deliveryStatus === "delivered") return "delivered";
    if (deliveryStatus === "in_transit") return "in-transit";
    if (deliveryStatus === "picked_up") return "picked-up";
    if (deliveryStatus) return "matched";
    return "pending";
  };

  // Calculate stats
  const calculateStats = async (uid: string, parcelsData: any[], deliveriesData: any[]) => {
    // Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .single();

    const delivered = deliveriesData.filter(d => d.status === "delivered").length;
    const inTransit = deliveriesData.filter(d => d.status === "in_transit" || d.status === "picked_up").length;
    const pending = parcelsData.filter(p => p.status === "pending").length;
    const totalSpent = deliveriesData
      .filter(d => d.status === "delivered")
      .reduce((sum, d) => sum + (d.agreed_price || 0), 0);

    // Calculate average rating given
    const ratings = deliveriesData
      .filter(d => d.traveler_rating)
      .map(d => d.traveler_rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    // Find favorite route
    const routeCounts: Record<string, number> = {};
    parcelsData.forEach(p => {
      const route = `${p.pickup_city} → ${p.drop_city}`;
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    const favoriteRoute = Object.entries(routeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "No deliveries yet";

    const successRate = parcelsData.length > 0 ? (delivered / parcelsData.length) * 100 : 0;

    return {
      totalParcels: parcelsData.length,
      delivered,
      inTransit,
      pending,
      totalSpent,
      avgRating,
      trustScore: (profile?.trust_score || 50) / 10,
      favoriteRoute,
      successRate,
    };
  };

  // Main fetch function
  const fetchAllData = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const [parcelsData, deliveriesData, travelersData] = await Promise.all([
        fetchParcels(userId),
        fetchDeliveries(userId),
        fetchAvailableTravelers(),
      ]);

      // Map parcels with delivery info
      const mappedParcels: SenderParcel[] = parcelsData.map((p) => {
        const delivery = deliveriesData.find(d => d.parcel_id === p.id);
        const status = mapStatus(p.status, delivery?.status);
        
        return {
          id: p.id,
          deliveryId: delivery?.id,
          title: p.title,
          description: p.description,
          status,
          traveler: delivery ? {
            name: delivery.traveler?.full_name || "Traveler",
            avatar: (delivery.traveler?.full_name || "T").substring(0, 2).toUpperCase(),
            phone: undefined, // Phone hidden until needed via secure channel
            trustScore: (delivery.traveler?.trust_score || 50) / 10,
            verified: delivery.traveler?.verification_status === "verified",
            userId: delivery.traveler_id,
          } : undefined,
          route: { from: p.pickup_city, to: p.drop_city },
          transport: delivery?.journey?.transport_mode,
          progress: getProgress(delivery?.status || p.status),
          eta: delivery?.journey ? calculateETA(delivery.journey) : undefined,
          weight: p.weight,
          price: delivery?.agreed_price || p.budget,
          timeline: buildTimeline(delivery, p),
          createdAt: p.created_at,
        };
      });

      const statsData = await calculateStats(userId, parcelsData, deliveriesData);

      setParcels(mappedParcels);
      setMatchedTravelers(travelersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching sender data:", error);
      toast({
        title: "Error loading data",
        description: "Failed to load your dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate ETA based on journey
  const calculateETA = (journey: any) => {
    if (!journey) return undefined;
    const arrival = new Date(`${journey.arrival_date}T${journey.arrival_time}`);
    const now = new Date();
    const diff = arrival.getTime() - now.getTime();
    if (diff <= 0) return "Arriving soon";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Less than 1 hour";
    if (hours < 24) return `${hours} hours`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;

    fetchAllData();

    // Subscribe to parcels changes
    const parcelsChannel = supabase
      .channel("sender-parcels")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "parcels",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    // Subscribe to deliveries changes
    const deliveriesChannel = supabase
      .channel("sender-deliveries")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deliveries",
          filter: `sender_id=eq.${userId}`,
        },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(parcelsChannel);
      supabase.removeChannel(deliveriesChannel);
    };
  }, [userId]);

  return {
    stats,
    parcels,
    matchedTravelers,
    isLoading,
    userId,
    refetch: fetchAllData,
  };
}

export default useSenderData;
