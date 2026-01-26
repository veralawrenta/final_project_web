"use client";

import { LogOut, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaUser } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  //const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  //if (status === "loading") return null;

 // if (!session?.user.id || session?.user.role !== "USER") {
  //  router.push("/");
  //  return null;
 // }

  const navItems = [
    {
      label: "Profile",
      href: "/profile/user",
      icon: <FaUser size={20} />,
    },
    {
      label: "Settings",
      href: "/profile/user/setting",
      icon: <IoMdSettings size={20} />,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed md:static w-64 h-screen bg-accent/40 border-r border-border flex flex-col transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <Image
              src={"/images/nuit-name.png"}
              width={200}
              height={200}
              alt="Website Logo"
              loading="eager"
              priority
            />
          </Link>
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
