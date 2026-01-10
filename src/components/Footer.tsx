"use client";

import { Facebook, HousePlus, Icon, Instagram, Twitter } from "lucide-react";
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
    <footer className={`bg-primary text-primary-foreground ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center w-9 h-9 bg-primary-foreground rounded-lg">
                <Image
                src="/images/logos.png"
                width={15}
                height={5}
                alt="website logo"
                >

                </Image>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-2xl leading-none">
                  Staynuit
                </span>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground opacity-80 mb-4">
              Connecting quality-conscious travelers with exceptional properties
              through intelligent hospitality.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-primary-foreground bg-opacity-10 hover:bg-opacity-20 transition-all duration-200"
                  >
                    <Icon className="w-6 h-6 text-primary" />
                  </a>
                );
              })}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-heading font-semibold text-base mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary-foreground opacity-80 hover:opacity-100 hover:text-secondary transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-primary-foreground border-opacity-20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-primary-foreground opacity-80">
              <Link
                href="/"
                className="hover:opacity-100 transition-opacity duration-200"
              >
                Privacy Policy
              </Link>
              <span className="hidden md:inline">•</span>
              <Link
                href="/"
                className="hover:opacity-100 transition-opacity duration-200"
              >
                Cookie Policy
              </Link>
              <span className="hidden md:inline">•</span>
              <Link
                href="/"
                className="hover:opacity-100 transition-opacity duration-200"
              >
                Accessibility
              </Link>
            </div>
            <p className="text-sm text-primary-foreground opacity-80">
              © {currentYear} Staynuit. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
