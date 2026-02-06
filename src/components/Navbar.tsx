"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, X, UserCircle } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar = () => {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItemStyles = `transition-all duration-300 font-semibold text-sm ${
    isScrolled
      ? "text-[#334155] hover:text-slate-900"
      : "text-[#334155] hover:opacity-70"
  }`;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-sm py-2 border-b border-slate-100"
          : "bg-slate-200/80 py-2"
      }`}
    >
      <div className="container mx-auto max-w-full flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-9 w-9 transition-transform group-hover:scale-105 ml-12">
            <Image
              src="/images/nuit-logo.png"
              fill
              sizes="36px"
              alt="Staynuit Logo"
              className="object-contain"
              loading="eager"
            />
          </div>
          <h1
            className={`text-2xl font-bold tracking-tight transition-colors duration-300 text-[#334155]`}
          >
            staynuit<span className="text-[#C7E1FB]">.</span>
          </h1>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {session?.user ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center pl-4 border-l border-slate-200">
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-3 group cursor-pointer">
                      <div className="text-right leading-tight hidden sm:block">
                        <p className="text-sm font-bold text-[#334155]">
                          {session.user.email?.split("@")[0]}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden group-hover:border-[#C7E1FB] transition-all">
                        <UserCircle
                          size={26}
                          className="text-slate-400 group-hover:text-[#334155] transition-colors"
                        />
                      </div>
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="w-56 mt-2 shadow-xl border-slate-100"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none text-[#334155]">
                          {session.user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs leading-none text-slate-500">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile/user"
                        className="cursor-pointer font-medium"
                      >
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/"
                        className="cursor-pointer font-medium"
                      >
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-red-600 font-bold focus:bg-red-50 focus:text-red-600 cursor-pointer"
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login/tenant">
                <Button
                  variant="ghost"
                  className="rounded-full px-6 font-bold text-[#334155] hover:bg-[#C7E1FB]/20 transition-all"
                >
                  List your property
                </Button>
              </Link>

              <Link href="/auth/login/user">
                <Button className="rounded-full px-8 font-bold shadow-md active:scale-95 bg-[#334155] hover:bg-slate-800 text-white transition-all">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </nav>
        <button
          className="md:hidden p-2 text-[#334155]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-slate-100 p-6 flex flex-col gap-4 shadow-xl md:hidden">
          {session?.user ? (
            <>
              <Link
                href="/profile/user"
                className="text-lg font-bold text-[#334155]"
              >
                Profile
              </Link>

              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-sm font-bold text-[#334155]">
                  {session.user.email?.split("@")[0]}
                </p>
                <button
                  onClick={() => signOut()}
                  className="text-xs uppercase font-bold text-red-500"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login/tenant"
                className="text-lg font-bold text-[#334155]"
              >
                List your property
              </Link>
              <Link
                href="/auth/login/user"
                className="text-lg font-bold text-[#334155]"
              >
                Sign In
              </Link>
            </>
          )}

          <hr className="border-slate-100" />
          <p className="text-sm text-slate-400 font-medium">
            Experience travel better with Staynuit.
          </p>
        </div>
      )}
    </header>
  );
};

export default Navbar;
