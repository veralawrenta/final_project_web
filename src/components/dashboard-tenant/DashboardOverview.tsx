"use client";

import {
  Building2,
  Wrench,
  Star,
  User,
  Home,
  BedDouble,
  BadgeDollarSign,
  Layers,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { useMeProfile } from "@/hooks/useProfile";

export function DashboardOverview() {
  const router = useRouter();
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useDashboardOverview();
  const { data: me } = useMeProfile();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

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
      label: "Total Rooms",
      value: stats.totalRooms,
      icon: BedDouble,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Room Non-Availability",
      value: stats.totalRoomNonAvailability,
      icon: Wrench,
      color: "text-warning",
      bgColor: "bg-warning/10",
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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your properties.
        </p>
      </div>

      {/* Stats Cards - Adaptive Grid */}
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

      {/* Profile Snippet */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={profile.avatar || undefined}
                alt={profile.name}
              />
              <AvatarFallback className="bg-linear-to-br from-primary to-accent text-primary-foreground text-xl">
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
                    {stats.averageRating}
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
            onClick={() => handleNavigate("/dashboard/tenant/profile")}
          >
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-heading font-bold">
              {stats.totalProperties}
            </p>
            <p className="text-sm text-muted-foreground">Properties</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-heading font-bold">
              {stats.totalRooms}
            </p>
            <p className="text-sm text-muted-foreground">Total Rooms</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Desktop Grid 3, Tablet 2, Mobile 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => handleNavigate("/dashboard/tenant/category")}
          className="bg-card rounded-2xl border border-border p-6 text-left hover:border-primary/50 transition-colors group"
        >
          <Layers className="h-8 w-8 text-blue-500 mb-3" />
          <h3 className="font-heading font-semibold">Category</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage property categories
          </p>
        </button>

        <button
          onClick={() => handleNavigate("/dashboard/tenant/property")}
          className="bg-card rounded-2xl border border-border p-6 text-left hover:border-primary/50 transition-colors group"
        >
          <Building2 className="h-8 w-8 text-primary mb-3" />
          <h3 className="font-heading font-semibold">Property Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit or remove properties
          </p>
        </button>

        <button
          onClick={() => handleNavigate("/dashboard/tenant/room")}
          className="bg-card rounded-2xl border border-border p-6 text-left hover:border-primary/50 transition-colors group"
        >
          <BedDouble className="h-8 w-8 text-accent mb-3" />
          <h3 className="font-heading font-semibold">Room Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage rooms across properties
          </p>
        </button>

        <button
          onClick={() => handleNavigate("/dashboard/tenant/maintenance")}
          className="bg-card rounded-2xl border border-border p-6 text-left hover:border-primary/50 transition-colors group"
        >
          <Wrench className="h-8 w-8 text-warning mb-3" />
          <h3 className="font-heading font-semibold">Maintenance</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track room availability issues
          </p>
        </button>

        <button
          onClick={() => handleNavigate("/dashboard/tenant/seasonal-rates")}
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