import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, MapPin, Phone, Scale, Zap, Shield, AlertTriangle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { value: "general", label: "General Items", icon: "📦" },
  { value: "documents", label: "Documents", icon: "📄" },
  { value: "electronics", label: "Electronics", icon: "💻" },
  { value: "fragile", label: "Fragile Items", icon: "🔮" },
  { value: "medical", label: "Medical Supplies", icon: "💊" },
  { value: "food", label: "Food Items", icon: "🍱" },
];

const transportModes = [
  { value: "flight", label: "Flight", icon: "✈️" },
  { value: "train", label: "Train", icon: "🚆" },
  { value: "car", label: "Car", icon: "🚗" },
  { value: "bike", label: "Bike", icon: "🏍️" },
  { value: "truck", label: "Truck", icon: "🚛" },
];

const ParcelPostForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pickupCity: "",
    pickupLocation: "",
    pickupContact: "",
    dropCity: "",
    dropLocation: "",
    dropContact: "",
    weight: "",
    dimensions: "",
    category: "general",
    urgency: "normal",
    preferredModes: ["train", "flight", "car"],
    budget: "",
  });

  const handleModeToggle = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      preferredModes: prev.preferredModes.includes(mode)
        ? prev.preferredModes.filter(m => m !== mode)
        : [...prev.preferredModes, mode]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Submit to Supabase when authenticated
    toast({
      title: "Parcel Posted! 📦",
      description: "Your parcel is now visible to verified Saarthis on compatible routes.",
    });
  };

  return (
    <Card className="card-glass border-border/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-xl bg-accent/20">
            <Package className="h-5 w-5 text-accent" />
          </div>
          Post Your Parcel
          <span className="ml-auto badge-review text-xs">
            <Sparkles className="h-3 w-3" />
            Smart Matching
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Parcel Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Parcel Details
            </h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="title">Parcel Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Birthday Gift for Mom"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-secondary/50"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Any special handling instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary/50 resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="2.5"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="bg-secondary/50 pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    placeholder="30x20x15 cm"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div>
                <Label>Category</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-3 rounded-xl border text-sm transition-all ${
                        formData.category === cat.value
                          ? "border-accent bg-accent/20 text-accent"
                          : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <p className="mt-1 text-xs">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pickup & Drop */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-success" />
                Pickup Location
              </h3>
              
              <div>
                <Label htmlFor="pickupCity">City</Label>
                <Input
                  id="pickupCity"
                  placeholder="Delhi"
                  value={formData.pickupCity}
                  onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
                  className="bg-secondary/50"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pickupLocation">Full Address</Label>
                <Input
                  id="pickupLocation"
                  placeholder="Sector 15, Dwarka"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  className="bg-secondary/50"
                  required
                />
              </div>

              <div>
                <Label htmlFor="pickupContact">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pickupContact"
                    placeholder="+91 98765 43210"
                    value={formData.pickupContact}
                    onChange={(e) => setFormData({ ...formData, pickupContact: e.target.value })}
                    className="bg-secondary/50 pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-destructive" />
                Drop Location
              </h3>
              
              <div>
                <Label htmlFor="dropCity">City</Label>
                <Input
                  id="dropCity"
                  placeholder="Mumbai"
                  value={formData.dropCity}
                  onChange={(e) => setFormData({ ...formData, dropCity: e.target.value })}
                  className="bg-secondary/50"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dropLocation">Full Address</Label>
                <Input
                  id="dropLocation"
                  placeholder="Andheri West, Near Metro"
                  value={formData.dropLocation}
                  onChange={(e) => setFormData({ ...formData, dropLocation: e.target.value })}
                  className="bg-secondary/50"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dropContact">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dropContact"
                    placeholder="+91 98765 43210"
                    value={formData.dropContact}
                    onChange={(e) => setFormData({ ...formData, dropContact: e.target.value })}
                    className="bg-secondary/50 pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Urgency & Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Delivery Preferences
            </h3>

            <div>
              <Label>Urgency Level</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: "normal" })}
                  className={`p-3 rounded-xl border transition-all ${
                    formData.urgency === "normal"
                      ? "border-success bg-success/20 text-success"
                      : "border-border/50 bg-secondary/30"
                  }`}
                >
                  <Shield className="h-4 w-4 mx-auto" />
                  <p className="mt-1 text-sm font-medium">Normal</p>
                  <p className="text-xs text-muted-foreground">3-5 days</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: "urgent" })}
                  className={`p-3 rounded-xl border transition-all ${
                    formData.urgency === "urgent"
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border/50 bg-secondary/30"
                  }`}
                >
                  <Zap className="h-4 w-4 mx-auto" />
                  <p className="mt-1 text-sm font-medium">Urgent</p>
                  <p className="text-xs text-muted-foreground">1-2 days</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: "critical" })}
                  className={`p-3 rounded-xl border transition-all ${
                    formData.urgency === "critical"
                      ? "border-destructive bg-destructive/20 text-destructive"
                      : "border-border/50 bg-secondary/30"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 mx-auto" />
                  <p className="mt-1 text-sm font-medium">Critical</p>
                  <p className="text-xs text-muted-foreground">Same day</p>
                </button>
              </div>
            </div>

            <div>
              <Label>Preferred Transport Modes</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {transportModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => handleModeToggle(mode.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      formData.preferredModes.includes(mode.value)
                        ? "border-accent bg-accent/20 text-accent"
                        : "border-border/50 bg-secondary/30"
                    }`}
                  >
                    <span>{mode.icon}</span>
                    <span className="text-sm">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="budget">Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="Maximum you're willing to pay"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="bg-secondary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for best match based on weight
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <Sparkles className="h-4 w-4 mr-2" />
            Find My Saarthi
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            🛡️ Your parcel will only be visible to verified travelers on matching routes
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default ParcelPostForm;
