import { useState } from "react";
import { 
  Zap, 
  Wallet, 
  Shield, 
  Weight,
  ChevronRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Priority, getSmartRecommendations, SmartRecommendation } from "@/lib/transportModes";

interface SmartModeRecommenderProps {
  onSelectMode: (modeId: string) => void;
}

const priorities: { id: Priority; icon: typeof Zap; colorClass: string }[] = [
  { id: "speed", icon: Zap, colorClass: "text-electric" },
  { id: "cost", icon: Wallet, colorClass: "text-success" },
  { id: "trust", icon: Shield, colorClass: "text-primary" },
  { id: "weight", icon: Weight, colorClass: "text-muted-foreground" },
];

const SmartModeRecommender = ({ onSelectMode }: SmartModeRecommenderProps) => {
  const { t } = useLanguage();
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);

  const handlePrioritySelect = (priority: Priority) => {
    setSelectedPriority(priority);
    const recs = getSmartRecommendations(priority);
    setRecommendations(recs);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("smart.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("smart.subtitle")}
        </p>
      </div>

      {/* Priority Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {priorities.map((priority) => {
          const Icon = priority.icon;
          const isSelected = selectedPriority === priority.id;
          
          return (
            <button
              key={priority.id}
              onClick={() => handlePrioritySelect(priority.id)}
              className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                isSelected 
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" 
                  : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card"
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-primary" : priority.colorClass}`} />
              <div className="font-medium text-foreground text-sm">
                {t(`smart.${priority.id}`)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {t(`smart.${priority.id}Desc`)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-primary" />
            <span>{t("smart.recommended")}</span>
          </div>

          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, index) => {
              const Icon = rec.mode.icon;
              const isBestMatch = index === 0;
              
              return (
                <div
                  key={rec.mode.id}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    isBestMatch 
                      ? "border-primary bg-primary/5 pulse-trust" 
                      : "border-border/50 bg-card/50 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        isBestMatch ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {t(rec.mode.labelKey)}
                          </span>
                          {isBestMatch && (
                            <span className="badge-verified text-xs">
                              {t("smart.bestMatch")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {rec.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-muted-foreground">Match</div>
                        <div className="font-mono text-sm font-semibold text-primary">
                          {rec.score}%
                        </div>
                      </div>
                      <Button 
                        variant={isBestMatch ? "hero" : "glass"} 
                        size="sm"
                        onClick={() => onSelectMode(rec.mode.id)}
                      >
                        Select
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Rating bars */}
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    <RatingBar 
                      label="Speed" 
                      value={rec.mode.speedRating} 
                      max={5}
                      highlight={selectedPriority === "speed"}
                    />
                    <RatingBar 
                      label="Cost" 
                      value={6 - rec.mode.costRating} // Invert for display
                      max={5}
                      highlight={selectedPriority === "cost"}
                    />
                    <RatingBar 
                      label="Trust" 
                      value={rec.mode.trustRating} 
                      max={5}
                      highlight={selectedPriority === "trust"}
                    />
                    <RatingBar 
                      label="Capacity" 
                      value={rec.mode.weightCapacity} 
                      max={5}
                      highlight={selectedPriority === "weight"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const RatingBar = ({ 
  label, 
  value, 
  max, 
  highlight 
}: { 
  label: string; 
  value: number; 
  max: number;
  highlight: boolean;
}) => (
  <div>
    <div className="text-xs text-muted-foreground mb-1">{label}</div>
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div 
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < value 
              ? highlight 
                ? "bg-primary" 
                : "bg-muted-foreground/50"
              : "bg-secondary"
          }`}
        />
      ))}
    </div>
  </div>
);

export default SmartModeRecommender;
