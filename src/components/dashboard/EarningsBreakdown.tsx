import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown,
  Calendar,
  IndianRupee,
  Download,
  Filter,
  ChevronRight,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Transaction {
  id: string;
  date: string;
  type: "earning" | "payout" | "bonus" | "deduction";
  description: string;
  amount: number;
  status: "completed" | "pending" | "processing";
  parcelId?: string;
  route?: string;
}

interface EarningsBreakdownProps {
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingPayout: number;
  transactions: Transaction[];
}

const mockTransactions: Transaction[] = [
  {
    id: "t1",
    date: "2026-01-31",
    type: "earning",
    description: "Parcel delivery - Delhi to Patna",
    amount: 520,
    status: "completed",
    parcelId: "p1",
    route: "Delhi → Patna"
  },
  {
    id: "t2",
    date: "2026-01-30",
    type: "earning",
    description: "Parcel delivery - Mumbai to Pune",
    amount: 350,
    status: "completed",
    parcelId: "p2",
    route: "Mumbai → Pune"
  },
  {
    id: "t3",
    date: "2026-01-29",
    type: "bonus",
    description: "Weekly performance bonus",
    amount: 200,
    status: "completed"
  },
  {
    id: "t4",
    date: "2026-01-28",
    type: "payout",
    description: "Bank transfer - HDFC ****4521",
    amount: -2500,
    status: "completed"
  },
  {
    id: "t5",
    date: "2026-01-27",
    type: "earning",
    description: "Parcel delivery - Bangalore to Chennai",
    amount: 680,
    status: "completed",
    parcelId: "p3",
    route: "Bangalore → Chennai"
  },
  {
    id: "t6",
    date: "2026-01-26",
    type: "deduction",
    description: "Platform fee",
    amount: -85,
    status: "completed"
  },
  {
    id: "t7",
    date: "2026-01-25",
    type: "earning",
    description: "Express delivery bonus",
    amount: 150,
    status: "completed",
    parcelId: "p4",
    route: "Delhi → Jaipur"
  },
  {
    id: "t8",
    date: "2026-01-24",
    type: "payout",
    description: "UPI transfer",
    amount: -1800,
    status: "processing"
  }
];

const weeklyData = [
  { day: "Mon", earnings: 520, parcels: 2 },
  { day: "Tue", earnings: 350, parcels: 1 },
  { day: "Wed", earnings: 680, parcels: 3 },
  { day: "Thu", earnings: 420, parcels: 2 },
  { day: "Fri", earnings: 890, parcels: 4 },
  { day: "Sat", earnings: 750, parcels: 3 },
  { day: "Sun", earnings: 320, parcels: 1 },
];

const monthlyData = [
  { month: "Aug", earnings: 18500 },
  { month: "Sep", earnings: 22300 },
  { month: "Oct", earnings: 19800 },
  { month: "Nov", earnings: 24100 },
  { month: "Dec", earnings: 21500 },
  { month: "Jan", earnings: 24580 },
];

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "hsl(var(--primary))",
  },
  parcels: {
    label: "Parcels",
    color: "hsl(var(--electric))",
  },
};

const EarningsBreakdown = ({
  totalEarnings = 24580,
  thisMonthEarnings = 4200,
  pendingPayout = 1850,
  transactions = mockTransactions,
}: Partial<EarningsBreakdownProps>) => {
  const [timeFilter, setTimeFilter] = useState("this-month");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredTransactions = transactions.filter(t => {
    if (typeFilter === "all") return true;
    return t.type === typeFilter;
  });

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "earning":
        return <ArrowUpRight className="w-4 h-4 text-success" />;
      case "payout":
        return <ArrowDownRight className="w-4 h-4 text-primary" />;
      case "bonus":
        return <TrendingUp className="w-4 h-4 text-gold" />;
      case "deduction":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
    }
  };

  const getTypeBadge = (type: Transaction["type"]) => {
    const variants: Record<Transaction["type"], string> = {
      earning: "bg-success/10 text-success border-success/20",
      payout: "bg-primary/10 text-primary border-primary/20",
      bonus: "bg-gold/10 text-gold border-gold/20",
      deduction: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return variants[type];
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20">Pending</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Processing</Badge>;
    }
  };

  const weeklyTotal = weeklyData.reduce((sum, d) => sum + d.earnings, 0);
  const weeklyParcels = weeklyData.reduce((sum, d) => sum + d.parcels, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">
              ₹{totalEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Earnings</div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-electric" />
              <span className="text-xs text-success flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8%
              </span>
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">
              ₹{thisMonthEarnings.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-gold" />
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">
              ₹{pendingPayout.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Pending Payout</div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-5 h-5 text-success" />
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">
              ₹{weeklyTotal.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">This Week ({weeklyParcels} parcels)</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="weekly" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <TabsContent value="weekly">
          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Weekly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={weeklyData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="earnings" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card className="card-glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="earnings" 
                    stroke="hsl(var(--primary))" 
                    fill="url(#earningsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction History */}
      <Card className="card-glass">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Transaction History</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] h-8">
                  <Filter className="w-3 h-3 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="earning">Earnings</SelectItem>
                  <SelectItem value="payout">Payouts</SelectItem>
                  <SelectItem value="bonus">Bonuses</SelectItem>
                  <SelectItem value="deduction">Deductions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short"
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${getTypeBadge(transaction.type)}`}>
                          {getTypeIcon(transaction.type)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{transaction.description}</div>
                          {transaction.route && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {transaction.route}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${getTypeBadge(transaction.type)}`}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono font-semibold ${
                        transaction.amount >= 0 ? "text-success" : "text-foreground"
                      }`}>
                        {transaction.amount >= 0 ? "+" : ""}₹{Math.abs(transaction.amount).toLocaleString()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Load More */}
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">
              View All Transactions
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <span>Request Payout</span>
          <span className="text-xs text-muted-foreground">Min ₹500</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2">
          <Download className="w-5 h-5 text-primary" />
          <span>Download Statement</span>
          <span className="text-xs text-muted-foreground">PDF / Excel</span>
        </Button>
      </div>
    </div>
  );
};

export default EarningsBreakdown;
