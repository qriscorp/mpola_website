"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CreditCard,
  FileText,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  PieChart as PieIcon,
} from "lucide-react";
import {
  useAdminStats,
  useAdminLoans,
  useAdminApplications,
} from "@/hooks/use-admin";
import { formatCurrency } from "@/lib/format";
import {
  BarChart,
  Bar,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
} from "recharts";

/* ─── chart data ────────────────────────────────────────────── */
const revenueData = [
  { month: "Jan", revenue: 18.4, disbursed: 42.0, interest: 6.2 },
  { month: "Feb", revenue: 22.1, disbursed: 48.5, interest: 7.8 },
  { month: "Mar", revenue: 19.8, disbursed: 38.2, interest: 5.9 },
  { month: "Apr", revenue: 28.6, disbursed: 55.1, interest: 9.4 },
  { month: "May", revenue: 32.4, disbursed: 62.0, interest: 10.8 },
  { month: "Jun", revenue: 27.2, disbursed: 51.4, interest: 8.6 },
  { month: "Jul", revenue: 31.8, disbursed: 58.9, interest: 10.1 },
  { month: "Aug", revenue: 35.2, disbursed: 64.3, interest: 11.7 },
  { month: "Sep", revenue: 29.4, disbursed: 52.8, interest: 9.0 },
  { month: "Oct", revenue: 33.6, disbursed: 60.1, interest: 11.2 },
  { month: "Nov", revenue: 37.8, disbursed: 68.4, interest: 12.6 },
  { month: "Dec", revenue: 41.2, disbursed: 74.0, interest: 13.8 },
];

const loanPortfolioData = [
  { name: "Personal", value: 42, color: "#2BB5A0" },
  { name: "Business", value: 28, color: "#C4A55A" },
  { name: "Education", value: 15, color: "#6366f1" },
  { name: "Agricultural", value: 10, color: "#f59e0b" },
  { name: "Emergency", value: 5, color: "#ef4444" },
];

const userGrowthData = [
  { month: "Jul", borrowers: 820, lenders: 124 },
  { month: "Aug", borrowers: 1040, lenders: 156 },
  { month: "Sep", borrowers: 1280, lenders: 198 },
  { month: "Oct", borrowers: 1560, lenders: 248 },
  { month: "Nov", borrowers: 1920, lenders: 310 },
  { month: "Dec", borrowers: 2480, lenders: 396 },
];

const repaymentTrendData = [
  { week: "W1", onTime: 94, late: 4, defaulted: 2 },
  { week: "W2", onTime: 96, late: 3, defaulted: 1 },
  { week: "W3", onTime: 93, late: 5, defaulted: 2 },
  { week: "W4", onTime: 97, late: 2, defaulted: 1 },
  { week: "W5", onTime: 95, late: 3, defaulted: 2 },
  { week: "W6", onTime: 98, late: 1.5, defaulted: 0.5 },
  { week: "W7", onTime: 96, late: 2.5, defaulted: 1.5 },
  { week: "W8", onTime: 97.5, late: 1.8, defaulted: 0.7 },
];

const regionData = [
  { region: "Central", loans: 485, amount: 142 },
  { region: "Western", loans: 312, amount: 89 },
  { region: "Eastern", loans: 278, amount: 74 },
  { region: "Northern", loans: 196, amount: 52 },
  { region: "Kampala", loans: 624, amount: 186 },
];

/* ─── custom tooltip ────────────────────────────────────────── */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-lg rounded-lg p-3 text-xs">
      <p className="font-semibold text-[#1B2B3A] dark:text-white mb-1">
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats } = useAdminStats();
  const { data: loans } = useAdminLoans();
  const { data: applications } = useAdminApplications();

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats?.totalUsers?.toLocaleString() ?? "0",
      change: "+12%",
      up: true,
      color: "text-[#2BB5A0]",
      bg: "bg-[#E8F8F5] dark:bg-[#2BB5A0]/10",
      spark: [32, 40, 36, 50, 49, 60, 72],
    },
    {
      icon: CreditCard,
      label: "Active Loans",
      value: stats?.activeLoans?.toLocaleString() ?? "0",
      change: "+8%",
      up: true,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      spark: [18, 22, 26, 30, 28, 35, 38],
    },
    {
      icon: FileText,
      label: "Pending Applications",
      value: stats?.pendingApplications?.toLocaleString() ?? "0",
      change: "+23%",
      up: true,
      color: "text-[#C4A55A]",
      bg: "bg-[#F5F0E0] dark:bg-[#C4A55A]/10",
      spark: [8, 12, 10, 18, 22, 26, 34],
    },
    {
      icon: Wallet,
      label: "Total Disbursed",
      value: stats ? formatCurrency(stats.totalDisbursed) : "UGX 0",
      change: "+15%",
      up: true,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      spark: [120, 145, 160, 190, 210, 240, 280],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Mpola Platform Analytics &mdash; Real-time overview
          </p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs w-fit">
          <Activity className="h-3 w-3 mr-1 animate-pulse" /> Live
        </Badge>
      </div>

      {/* KPI Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="bg-white dark:bg-gray-900 overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${stat.up ? "text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800" : "text-red-600 border-red-200"}`}
                >
                  {stat.up ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              {/* Sparkline */}
              <div className="mt-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.spark.map((v, i) => ({ v, i }))}>
                    <defs>
                      <linearGradient
                        id={`spark-${stat.label}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2BB5A0"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#2BB5A0"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#2BB5A0"
                      strokeWidth={1.5}
                      fill={`url(#spark-${stat.label})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Revenue + Loan Portfolio Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-900 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                  Revenue & Disbursements
                </h2>
                <p className="text-xs text-muted-foreground">
                  Monthly breakdown (Millions UGX)
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#2BB5A0]">
                  {stats ? formatCurrency(stats.monthlyRevenue) : "UGX 0"}
                </p>
                <p className="text-[10px] text-muted-foreground">This month</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="disbursed"
                  name="Disbursed"
                  fill="#2BB5A0"
                  radius={[4, 4, 0, 0]}
                  opacity={0.3}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#2BB5A0"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  dataKey="interest"
                  name="Interest"
                  stroke="#C4A55A"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#C4A55A" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-[#2BB5A0]" />
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                Loan Portfolio Mix
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={loanPortfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {loanPortfolioData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {loanPortfolioData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: User Growth + Repayment Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#2BB5A0]" />
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                User Growth
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Borrowers vs Lenders (last 6 months)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient
                    id="gradBorrowers"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2BB5A0" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2BB5A0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLenders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="borrowers"
                  name="Borrowers"
                  stroke="#2BB5A0"
                  fill="url(#gradBorrowers)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="lenders"
                  name="Lenders"
                  stroke="#6366f1"
                  fill="url(#gradLenders)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Repayment Performance
            </h2>
            <p className="text-xs text-muted-foreground">
              Weekly breakdown (%)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={repaymentTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  domain={[0, 100]}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="onTime"
                  name="On Time"
                  stackId="a"
                  fill="#2BB5A0"
                  radius={[0, 0, 0, 0]}
                />
                <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" />
                <Bar
                  dataKey="defaulted"
                  name="Defaulted"
                  stackId="a"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Regional + Health Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-900 lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Regional Lending Distribution
            </h2>
            <p className="text-xs text-muted-foreground">
              Loans and amount by region (Millions UGX)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  horizontal={false}
                />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis
                  dataKey="region"
                  type="category"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  width={70}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="loans"
                  name="Loans"
                  fill="#2BB5A0"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="amount"
                  name="Amount (M)"
                  fill="#C4A55A"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Platform Health
            </h2>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Repayment Rate
                </span>
                <span className="text-sm font-bold text-[#2BB5A0]">96.8%</span>
              </div>
              <Progress value={96.8} className="h-2 [&>div]:bg-[#2BB5A0]" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Default Rate
                </span>
                <span className="text-sm font-bold text-red-500">
                  {stats?.defaultRate ?? 0}%
                </span>
              </div>
              <Progress
                value={stats?.defaultRate ?? 0}
                className="h-2 [&>div]:bg-red-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  KYC Completion
                </span>
                <span className="text-sm font-bold text-[#C4A55A]">87.5%</span>
              </div>
              <Progress value={87.5} className="h-2 [&>div]:bg-[#C4A55A]" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Platform Uptime
                </span>
                <span className="text-sm font-bold text-[#2BB5A0]">99.9%</span>
              </div>
              <Progress value={99.9} className="h-2 [&>div]:bg-[#2BB5A0]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Recent Applications
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications?.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800"
                >
                  <div>
                    <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                      {app.borrowerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {app.reference} · {formatCurrency(app.amount)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      app.status === "submitted"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : app.status === "reviewing_offers"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                          : app.status === "approved"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {app.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                Loans Requiring Attention
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loans
                ?.filter((l) => l.status === "overdue")
                .map((loan) => (
                  <div
                    key={loan.id}
                    className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1B2B3A] dark:text-white">
                        {loan.borrowerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {loan.reference} · {formatCurrency(loan.amount)}
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-xs">
                      Overdue
                    </Badge>
                  </div>
                ))}
              {loans?.filter((l) => l.status === "overdue").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No loans requiring attention
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
