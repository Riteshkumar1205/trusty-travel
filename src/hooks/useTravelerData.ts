import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TravelerStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  thisWeekEarnings: number;
  todayEarnings: number;
  totalJourneys: number;
  totalParcels: number;
  trustScore: number;
  successRate: number;
  pendingPayout: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: "earning" | "payout" | "bonus" | "deduction";
  description: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  parcelId?: string;
  route?: string;
}

export interface Journey {
  id: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  transportMode: string;
  availableCapacity: number;
  usedCapacity: number;
  parcelsCount: number;
  status: "upcoming" | "in-transit" | "completed";
  earnings: number;
  acceptedParcelTypes: string[];
  maxParcelWeight: number;
}

export interface Parcel {
  id: string;
  journeyId: string;
  sender: { name: string; rating: number; verified: boolean; userId: string };
  receiver: { name: string; location: string; phone?: string };
  category: string;
  weight: number;
  price: number;
  status: "pending-pickup" | "in-transit" | "delivered";
  pickupOtp?: string;
  deliveryOtp?: string;
  confidentiality: "low" | "medium" | "high";
  insurance: boolean;
  pickupPhotoUrl?: string;
  deliveryPhotoUrl?: string;
}

export function useTravelerData() {
  const [stats, setStats] = useState<TravelerStats | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

  // Fetch journeys from database
  const fetchJourneys = async (uid: string) => {
    const { data, error } = await supabase
      .from("journeys")
      .select("*")
      .eq("user_id", uid)
      .order("departure_date", { ascending: false });

    if (error) {
      console.error("Error fetching journeys:", error);
      return [];
    }

    return (data || []).map((j) => {
      const now = new Date();
      const departureDate = new Date(`${j.departure_date}T${j.departure_time}`);
      const arrivalDate = new Date(`${j.arrival_date}T${j.arrival_time}`);
      
      let status: "upcoming" | "in-transit" | "completed" = "upcoming";
      if (now > arrivalDate) status = "completed";
      else if (now >= departureDate && now <= arrivalDate) status = "in-transit";

      return {
        id: j.id,
        source: j.source_city,
        destination: j.destination_city,
        date: j.departure_date,
        time: j.departure_time,
        transportMode: j.transport_mode,
        availableCapacity: j.available_capacity,
        usedCapacity: j.total_capacity - j.available_capacity,
        parcelsCount: 0, // Will be updated from deliveries
        status,
        earnings: 0, // Will be calculated from deliveries
        acceptedParcelTypes: j.accepted_parcel_types || [],
        maxParcelWeight: j.max_parcel_weight || 10,
      };
    });
  };

  // Fetch deliveries (parcels assigned to traveler)
  const fetchDeliveries = async (uid: string) => {
    const { data, error } = await supabase
      .from("deliveries")
      .select(`
        *,
        parcel:parcels(*),
        journey:journeys(*),
        sender:profiles!deliveries_sender_id_fkey(*)
      `)
      .eq("traveler_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching deliveries:", error);
      return { parcels: [], transactions: [] };
    }

    const parcelsData: Parcel[] = [];
    const transactionsData: Transaction[] = [];

    (data || []).forEach((d) => {
      // Map delivery to parcel format
      let parcelStatus: "pending-pickup" | "in-transit" | "delivered" = "pending-pickup";
      if (d.status === "delivered") parcelStatus = "delivered";
      else if (d.status === "picked_up" || d.status === "in_transit") parcelStatus = "in-transit";

      if (d.parcel) {
        parcelsData.push({
          id: d.id,
          journeyId: d.journey_id,
          sender: {
            name: d.sender?.full_name || "Unknown Sender",
            rating: (d.sender?.trust_score || 50) / 20, // Convert to 5-star scale
            verified: d.sender?.verification_status === "verified",
            userId: d.sender_id,
          },
          receiver: {
            name: d.recipient_name || "Recipient",
            location: d.parcel.drop_location,
            phone: d.recipient_phone || undefined,
          },
          category: d.parcel.category || "general",
          weight: d.parcel.weight,
          price: d.agreed_price,
          status: parcelStatus,
          pickupOtp: d.pickup_otp || undefined,
          deliveryOtp: d.delivery_otp || undefined,
          confidentiality: d.parcel.category === "documents" ? "high" : "medium",
          insurance: d.parcel.urgent_delivery || false,
          pickupPhotoUrl: d.pickup_photo_url || undefined,
          deliveryPhotoUrl: d.delivery_photo_url || undefined,
        });
      }

      // Create transaction record for completed deliveries
      if (d.status === "delivered" && d.delivered_at) {
        transactionsData.push({
          id: d.id,
          date: d.delivered_at,
          type: "earning",
          description: `Delivery: ${d.parcel?.pickup_city || "Origin"} → ${d.parcel?.drop_city || "Destination"}`,
          amount: d.agreed_price,
          status: "completed",
          parcelId: d.parcel_id,
          route: `${d.parcel?.pickup_city || ""} → ${d.parcel?.drop_city || ""}`,
        });
      }
    });

    return { parcels: parcelsData, transactions: transactionsData };
  };

  // Calculate stats from real data
  const calculateStats = async (uid: string, journeysData: Journey[], transactionsData: Transaction[]) => {
    // Get profile for trust score
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", uid)
      .single();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalEarnings = transactionsData
      .filter(t => t.type === "earning" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthEarnings = transactionsData
      .filter(t => t.type === "earning" && t.status === "completed" && new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);

    const thisWeekEarnings = transactionsData
      .filter(t => t.type === "earning" && t.status === "completed" && new Date(t.date) >= startOfWeek)
      .reduce((sum, t) => sum + t.amount, 0);

    const todayEarnings = transactionsData
      .filter(t => t.type === "earning" && t.status === "completed" && new Date(t.date) >= startOfDay)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalDeliveries = profile?.total_deliveries || 0;
    const successfulDeliveries = profile?.successful_deliveries || 0;
    const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 100;

    return {
      totalEarnings,
      thisMonthEarnings,
      thisWeekEarnings,
      todayEarnings,
      totalJourneys: journeysData.length,
      totalParcels: successfulDeliveries,
      trustScore: (profile?.trust_score || 50) / 10, // Convert to 5-star scale
      successRate,
      pendingPayout: transactionsData
        .filter(t => t.type === "earning" && t.status === "pending")
        .reduce((sum, t) => sum + t.amount, 0),
    };
  };

  // Main fetch function
  const fetchAllData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const journeysData = await fetchJourneys(userId);
      const { parcels: parcelsData, transactions: transactionsData } = await fetchDeliveries(userId);
      const statsData = await calculateStats(userId, journeysData, transactionsData);

      // Update journey parcel counts and earnings
      const journeysWithCounts = journeysData.map(j => {
        const journeyParcels = parcelsData.filter(p => p.journeyId === j.id);
        const journeyEarnings = journeyParcels
          .filter(p => p.status === "delivered")
          .reduce((sum, p) => sum + p.price, 0);
        return {
          ...j,
          parcelsCount: journeyParcels.length,
          usedCapacity: journeyParcels.reduce((sum, p) => sum + p.weight, 0),
          earnings: journeyEarnings,
        };
      });

      setJourneys(journeysWithCounts);
      setParcels(parcelsData);
      setTransactions(transactionsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching traveler data:", error);
      toast({
        title: "Error loading data",
        description: "Failed to load your dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return;

    fetchAllData();

    // Subscribe to deliveries changes
    const deliveriesChannel = supabase
      .channel("traveler-deliveries")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deliveries",
          filter: `traveler_id=eq.${userId}`,
        },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    // Subscribe to journeys changes
    const journeysChannel = supabase
      .channel("traveler-journeys")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "journeys",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(deliveriesChannel);
      supabase.removeChannel(journeysChannel);
    };
  }, [userId]);

  return {
    stats,
    journeys,
    parcels,
    transactions,
    isLoading,
    userId,
    refetch: fetchAllData,
  };
}

export default useTravelerData;
