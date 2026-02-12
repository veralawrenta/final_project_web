import Navbar from "@/components/Navbar";
import PropertyListingComponent from "@/components/PropertyListing";
import { Suspense } from "react";

const PropertyListingPage = () => {
  return (
    <Suspense fallback={<div />}>
      <Navbar />
      <PropertyListingComponent />
    </Suspense>
  );
};

export default PropertyListingPage;
