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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { transportModes, getTransportModesByCategory, TransportMode } from "@/lib/transportModes";
import SmartModeRecommender from "./SmartModeRecommender";

interface JourneyFormData {
  source: string;
  destination: string;
  date: string;
  time: string;
  transportMode: TransportMode;
  ticketId: string;
  vehicleNumber: string;
  drivingLicense: string;
  availableCapacity: number;
}

interface JourneyPostFormProps {
  onSubmit: (data: JourneyFormData) => void;
}

const JourneyPostForm = ({ onSubmit }: JourneyPostFormProps) => {
  const { t } = useLanguage();
  const [showSmartRecommender, setShowSmartRecommender] = useState(true);
  const [formData, setFormData] = useState<JourneyFormData>({
    source: "",
    destination: "",
    date: "",
    time: "",
    transportMode: "train",
    ticketId: "",
    vehicleNumber: "",
    drivingLicense: "",
    availableCapacity: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source */}
          <div className="space-y-2">
            <Label htmlFor="source" className="text-sm text-muted-foreground">
              {t("journey.from")}
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="source"
                placeholder={t("journey.sourceCity")}
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-sm text-muted-foreground">
              {t("journey.to")}
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                id="destination"
                placeholder={t("journey.destinationCity")}
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm text-muted-foreground">
              {t("journey.travelDate")}
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm text-muted-foreground">
              {t("journey.departureTime")}
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Ticket ID - for Flight/Train */}
          {needsTicketId && (
            <div className="space-y-2">
              <Label htmlFor="ticketId" className="text-sm text-muted-foreground">
                {t("journey.ticketId")}
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="ticketId"
                  placeholder={t("journey.forVerification")}
                  value={formData.ticketId}
                  onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
                  className="pl-10 bg-secondary/50 border-border/50 focus:border-primary font-mono"
                  required
                />
              </div>
            </div>
          )}

          {/* Vehicle Number - for Car/Bike/Truck */}
          {needsVehicleInfo && (
            <>
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber" className="text-sm text-muted-foreground">
                  {t("journey.vehicleNumber")}
                </Label>
                <div className="relative">
                  <CarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="vehicleNumber"
                    placeholder="MH 12 AB 1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                    className="pl-10 bg-secondary/50 border-border/50 focus:border-primary font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="drivingLicense" className="text-sm text-muted-foreground">
                  {t("journey.drivingLicense")}
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="drivingLicense"
                    placeholder="DL-1234567890123"
                    value={formData.drivingLicense}
                    onChange={(e) => setFormData({ ...formData, drivingLicense: e.target.value.toUpperCase() })}
                    className="pl-10 bg-secondary/50 border-border/50 focus:border-primary font-mono uppercase"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Available Capacity */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="capacity" className="text-sm text-muted-foreground">
              {t("journey.availableCapacity")}
            </Label>
            <div className="relative">
              <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="capacity"
                type="number"
                min="1"
                max={selectedMode?.maxCapacity || 20}
                value={formData.availableCapacity}
                onChange={(e) => setFormData({ ...formData, availableCapacity: Number(e.target.value) })}
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("journey.maxCapacity").replace("20", String(selectedMode?.maxCapacity || 20))}
            </p>
          </div>
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full md:w-auto">
          <Plus className="w-4 h-4" />
          {t("journey.postJourney")}
        </Button>
      </form>
    </div>
  );
};

export default JourneyPostForm;
