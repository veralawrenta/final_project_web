"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  className?: string;
}

const Footer = ({ className = "" }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "For Guests",
      links: [
        { label: "Browse Properties", href: "/property-detail-page" },
        { label: "Book a Stay", href: "/booking-page" },
        { label: "Guest Dashboard", href: "/user-dashboard" },
        { label: "Help Center", href: "/homepage" },
      ],
    },
    {
      title: "For Property Owners",
      links: [
        { label: "List Your Property", href: "/tenant-dashboard" },
        { label: "Owner Dashboard", href: "/tenant-dashboard" },
        { label: "Revenue Calculator", href: "/tenant-dashboard" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/" },
        { label: "Careers", href: "/" },
        { label: "Press", href: "/" },
        { label: "Blog", href: "/" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Contact Us", href: "/" },
        { label: "FAQs", href: "/" },
        { label: "Trust & Safety", href: "/" },
        { label: "Terms of Service", href: "/" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "/" },
    { name: "Twitter", icon: Twitter, href: "/" },
    { name: "Instagram", icon: Instagram, href: "/" },
  ];

  return (
    <footer
      className={`bg-[#F8FAFC] border-t border-slate-200 text-[#334155] ${className}`}
    >
      <div className="container mx-auto max-w-full px-6 lg:px-8 py-16 lg:ml-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-9 h-9">
                <Image
                  src="/images/nuit-logo.png"
                  fill
                  sizes="36px"
                  className="object-contain"
                  alt="Staynuit logo"
                />
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-900">
                Staynuit
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Connecting quality-conscious travelers with exceptional properties
              through intelligent hospitality and curated experiences.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-[#334155] hover:bg-[#C7E1FB] hover:border-[#C7E1FB] transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-6">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
              <Link href="/" className="hover:text-slate-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="hover:text-slate-600 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/" className="hover:text-slate-600 transition-colors">
                Accessibility
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                &copy; {currentYear} STAYNUIT. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
