import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Package, Settings, CheckCircle2, MapPin, Weight,
  FileText, Smartphone, Shirt, Pizza, Pill, Box,
  Sparkles, Save, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PARCEL_TYPES = [
  { id: "documents", label: "Documents", icon: FileText, color: "bg-blue-500/20 text-blue-400" },
  { id: "electronics", label: "Electronics", icon: Smartphone, color: "bg-purple-500/20 text-purple-400" },
  { id: "clothing", label: "Clothing", icon: Shirt, color: "bg-pink-500/20 text-pink-400" },
  { id: "food", label: "Food Items", icon: Pizza, color: "bg-orange-500/20 text-orange-400" },
  { id: "medicines", label: "Medicines", icon: Pill, color: "bg-green-500/20 text-green-400" },
  { id: "general", label: "General", icon: Box, color: "bg-gray-500/20 text-gray-400" },
];

interface TravelerPreferencesProps {
  journeyId?: string;
  initialData?: {
    acceptedParcelTypes: string[];
    maxParcelWeight: number;
    notes: string;
    acceptUrgent: boolean;
  };
  onSave?: (data: any) => void;
}

const TravelerPreferences = ({ journeyId, initialData, onSave }: TravelerPreferencesProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    acceptedParcelTypes: initialData?.acceptedParcelTypes || ["documents", "electronics", "clothing", "general"],
    maxParcelWeight: initialData?.maxParcelWeight || 10,
    notes: initialData?.notes || "",
    acceptUrgent: initialData?.acceptUrgent ?? true,
  });

  const toggleParcelType = (typeId: string) => {
    setPreferences(prev => ({
      ...prev,
      acceptedParcelTypes: prev.acceptedParcelTypes.includes(typeId)
        ? prev.acceptedParcelTypes.filter(t => t !== typeId)
        : [...prev.acceptedParcelTypes, typeId]
    }));
  };

  const handleSave = async () => {
    if (preferences.acceptedParcelTypes.length === 0) {
      toast({
        title: "Select at least one parcel type",
        description: "You need to accept at least one type of parcel",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave?.(preferences);
      toast({
        title: "Preferences saved!",
        description: "Your delivery preferences have been updated",
      });
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="card-glass border-border/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-xl bg-primary/20">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          Delivery Preferences
          <Badge variant="outline" className="ml-auto bg-accent/10 text-accent border-accent/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Rapido Style
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Parcel Types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            What can you carry?
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PARCEL_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = preferences.acceptedParcelTypes.includes(type.id);
              
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => toggleParcelType(type.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-secondary/20 hover:border-primary/30"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{type.label}</span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
          {preferences.acceptedParcelTypes.length === 0 && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Select at least one parcel type
            </p>
          )}
        </div>

        {/* Max Weight */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Weight className="h-4 w-4 text-muted-foreground" />
            Maximum weight you can carry
          </Label>
          <div className="space-y-4">
            <Slider
              value={[preferences.maxParcelWeight]}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, maxParcelWeight: value[0] }))}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">1 kg</span>
              <span className="font-semibold text-primary text-lg">{preferences.maxParcelWeight} kg</span>
              <span className="text-muted-foreground">50 kg</span>
            </div>
          </div>
        </div>

        {/* Urgent Deliveries */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Accept Urgent Deliveries</Label>
            <p className="text-xs text-muted-foreground">
              Get 1.5x higher rates for time-sensitive parcels
            </p>
          </div>
          <Switch
            checked={preferences.acceptUrgent}
            onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, acceptUrgent: checked }))}
          />
        </div>

        {/* Special Notes */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Special Instructions</Label>
          <Textarea
            placeholder="E.g., I have a secure bag for documents, can handle fragile items carefully..."
            value={preferences.notes}
            onChange={(e) => setPreferences(prev => ({ ...prev, notes: e.target.value }))}
            className="bg-secondary/30 border-border/50 min-h-[80px]"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isLoading || preferences.acceptedParcelTypes.length === 0}
          className="w-full"
          variant="hero"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TravelerPreferences;