import { useState } from "react";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Weight, 
  Plus,
  Car as CarIcon,
  FileText,
  Sparkles,
  X,
  Package,
  CheckCircle2,
  Smartphone,
  Shirt,
  Pizza,
  Pill,
  Box,
  Phone,
  User,
  IndianRupee,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { transportModes, getTransportModesByCategory, TransportMode } from "@/lib/transportModes";
import SmartModeRecommender from "./SmartModeRecommender";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PARCEL_TYPES = [
  { id: "documents", label: "Documents", icon: FileText, color: "bg-blue-500/20 text-blue-400" },
  { id: "electronics", label: "Electronics", icon: Smartphone, color: "bg-purple-500/20 text-purple-400" },
  { id: "clothing", label: "Clothing", icon: Shirt, color: "bg-pink-500/20 text-pink-400" },
  { id: "food", label: "Food Items", icon: Pizza, color: "bg-orange-500/20 text-orange-400" },
  { id: "medicines", label: "Medicines", icon: Pill, color: "bg-green-500/20 text-green-400" },
  { id: "general", label: "General", icon: Box, color: "bg-gray-500/20 text-gray-400" },
];

interface JourneyFormData {
  source: string;
  sourceLocation: string;
  destination: string;
  destinationLocation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  transportMode: TransportMode;
  ticketId: string;
  vehicleNumber: string;
  totalCapacity: number;
  availableCapacity: number;
  pricePerKg: number;
  maxParcelWeight: number;
  acceptedParcelTypes: string[];
  acceptUrgent: boolean;
  notes: string;
  travelerName: string;
  travelerPhone: string;
}

interface JourneyPostFormProps {
  onSubmit?: (data: JourneyFormData) => void;
  onSuccess?: () => void;
}

const JourneyPostForm = ({ onSubmit, onSuccess }: JourneyPostFormProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showSmartRecommender, setShowSmartRecommender] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof JourneyFormData, string>>>({});
  
  const [formData, setFormData] = useState<JourneyFormData>({
    source: "",
    sourceLocation: "",
    destination: "",
    destinationLocation: "",
    departureDate: "",
    departureTime: "",
    arrivalDate: "",
    arrivalTime: "",
    transportMode: "train",
    ticketId: "",
    vehicleNumber: "",
    totalCapacity: 10,
    availableCapacity: 10,
    pricePerKg: 50,
    maxParcelWeight: 5,
    acceptedParcelTypes: ["documents", "electronics", "clothing", "general"],
    acceptUrgent: true,
    notes: "",
    travelerName: "",
    travelerPhone: "",
  });

  const toggleParcelType = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      acceptedParcelTypes: prev.acceptedParcelTypes.includes(typeId)
        ? prev.acceptedParcelTypes.filter(t => t !== typeId)
        : [...prev.acceptedParcelTypes, typeId]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof JourneyFormData, string>> = {};
    
    if (!formData.travelerName.trim()) {
      newErrors.travelerName = "Your name is required";
    }
    if (!formData.travelerPhone.trim() || !/^[6-9]\d{9}$/.test(formData.travelerPhone.replace(/\D/g, ""))) {
      newErrors.travelerPhone = "Valid 10-digit phone number required";
    }
    if (!formData.source.trim()) {
      newErrors.source = "Source city is required";
    }
    if (!formData.sourceLocation.trim()) {
      newErrors.sourceLocation = "Pickup location is required";
    }
    if (!formData.destination.trim()) {
      newErrors.destination = "Destination city is required";
    }
    if (!formData.destinationLocation.trim()) {
      newErrors.destinationLocation = "Drop location is required";
    }
    if (!formData.departureDate) {
      newErrors.departureDate = "Departure date is required";
    }
    if (!formData.departureTime) {
      newErrors.departureTime = "Departure time is required";
    }
    if (!formData.arrivalDate) {
      newErrors.arrivalDate = "Arrival date is required";
    }
    if (!formData.arrivalTime) {
      newErrors.arrivalTime = "Arrival time is required";
    }
    
    // Validate ticket/vehicle based on mode
    const needsTicket = formData.transportMode === "flight" || formData.transportMode === "train";
    const needsVehicle = formData.transportMode === "car" || formData.transportMode === "bike" || formData.transportMode === "truck";
    
    if (needsTicket && !formData.ticketId.trim()) {
      newErrors.ticketId = "PNR/Ticket ID is required for verification";
    }
    if (needsVehicle && !formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Vehicle number is required";
    }
    
    if (formData.acceptedParcelTypes.length === 0) {
      toast({
        title: "Select parcel types",
        description: "Please select at least one type of parcel you can carry",
        variant: "destructive",
      });
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fill all required fields",
        description: "Check the form for missing information",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login required",
          description: "Please login to post your travel plan",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert journey into database
      const { error } = await supabase.from("journeys").insert({
        user_id: user.id,
        source_city: formData.source,
        source_location: formData.sourceLocation,
        destination_city: formData.destination,
        destination_location: formData.destinationLocation,
        departure_date: formData.departureDate,
        departure_time: formData.departureTime,
        arrival_date: formData.arrivalDate,
        arrival_time: formData.arrivalTime,
        transport_mode: formData.transportMode,
        pnr_number: formData.ticketId || null,
        vehicle_number: formData.vehicleNumber || null,
        total_capacity: formData.totalCapacity,
        available_capacity: formData.availableCapacity,
        price_per_kg: formData.pricePerKg,
        max_parcel_weight: formData.maxParcelWeight,
        accepted_parcel_types: formData.acceptedParcelTypes,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Journey posted successfully! 🎉",
        description: "Senders can now find and contact you for deliveries",
      });

      // Reset form
      setFormData({
        source: "",
        sourceLocation: "",
        destination: "",
        destinationLocation: "",
        departureDate: "",
        departureTime: "",
        arrivalDate: "",
        arrivalTime: "",
        transportMode: "train",
        ticketId: "",
        vehicleNumber: "",
        totalCapacity: 10,
        availableCapacity: 10,
        pricePerKg: 50,
        maxParcelWeight: 5,
        acceptedParcelTypes: ["documents", "electronics", "clothing", "general"],
        acceptUrgent: true,
        notes: "",
        travelerName: "",
        travelerPhone: "",
      });

      onSubmit?.(formData);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error posting journey:", error);
      toast({
        title: "Failed to post journey",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeSelect = (modeId: string) => {
    setFormData({ ...formData, transportMode: modeId as TransportMode });
    setShowSmartRecommender(false);
  };

  const selectedMode = transportModes.find(m => m.id === formData.transportMode);
  const modesByCategory = getTransportModesByCategory();
  
  // Determine which fields to show based on transport mode
  const needsTicketId = formData.transportMode === "flight" || formData.transportMode === "train";
  const needsVehicleInfo = formData.transportMode === "car" || formData.transportMode === "bike" || formData.transportMode === "truck";

  return (
    <div className="space-y-6">
      {/* Smart Mode Recommender */}
      {showSmartRecommender && (
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-0 right-0 z-10"
            onClick={() => setShowSmartRecommender(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          <SmartModeRecommender onSelectMode={handleModeSelect} />
        </div>
      )}

      {/* Manual Mode Selection */}
      {!showSmartRecommender && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">{t("journey.transportMode")}</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSmartRecommender(true)}
              className="text-primary"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Smart Suggest
            </Button>
          </div>

          {/* Transport Mode Categories */}
          <div className="space-y-4">
            {Object.entries(modesByCategory).map(([category, modes]) => {
              if (modes.length === 0) return null;
              
              return (
                <div key={category}>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    {t(modes[0].categoryLabelKey)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {modes.map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = formData.transportMode === mode.id;
                      
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, transportMode: mode.id })}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                            isSelected 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-border/50 bg-card/50 hover:border-primary/30 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{t(mode.labelKey)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Mode Info */}
          {selectedMode && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-start gap-3">
                <selectedMode.icon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium text-foreground">{t(selectedMode.labelKey)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(selectedMode.descKey)} • Max {selectedMode.maxCapacity}kg
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedMode.idealFor.slice(0, 3).map((item, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Traveler Details Section */}
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-4">
          <div className="flex items-center gap-2 text-accent">
            <User className="h-4 w-4" />
            <Label className="text-sm font-medium">Your Contact Details</Label>
            <span className="text-xs text-muted-foreground ml-auto">Required for senders to contact you</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="travelerName" className="text-sm text-muted-foreground">
                Full Name *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="travelerName"
                  placeholder="Enter your full name"
                  value={formData.travelerName}
                  onChange={(e) => setFormData({ ...formData, travelerName: e.target.value })}
                  className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary ${errors.travelerName ? "border-destructive" : ""}`}
                  required
                />
              </div>
              {errors.travelerName && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.travelerName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="travelerPhone" className="text-sm text-muted-foreground">
                Phone Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="travelerPhone"
                  placeholder="10-digit mobile number"
                  value={formData.travelerPhone}
                  onChange={(e) => setFormData({ ...formData, travelerPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary ${errors.travelerPhone ? "border-destructive" : ""}`}
                  required
                />
              </div>
              {errors.travelerPhone && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.travelerPhone}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source City */}
          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm text-muted-foreground">
              {t("journey.from")} City *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="source"
                placeholder={t("journey.sourceCity")}
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary ${errors.source ? "border-destructive" : ""}`}
                required
              />
            </div>
          </div>

          {/* Source Location */}
          <div className="space-y-2">
            <Label htmlFor="sourceLocation" className="text-sm text-muted-foreground">
              Pickup Location *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="sourceLocation"
                placeholder="Station/Airport/Address"
                value={formData.sourceLocation}
                onChange={(e) => setFormData({ ...formData, sourceLocation: e.target.value })}
                className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary ${errors.sourceLocation ? "border-destructive" : ""}`}
                required
              />
            </div>
          </div>

          {/* Destination City */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-sm text-muted-foreground">
              {t("journey.to")} City *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                id="destination"
                placeholder={t("journey.destinationCity")}
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary ${errors.destination ? "border-destructive" : ""}`}
                required
              />
            </div>
          </div>

          {/* Destination Location */}
          <div className="space-y-2">
            <Label htmlFor="destinationLocation" className="text-sm text-muted-foreground">
              Drop Location *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                id="destinationLocation"
                placeholder="Station/Airport/Address"
                value={formData.destinationLocation}
                onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary ${errors.destinationLocation ? "border-destructive" : ""}`}
                required
              />
            </div>
          </div>

          {/* Departure Date */}
          <div className="space-y-2">
            <Label htmlFor="departureDate" className="text-sm text-muted-foreground">
              Departure Date *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="departureDate"
                type="date"
                value={formData.departureDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary ${errors.departureDate ? "border-destructive" : ""}`}
                required
              />
            </div>
          </div>

          {/* Departure Time */}
          <div className="space-y-2">
            <Label htmlFor="departureTime" className="text-sm text-muted-foreground">
              {t("journey.departureTime")} *
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="departureTime"
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary ${errors.departureTime ? "border-destructive" : ""}`}
                required
              />
            </div>
          </div>

          {/* Arrival Date */}
          <div className="space-y-2">
            <Label htmlFor="arrivalDate" className="text-sm text-muted-foreground">
              Arrival Date *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                id="arrivalDate"
                type="date"
                value={formData.arrivalDate}
                min={formData.departureDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary ${errors.arrivalDate ? "border-destructive" : ""}`}
                required
              />
            </div>
          </div>

          {/* Arrival Time */}
          <div className="space-y-2">
            <Label htmlFor="arrivalTime" className="text-sm text-muted-foreground">
              Arrival Time *
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                id="arrivalTime"
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary ${errors.arrivalTime ? "border-destructive" : ""}`}
                required
              />
            </div>
          </div>

          {/* Ticket ID - for Flight/Train */}
          {needsTicketId && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ticketId" className="text-sm text-muted-foreground">
                PNR / Ticket ID * (for verification)
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="ticketId"
                  placeholder={formData.transportMode === "train" ? "10-digit PNR number" : "Booking reference"}
                  value={formData.ticketId}
                  onChange={(e) => setFormData({ ...formData, ticketId: e.target.value.toUpperCase() })}
                  className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary font-mono ${errors.ticketId ? "border-destructive" : ""}`}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This helps verify your journey and builds trust with senders
              </p>
            </div>
          )}

          {/* Vehicle Number - for Car/Bike/Truck */}
          {needsVehicleInfo && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vehicleNumber" className="text-sm text-muted-foreground">
                Vehicle Number *
              </Label>
              <div className="relative">
                <CarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="vehicleNumber"
                  placeholder="MH 12 AB 1234"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                  className={`pl-10 bg-secondary/50 border-border/50 focus:border-primary font-mono uppercase ${errors.vehicleNumber ? "border-destructive" : ""}`}
                  required
                />
              </div>
            </div>
          )}

          {/* Capacity & Pricing */}
          <div className="space-y-2">
            <Label htmlFor="capacity" className="text-sm text-muted-foreground">
              Available Capacity (kg) *
            </Label>
            <div className="relative">
              <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="capacity"
                type="number"
                min="1"
                max={selectedMode?.maxCapacity || 20}
                value={formData.availableCapacity}
                onChange={(e) => setFormData({ ...formData, availableCapacity: Number(e.target.value), totalCapacity: Number(e.target.value) })}
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Max {selectedMode?.maxCapacity || 20}kg for {selectedMode?.id || "this mode"}
            </p>
          </div>

          {/* Price per KG */}
          <div className="space-y-2">
            <Label htmlFor="pricePerKg" className="text-sm text-muted-foreground">
              Price per KG (₹) *
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="pricePerKg"
                type="number"
                min="10"
                max="500"
                value={formData.pricePerKg}
                onChange={(e) => setFormData({ ...formData, pricePerKg: Number(e.target.value) })}
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Suggested: ₹30-100/kg based on distance
            </p>
          </div>
        </div>

        {/* Parcel Type Preferences */}
        <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              What can you carry?
            </Label>
            <span className="text-xs text-muted-foreground">Select all that apply</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PARCEL_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.acceptedParcelTypes.includes(type.id);
              
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleParcelType(type.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-background/50 hover:border-primary/30"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${type.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium flex-1 text-left">{type.label}</span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Urgent Delivery Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div>
              <p className="text-sm font-medium">Accept Urgent Deliveries</p>
              <p className="text-xs text-muted-foreground">Earn 1.5x for time-sensitive parcels</p>
            </div>
            <Switch
              checked={formData.acceptUrgent}
              onCheckedChange={(checked) => setFormData({ ...formData, acceptUrgent: checked })}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Special Instructions (Optional)</Label>
            <Textarea
              placeholder="E.g., I have secure storage, can handle fragile items, preferred pickup times..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-background/50 border-border/50 min-h-[60px] text-sm"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          variant="hero" 
          size="lg" 
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {t("journey.postJourney")}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default JourneyPostForm;
