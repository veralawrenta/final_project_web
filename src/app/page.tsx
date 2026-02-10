import { auth } from "@/auth";
import Footer from "@/components/Footer";
import HeroSection from "@/components/homepage/HeroSection";
import { SearchBar } from "@/components/homepage/SearchBar";

import Navbar from "@/components/Navbar";
import PropertyListingComponent from "@/components/PropertyListing";
import { redirect } from "next/navigation";

const Homepage = async () => {
  const session = await auth();
  if (session?.user?.role === "TENANT") redirect("/dashboard/tenant");
  
  return (
    <div>
      <Navbar />
      <HeroSection />
      <SearchBar />
      <PropertyListingComponent />
      <Footer />
    </div>
  );
};

export default Homepage;
