import { useState } from "react";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Weight, 
  Train, 
  Plane, 
  Bus,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JourneyFormData {
  source: string;
  destination: string;
  date: string;
  time: string;
  transportMode: string;
  ticketId: string;
  availableCapacity: number;
}

interface JourneyPostFormProps {
  onSubmit: (data: JourneyFormData) => void;
}

const JourneyPostForm = ({ onSubmit }: JourneyPostFormProps) => {
  const [formData, setFormData] = useState<JourneyFormData>({
    source: "",
    destination: "",
    date: "",
    time: "",
    transportMode: "train",
    ticketId: "",
    availableCapacity: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const transportModes = [
    { value: "train", label: "Train", icon: Train },
    { value: "flight", label: "Flight", icon: Plane },
    { value: "bus", label: "Bus", icon: Bus },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source */}
        <div className="space-y-2">
          <Label htmlFor="source" className="text-sm text-muted-foreground">
            From
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="source"
              placeholder="Source city"
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
            To
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input
              id="destination"
              placeholder="Destination city"
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
            Travel Date
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
            Departure Time
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

        {/* Transport Mode */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Transport Mode</Label>
          <Select
            value={formData.transportMode}
            onValueChange={(value) => setFormData({ ...formData, transportMode: value })}
          >
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue placeholder="Select transport" />
            </SelectTrigger>
            <SelectContent>
              {transportModes.map((mode) => (
                <SelectItem key={mode.value} value={mode.value}>
                  <div className="flex items-center gap-2">
                    <mode.icon className="w-4 h-4" />
                    <span>{mode.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ticket ID */}
        <div className="space-y-2">
          <Label htmlFor="ticketId" className="text-sm text-muted-foreground">
            PNR / Ticket ID
          </Label>
          <Input
            id="ticketId"
            placeholder="For verification"
            value={formData.ticketId}
            onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
            className="bg-secondary/50 border-border/50 focus:border-primary font-mono"
            required
          />
        </div>

        {/* Available Capacity */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="capacity" className="text-sm text-muted-foreground">
            Available Capacity (kg)
          </Label>
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="capacity"
              type="number"
              min="1"
              max="20"
              value={formData.availableCapacity}
              onChange={(e) => setFormData({ ...formData, availableCapacity: Number(e.target.value) })}
              className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum 20kg per journey. You'll earn based on weight carried.
          </p>
        </div>
      </div>

      <Button type="submit" variant="hero" size="lg" className="w-full md:w-auto">
        <Plus className="w-4 h-4" />
        Post Your Journey
      </Button>
    </form>
  );
};

export default JourneyPostForm;
