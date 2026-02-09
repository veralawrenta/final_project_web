"use client";
import { useMeProfile } from "@/hooks/useProfile";
import {
  BadgeDollarSign,
  BedDouble,
  Building2,
  ChevronDown,
  DoorOpen,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  Wrench,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOut } from "next-auth/react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard/tenant",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Profile",
    href: "/dashboard/tenant/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    label: "Category",
    href: "/dashboard/tenant/category",
    icon: <Layers className="w-5 h-5" />,
  },
  {
    label: "Property Management",
    href: "/dashboard/tenant/property",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    label: "Room Management",
    href: "/dashboard/tenant/room",
    icon: <BedDouble className="w-5 h-5" />,
  },
  {
    label: "Maintenance",
    href: "/dashboard/tenant/maintenance",
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    label: "Seasonal Rates",
    href: "/dashboard/tenant/seasonal-rates",
    icon: <BadgeDollarSign className="w-5 h-5" />,
  },
  {
    label: "Setting",
    href: "/dashboard/tenant/setting",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { data: me } = useMeProfile();

  const isActive = (href: string) => {
    if (href === "/dashboard/tenant") {
      return pathname === href;
    };
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col border-r border-sidebar-border fixed md:relative h-screen z-40 md:z-auto",
          sidebarOpen
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full md:translate-x-0 md:w-20"
        )}
      >
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-4 mt-2">
          {sidebarOpen ? (
            <Image
              src="/images/nuit-name.png"
              width={180}
              height={180}
              alt="Website Logo"
              priority
              className="h-auto w-auto"
            />
          ) : (
            <DoorOpen className="w-6 h-6 text-slate-600" />
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-slate-600 text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-slate-300"
                )}
              >
                {item.icon}
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            size={sidebarOpen ? "default" : "icon"}
            onClick={handleLogout}
          >
            {sidebarOpen ? "Logout" : <span className="text-xs">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Dashboard</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-lg">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-600 flex items-center justify-center">
                  {me?.avatar ? (
                   
                    <Image
                      src={me.avatar}
                      alt="Avatar"
                      width={36}
                      height={36}
                      className="h-auto w-auto"
                    />
                  ) : (
                    <span className="text-primary-foreground font-semibold text-sm">
                      {me?.tenant?.tenantName[0]}
                    </span>
                  )}
                </div>

                <div className="hidden md:flex flex-col items-start">
                  <span className="text-xs font-semibold">{me?.tenant?.tenantName}</span>
                  <span className="text-xs text-muted-foreground">
                    {me?.role}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">{me?.tenant.tenantName}</p>
                <p className="text-xs text-muted-foreground">
                  {me?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/tenant/profile"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> View Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/tenant/profile/update"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Edit Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive gap-2">
                <Button onClick={handleLogout}>
                  <LogOut className="w-4 h-4 text-primary-foreground"/> Logout
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
