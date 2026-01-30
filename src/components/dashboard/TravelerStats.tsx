import { 
  TrendingUp, 
  Package, 
  Route, 
  Star,
  Wallet,
  Shield
} from "lucide-react";

interface TravelerStatsProps {
  stats: {
    totalEarnings: number;
    thisMonthEarnings: number;
    totalJourneys: number;
    totalParcels: number;
    trustScore: number;
    successRate: number;
  };
}

const TravelerStats = ({ stats }: TravelerStatsProps) => {
  const statCards = [
    {
      label: "Total Earnings",
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      subValue: `₹${stats.thisMonthEarnings.toLocaleString()} this month`,
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Journeys Completed",
      value: stats.totalJourneys.toString(),
      subValue: "Across India",
      icon: Route,
      color: "text-electric",
      bgColor: "bg-electric/10",
    },
    {
      label: "Parcels Delivered",
      value: stats.totalParcels.toString(),
      subValue: `${stats.successRate}% success rate`,
      icon: Package,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Trust Score",
      value: stats.trustScore.toFixed(1),
      subValue: "Verified Saarthi",
      icon: Star,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div
          key={stat.label}
          className="card-glass p-4 hover:border-primary/30 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            {stat.label === "Trust Score" && (
              <div className="badge-verified text-xs">
                <Shield className="w-3 h-3" />
              </div>
            )}
          </div>
          
          <div className="font-mono text-2xl font-bold text-foreground mb-1">
            {stat.value}
          </div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-success" />
            {stat.subValue}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TravelerStats;
