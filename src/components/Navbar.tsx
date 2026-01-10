"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, X, UserCircle, LogOut, Settings } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

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

  // Reusable link styles
  const navItemStyles = `transition-all duration-300 font-medium ${
    isScrolled ? "text-slate-700 hover:text-cyan-600" : "text-white hover:text-white/80"
  }`;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto max-w-7xl flex items-center justify-between px-6">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8 transition-transform group-hover:scale-110">
             <Image
                src="/images/logos.png"
                fill
                alt="Staynuit Logo"
                className="object-contain"
                loading="eager"
              />
          </div>
          <h1 className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${
            isScrolled ? "text-slate-900" : "text-primary"
          }`}>
            Staynuit<span className="text-cyan-500">.</span>
          </h1>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8">
          {session?.user ? (
            <div className="flex items-center gap-6">
               <Link href="/dashboard" className={navItemStyles}>Dashboard</Link>
               
               <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="text-right">
                    <p className={`text-xs font-bold leading-none ${isScrolled ? "text-slate-900" : "text-primary"}`}>
                      {session.user.email?.split('@')[0]}
                    </p>
                    <button 
                      onClick={() => signOut()} 
                      className="text-[10px] uppercase tracking-widest font-bold text-blue-500 hover:text-blue-600"
                    >
                      Logout
                    </button>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-blue-500 flex items-center justify-center overflow-hidden">
                    <UserCircle size={24} className="text-slate-400" />
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login/tenant">
                <Button
                  variant="ghost"
                  className={`rounded-full px-6 font-bold transition-all ${
                    isScrolled ? "text-slate-600 hover:bg-slate-50" : "text-primary hover:bg-accent"
                  }`}
                >
                  List your property
                </Button>
              </Link>

              <Link href="/auth/login/user">
                <Button
                  className={`rounded-full px-8 font-bold transition-all shadow-lg active:scale-95 ${
                    isScrolled 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "bg-white text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* MOBILE TOGGLE */}
        <button 
          className="md:hidden p-2 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X size={28} className={isScrolled ? "text-slate-900" : "text-primary"} />
          ) : (
            <Menu size={28} className={isScrolled ? "text-slate-900" : "text-primary"} />
          )}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t border-slate-100 p-6 flex flex-col gap-4 shadow-xl md:hidden animate-in slide-in-from-top duration-300">
          <Link href="/auth/login/tenant" className="text-lg font-semibold text-slate-900">List your property</Link>
          <Link href="/auth/login/user" className="text-lg font-semibold text-slate-900">Sign In</Link>
          <hr />
          <p className="text-sm text-slate-500 italic">Experience travel better with Staynuit.</p>
        </div>
      )}
    </header>
  );
};

export default Navbar;