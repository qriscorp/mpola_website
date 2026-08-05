"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  CreditCard,
  FileText,
  Wallet,
  AlertTriangle,
  TrendingUp,
  Activity,
  PieChart as PieIcon,
  ClipboardList,
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

const PIE_COLORS = ["#2BB5A0", "#C4A55A", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"];

function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "short" });
}

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
  const { data: stats, isLoading } = useAdminStats();
  const { data: loans } = useAdminLoans();
  const { data: applications } = useAdminApplications();

  const monthlyTrend = (stats?.monthly_trend ?? []).map((m) => ({
    ...m,
    label: monthLabel(m.month),
  }));
  const userGrowth = (stats?.user_growth ?? []).map((m) => ({
    ...m,
    label: monthLabel(m.month),
  }));
  const loanTypeMix = stats?.loan_type_mix ?? [];

  const applicationStatusBreakdown = [
    { status: "Pending", count: applications?.filter((a) => a.status === "pending").length ?? 0 },
    { status: "Funded", count: applications?.filter((a) => a.status === "funded").length ?? 0 },
    { status: "Completed", count: applications?.filter((a) => a.status === "completed").length ?? 0 },
    { status: "Rejected", count: applications?.filter((a) => a.status === "rejected").length ?? 0 },
    { status: "Defaulted", count: applications?.filter((a) => a.status === "defaulted").length ?? 0 },
  ];

  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: stats?.users.total?.toLocaleString() ?? "0",
      sub: `${stats?.users.borrowers ?? 0} borrowers · ${stats?.users.lenders ?? 0} lenders`,
      color: "text-[#2BB5A0]",
      bg: "bg-[#E8F8F5] dark:bg-[#2BB5A0]/10",
    },
    {
      icon: CreditCard,
      label: "Active Loans",
      value: stats?.loans.active?.toLocaleString() ?? "0",
      sub: `${stats?.loans.completed ?? 0} completed · ${stats?.loans.defaulted ?? 0} defaulted`,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: FileText,
      label: "Pending Applications",
      value: stats?.applications.pending?.toLocaleString() ?? "0",
      sub: `${stats?.applications.total ?? 0} total submitted`,
      color: "text-[#C4A55A]",
      bg: "bg-[#F5F0E0] dark:bg-[#C4A55A]/10",
    },
    {
      icon: Wallet,
      label: "Total Loan Volume",
      value: stats ? formatCurrency(stats.loans.total_volume) : "UGX 0",
      sub: `${stats ? formatCurrency(stats.loans.total_repaid) : "UGX 0"} repaid`,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
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
            Mpola Platform Analytics
          </p>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs w-fit">
          <Activity className="h-3 w-3 mr-1 animate-pulse" /> Live
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-white dark:bg-gray-900">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1B2B3A] dark:text-white">
                {isLoading ? "…" : stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              <p className="text-[11px] text-muted-foreground mt-2">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Monthly Trend + Loan Type Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-900 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                  Disbursed vs. Collected
                </h2>
                <p className="text-xs text-muted-foreground">
                  Last 6 months
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#2BB5A0]">
                  {formatCurrency(stats?.platform.total_wallet_balance ?? 0)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Total wallet balance
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {monthlyTrend.every((m) => m.disbursed === 0 && m.collected === 0) ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No loan activity recorded yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={monthlyTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    vertical={false}
                  />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="disbursed"
                    name="Disbursed"
                    fill="#2BB5A0"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    dataKey="collected"
                    name="Collected"
                    stroke="#C4A55A"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#C4A55A" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-[#2BB5A0]" />
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                Loan Type Mix
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">Funded &amp; completed loans</p>
          </CardHeader>
          <CardContent>
            {loanTypeMix.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No funded loans yet.
              </p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={loanTypeMix}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="type"
                    >
                      {loanTypeMix.map((entry, index) => (
                        <Cell key={entry.type} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {loanTypeMix.map((d, i) => (
                    <div key={d.type} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-muted-foreground capitalize">{d.type}</span>
                      <span className="ml-auto font-medium">{d.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: User Growth + Application Status */}
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
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="gradBorrowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2BB5A0" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2BB5A0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLenders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
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
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#C4A55A]" />
              <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
                Application Status Breakdown
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={applicationStatusBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
                <YAxis
                  dataKey="status"
                  type="category"
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  width={70}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Applications" fill="#C4A55A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Platform Health + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-900">
          <CardHeader>
            <h2 className="font-semibold text-[#1B2B3A] dark:text-white">
              Platform Health
            </h2>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Repayment Rate</span>
                <span className="text-sm font-bold text-[#2BB5A0]">
                  {stats?.platform.repayment_rate ?? 0}%
                </span>
              </div>
              <Progress value={stats?.platform.repayment_rate ?? 0} className="h-2 [&>div]:bg-[#2BB5A0]" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Default Rate</span>
                <span className="text-sm font-bold text-red-500">
                  {stats?.platform.default_rate ?? 0}%
                </span>
              </div>
              <Progress value={stats?.platform.default_rate ?? 0} className="h-2 [&>div]:bg-red-500" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">KYC Completion</span>
                <span className="text-sm font-bold text-[#C4A55A]">
                  {stats?.platform.kyc_completion_rate ?? 0}%
                </span>
              </div>
              <Progress value={stats?.platform.kyc_completion_rate ?? 0} className="h-2 [&>div]:bg-[#C4A55A]" />
            </div>
            <Link
              href="/admin/settings"
              className="flex items-center justify-between pt-2 border-t dark:border-gray-800 text-sm hover:text-[#2BB5A0] transition-colors"
            >
              <span className="text-muted-foreground">Standing offers awaiting review</span>
              <span className="font-bold text-[#1B2B3A] dark:text-white">
                {stats?.platform.pending_offer_templates ?? 0}
              </span>
            </Link>
          </CardContent>
        </Card>

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
                      {app.borrower_name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {app.reference_number} · {formatCurrency(app.amount)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      app.status === "pending"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : app.status === "funded"
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                          : app.status === "completed" || app.status === "approved"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
              {applications?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No applications yet
                </p>
              )}
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
                        {loan.borrower_name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        #{loan.reference} · {formatCurrency(loan.amount)}
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
