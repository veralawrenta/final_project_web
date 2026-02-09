import PropertyListingComponent from "@/components/PropertyListing";
import { Suspense } from "react";

const PropertyListingPage = () => {
  return (
    <Suspense fallback={<div />}>
      <PropertyListingComponent />
      </Suspense>
  );
};

export default PropertyListingPage;
