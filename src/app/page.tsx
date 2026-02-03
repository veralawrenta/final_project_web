import { auth } from "@/auth";
import Footer from "@/components/Footer";
import HeroSection from "@/components/homepage/HeroSection";
import PromoCarousel from "@/components/homepage/PromoCarousel";
import { SearchBar } from "@/components/homepage/SearchBar";

import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";

const Homepage = async () => {
  const session = await auth();
  if (session?.user.role !== "USER") redirect("/dashboard/tenant");
  return (
    <div>
      <Navbar />
      <HeroSection />
      <SearchBar />
      <PromoCarousel />
      <Footer />
    </div>
  );
};

export default Homepage;
