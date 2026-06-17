"use client";

import { LogOut, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { FaCalendarCheck, FaStar } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface SidebarProps {
  firstName: string;
  lastName: string;
  isVerified: boolean;
}

export default function Sidebar({
  firstName,
  lastName,
  isVerified,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") return null;

  if (!session?.user.id || session?.user.role !== "USER") {
    router.push("/");
    return null;
  }

  const navItems = [
    {
      label: "My Profile",
      href: "/profile/user",
      icon: <FaUser size={18} />,
    },
    {
      label: "My Bookings",
      href: "/profile/user/transactions",
      icon: <FaCalendarCheck size={20} />,
    },
    {
      label: "My Reviews",
      href: "/profile/user/reviews",
      icon: <FaStar size={20} />,
    },
    {
      label: "Settings",
      href: "/profile/user/setting",
      icon: <IoMdSettings size={20} />,
    },
  ];

  const isActive = (href: string) => pathname === href;

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "B";
    const firstInitial = firstName?.charAt(0) ?? "";
    const lastInitial = lastName?.charAt(0) ?? "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed md:static w-64 h-screen bg-accent border-r border-border flex flex-col transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Image
                src="/images/nuit-logo.png"
                alt="Logo"
                width={40}
                height={40}
              />
            </div>
            <span className="font-heading font-bold text-3xl">staynuit.</span>
          </Link>
        </div>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={session.user.avatar || "/placeholder.svg"}
                alt="Profile picture"
              />
              <AvatarFallback>
                {getInitials(firstName, lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {firstName} {lastName}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {isVerified ? (
                  <span className="text-xs text-green-600 font-medium">
                    Verified
                  </span>
                ) : (
                  <span className="text-xs text-destructive font-medium">
                    Not Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-slate-600 text-primary-foreground"
                  : "text-slate-700 hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
