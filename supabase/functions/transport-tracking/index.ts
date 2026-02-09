import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mock data for when API keys aren't configured
const getMockTrainData = (pnr: string) => ({
  pnr,
  trainNumber: "12301",
  trainName: "Howrah Rajdhani Express",
  source: "New Delhi",
  destination: "Howrah Junction",
  departureTime: "16:55",
  arrivalTime: "09:55",
  status: "On Time",
  currentStation: "Kanpur Central",
  delay: 0,
  lastUpdated: new Date().toISOString(),
  isMock: true,
});

const getMockBusData = (bookingId: string) => ({
  bookingId,
  operatorName: "VRL Travels",
  busType: "Volvo Multi-Axle Sleeper",
  source: "Mumbai",
  destination: "Bangalore",
  departureTime: "20:00",
  arrivalTime: "08:00",
  status: "Running",
  currentLocation: "Pune",
  delay: 15,
  lastUpdated: new Date().toISOString(),
  isMock: true,
});

const getMockFlightData = (flightNumber: string) => ({
  flightNumber,
  airline: "IndiGo",
  aircraft: "Airbus A320",
  source: "Delhi (DEL)",
  destination: "Mumbai (BOM)",
  departureTime: "14:30",
  arrivalTime: "16:45",
  status: "In Air",
  altitude: "35000 ft",
  speed: "850 km/h",
  delay: 0,
  lastUpdated: new Date().toISOString(),
  isMock: true,
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, identifier } = await req.json();

    if (!type || !identifier) {
      throw new Error("Missing required fields: type and identifier");
    }

    // Get API keys from environment
    const irctcApiKey = Deno.env.get("IRCTC_API_KEY");
    const redbusApiKey = Deno.env.get("REDBUS_API_KEY");
    const flightawareApiKey = Deno.env.get("FLIGHTAWARE_API_KEY");

    let data;
    let isLive = false;

    switch (type) {
      case "train":
        if (irctcApiKey && irctcApiKey !== "demo") {
          data = getMockTrainData(identifier);
        } else {
          data = getMockTrainData(identifier);
        }
        break;

      case "bus":
        if (redbusApiKey && redbusApiKey !== "demo") {
          data = getMockBusData(identifier);
        } else {
          data = getMockBusData(identifier);
        }
        break;

      case "flight":
        if (flightawareApiKey && flightawareApiKey !== "demo") {
          data = getMockFlightData(identifier);
        } else {
          data = getMockFlightData(identifier);
        }
        break;

      default:
        throw new Error("Invalid transport type");
    }

    return new Response(
      JSON.stringify({ success: true, data, isLive }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
