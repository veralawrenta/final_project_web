"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import {
  AlertTriangle,
  BadgeDollarSign,
  BookUser,
  Building2,
  Clock,
  MessageSquare,
  Reply,
  Star,
  User,
  Wrench
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SalesChart } from "./overview/SalesChart";
import TenantActivity from "./overview/TenantActivity";
import { formatCurrency } from "@/lib/price/currency";

export function DashboardOverview() {
  const router = useRouter();
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useDashboardOverview();
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    const formatted = now.toLocaleDateString("en-US", options);
    setFormattedDate(formatted);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/4 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="h-48 bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-3">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { profile, stats } = dashboardData;
  const initials =
    profile.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "TO";

  const statsDisplay = [
    {
      label: "Total Properties",
      value: stats.totalProperties,
      icon: Building2,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      label: "Active Transactions",
      value: stats.totalActiveTransactions,
      icon: BookUser,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: BadgeDollarSign,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    },
    ...(stats.averageRating !== null
      ? [
          {
            label: "Average Rating",
            value: stats.averageRating,
            icon: Star,
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-950/50",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header section left-aligned for dashboard visual hierarchy */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome back, {profile.name.split(" ")[0]}!
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening with your properties today.
            </p>
          </div>
          <div className="text-sm font-medium text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg self-start md:self-auto">
            {formattedDate || (
              <span className="inline-block h-4 w-24 bg-muted animate-pulse rounded" />
            )}
          </div>
        </div>

        {/* Notifications Section */}
        {(stats.totalPendingTransactions > 0 ||
          stats.totalPendingReviews > 0) && (
          <div className="space-y-3">
            {stats.totalPendingTransactions > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    You have {stats.totalPendingTransactions} pending
                    transaction
                    {stats.totalPendingTransactions > 1 ? "s" : ""}.
                  </p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                    Please review pending reservations promptly to lock in
                    bookings.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-700 bg-white hover:bg-amber-100 self-start sm:self-auto"
                  onClick={() => router.push("/dashboard/tenant/transactions")}
                >
                  <Clock className="h-4 w-4 mr-1.5" />
                  View Pending
                </Button>
              </div>
            )}

            {stats.totalPendingReviews > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-teal-900 dark:text-teal-200">
                    {stats.totalPendingReviews} new review
                    {stats.totalPendingReviews > 1 ? "s" : ""} received
                  </p>
                  <p className="text-xs text-teal-700/80 dark:text-teal-400/80 mt-0.5">
                    Guests have left feedback. Reply soon to boost your profile
                    response rate.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-teal-300 text-teal-700 bg-white hover:bg-teal-100 self-start sm:self-auto"
                  onClick={() => router.push("/dashboard/tenant/reviews")}
                >
                  <Reply className="h-4 w-4 mr-1.5" />
                  View Reviews
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsDisplay.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-5 border border-border shadow-sm"
            >
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section - Container div wrapper removed to prevent double-borders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart takes up 2 columns on large screens */}
          <div className="lg:col-span-2 container mx-auto">
            <SalesChart />
          </div>

          {/* Sidebar Activity Widget takes up 1 column */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col justify-between">
            <TenantActivity />

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4 text-xs text-muted-foreground hover:text-foreground"
            >
              View all audit logs
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border">
                <AvatarImage
                  src={profile.avatar || undefined}
                  alt={profile.name}
                />
                <AvatarFallback className="bg-muted text-muted-foreground text-lg font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg leading-none">
                  {profile.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Property Owner
                </p>
                {stats.averageRating !== null && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">
                      {stats?.averageRating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Rating Avg
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto shadow-sm"
              onClick={() => router.push("/dashboard/tenant/profile")}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/dashboard/tenant/property")}
            className="bg-card rounded-xl border border-border p-5 text-left transition-all shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group"
          >
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit mb-4 text-slate-600 dark:text-slate-300">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              Property Management
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add new listings, adjust pricing, and edit property details.
            </p>
          </button>

          <button
            onClick={() => router.push("/dashboard/tenant/maintenance")}
            className="bg-card rounded-xl border border-border p-5 text-left transition-all shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group"
          >
            <div className="p-2 bg-orange-50 dark:bg-orange-950/40 rounded-lg w-fit mb-4 text-orange-600 dark:text-orange-400">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              Maintenance Requests
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Track ongoing repairs, updates, and resolution status logs.
            </p>
          </button>

          <button
            onClick={() => router.push("/dashboard/tenant/seasonal-rates")}
            className="bg-card rounded-xl border border-border p-5 text-left transition-all shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer group sm:col-span-2 lg:col-span-1"
          >
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg w-fit mb-4 text-emerald-600 dark:text-emerald-400">
              <BadgeDollarSign className="h-5 w-5" />
            </div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              Seasonal Rates
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Configure dynamic surge pricing or holiday discounts.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
