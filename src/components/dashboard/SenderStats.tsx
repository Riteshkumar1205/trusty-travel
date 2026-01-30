import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, TrendingUp, Clock, CheckCircle2, Star, 
  Shield, IndianRupee, Heart
} from "lucide-react";

const SenderStats = () => {
  const stats = {
    totalParcels: 12,
    delivered: 10,
    inTransit: 2,
    pending: 0,
    totalSpent: 4850,
    avgRating: 4.8,
    trustScore: 88,
    favoriteRoute: "Delhi → Mumbai",
  };

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-glass border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/20">
                <Package className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalParcels}</p>
                <p className="text-xs text-muted-foreground">Total Parcels</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-success/20">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inTransit}</p>
                <p className="text-xs text-muted-foreground">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-electric/20">
                <IndianRupee className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{stats.totalSpent}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust & Rating Card */}
      <Card className="card-glass border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Your Trust Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{stats.trustScore}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <p className="text-sm text-muted-foreground">Trust Score</p>
              <Progress value={stats.trustScore} className="mt-2 h-2" />
            </div>

            <div className="p-4 rounded-xl bg-secondary/30 text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Star className="h-5 w-5 text-primary fill-primary" />
                <span className="text-2xl font-bold">{stats.avgRating}</span>
                <span className="text-sm text-muted-foreground">/5</span>
              </div>
              <p className="text-sm text-muted-foreground">Avg Rating Given</p>
              <div className="flex justify-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.floor(stats.avgRating)
                        ? "text-primary fill-primary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
              <span className="text-sm">Most Used Route</span>
            </div>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
              {stats.favoriteRoute}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm">Success Rate</span>
            </div>
            <span className="text-success font-semibold">
              {Math.round((stats.delivered / stats.totalParcels) * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tip Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Boost Your Trust Score</h4>
              <p className="text-xs text-muted-foreground">
                Rate your Saarthis after delivery and verify your phone number to increase your trust score and get priority matching!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SenderStats;
