"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { useMeProfile } from "@/hooks/useProfile";
import {
  AlertTriangle,
  BadgeDollarSign,
  BedDouble,
  BookUser,
  Building2,
  Clock,
  Layers,
  MessageSquare,
  Reply,
  Star,
  User,
  Wrench
} from "lucide-react";
import { useRouter } from "next/navigation";

export function DashboardOverview() {
  const router = useRouter();
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useDashboardOverview();
  const { data: me } = useMeProfile();

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
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Active Transactions",
      value: stats.totalActiveTransactions,
      icon: BookUser,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Total Revenue",
      value: stats.totalRevenue,
      icon: BadgeDollarSign,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    ...(stats.averageRating !== null
      ? [
          {
            label: "Average Rating",
            value: stats.averageRating,
            icon: Star,
            color: "text-gold",
            bgColor: "bg-gold/10",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your properties.
        </p>
      </div>

      {stats.totalPendingTransactions > 0 && (
        <div className="flex items-center gap-3 p-4 bg-gold/10 border border-gold/30 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-gold" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              You have {stats.totalPendingTransactions} pending transaction
              {stats.totalPendingTransactions > 1 ? "s" : ""}.
            </p>
            <p className="text-xs text-muted-foreground">
              Please review and confirm pending reservations promptly.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-gold/50 text-gold hover:bg-gold/10 shrink-0"
            onClick={() => router.push("/dashboard/tenant/transactions")}
          >
            <Clock className="h-4 w-4 mr-1" />
            View Pending
          </Button>
        </div>
      )}
      {stats.totalPendingReviews > 0 && (
        <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/30 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {stats.totalPendingReviews} new review
              {stats.totalPendingReviews > 1 ? "s" : ""} received
            </p>
            <p className="text-xs text-muted-foreground">
              Guest{stats.totalPendingReviews > 1 ? "s have" : " has"} left
              feedback. Reply to show you care!
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10 shrink-0"
            onClick={() => router.push("/dashboard/tenant/reviews")}
          >
            <Reply className="h-4 w-4 mr-1" />
            View Reviews
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsDisplay.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl p-4 md:p-6 border border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${stat.bgColor} ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-heading font-bold">
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={profile.avatar || undefined}
                alt={profile.name}
              />
              <AvatarFallback className="bg-accent text-slate-600 text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-heading font-semibold text-lg">
                {profile.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {me?.role || "Property Owner"}
              </p>
              {stats.averageRating !== null && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="text-sm font-medium">
                    {stats?.averageRating}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    average rating
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.push("/dashboard/tenant/profile")}
          >
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-heading font-bold">
              {stats.totalProperties}
            </p>
            <p className="text-sm text-muted-foreground">Properties</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading font-bold">
              {stats.totalActiveTransactions}
            </p>
            <p className="text-sm text-muted-foreground">Active Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading font-bold">
              {stats.totalRevenue}
            </p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Desktop Grid 3, Tablet 2, Mobile 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/dashboard/tenant/category")}
          className="bg-card rounded-2xl border border-border p-6 text-left hover:border-primary/50 transition-colors group"
        >
          <Layers className="h-8 w-8 text-blue-500 mb-3" />
          <h3 className="font-heading font-semibold">Category</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage property categories
          </p>
        </button>

        <button
          onClick={() => router.push("/dashboard/tenant/property")}
          className="bg-card rounded-2xl border border-border p-6 text-left hover:border-primary/50 transition-colors group"
        >
          <Building2 className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-heading font-semibold">Property Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit or remove properties
          </p>
        </button>

        <button
          onClick={() => router.push("/dashboard/tenant/room")}
          className="bg-card rounded-2xl border border-border p-6 text-left hover:border-primary/50 transition-colors group"
        >
          <BedDouble className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-heading font-semibold">Room Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage rooms across properties
          </p>
        </button>

        <button
          onClick={() => router.push("/dashboard/tenant/maintenance")}
          className="bg-card rounded-2xl border border-border p-6 text-left hover:border-primary/50 transition-colors group"
        >
          <Wrench className="h-8 w-8 text-warning mb-3" />
          <h3 className="font-heading font-semibold">Maintenance</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track room availability issues
          </p>
        </button>

        <button
          onClick={() => router.push("/dashboard/tenant/seasonal-rates")}
          className="bg-card rounded-2xl border border-border p-6 text-left hover:border-primary/50 transition-colors group"
        >
          <BadgeDollarSign className="h-8 w-8 text-green-500 mb-3" />
          <h3 className="font-heading font-semibold">Seasonal Rates</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage pricing by season
          </p>
        </button>
      </div>
    </div>
  );
}
