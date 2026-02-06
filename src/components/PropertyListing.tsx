"use client";
import PaginationSection from "@/components/PaginationSection";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllProperties, useSearchProperties } from "@/hooks/useProperty";
import { fromDateString, normalizeLocalDate } from "@/lib/date/date";
import { cn } from "@/lib/utils";
import { PropertyType } from "@/types/property";
import {
  SlidersHorizontal,
  X
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyCardForm from "./property/PropertyCard";

type PropertyTypeFilter = "all" | PropertyType;
type SortBy = "name" | "price";
type SortOrder = "asc" | "desc";

const ITEMS_PER_PAGE = 8;

const propertyTypeLabels: Record<PropertyTypeFilter, string> = {
  all: "All Types",
  VILLA: "Villa",
  HOTEL: "Hotel",
  APARTMENT: "Apartment",
  HOUSE: "House",
};

const PropertyListingComponent= () => {
  const searchParams = useSearchParams();
  const cityId = searchParams.get("cityId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");
  const isSearchMode = !!(cityId && checkIn && checkOut && guests);

  const [propertyType, setPropertyType] = useState<PropertyTypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [isSearchMode, propertyType, sortBy, sortOrder]);

  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useSearchProperties(
    {
      cityId: Number(cityId) || 0,
      checkIn: checkIn ? normalizeLocalDate(fromDateString(checkIn)) : new Date(),
      checkOut: checkOut ? normalizeLocalDate(fromDateString(checkOut)) : new Date(),
      totalGuests: Number(guests) || 1,
      page: currentPage,
      take: ITEMS_PER_PAGE,
      sortBy,
      sortOrder,
      propertyType: propertyType === "all" ? undefined : propertyType,
    },
    {
      enabled: isSearchMode, // Only fetch when in search mode
    }
  );

  const {
    data: allPropertiesData,
    isLoading: allPropertiesLoading,
    error: allPropertiesError,
  } = useGetAllProperties(
    {
      page: currentPage,
      take: ITEMS_PER_PAGE,
      sortBy,
      sortOrder,
      propertyType: propertyType === "all" ? undefined : propertyType,
    },
    {
      enabled: !isSearchMode,
    }
  );

  const data = isSearchMode ? searchData : allPropertiesData;
  const isLoading = isSearchMode ? searchLoading : allPropertiesLoading;
  const error = isSearchMode ? searchError : allPropertiesError;

  const totalPages = data?.meta ? Math.ceil(data.meta.total / ITEMS_PER_PAGE) : 0;
  
  const handlePropertyTypeChange = (value: string) => {
    setPropertyType(value as PropertyTypeFilter);
    setCurrentPage(1);
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value as SortBy);
    setCurrentPage(1);
  };

  const handleSortOrderChange = (value: string) => {
    setSortOrder(value as SortOrder);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setPropertyType("all");
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const hasActiveFilters = propertyType !== "all" || sortBy !== "name" || sortOrder !== "asc";

  const activeFilterCount = [
    propertyType !== "all",
    sortBy !== "name",
    sortOrder !== "asc",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <div className="bg-linear-to-b from-accent/5 to-white border-b-slate-400 border-b-2">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">
            {isSearchMode ? (
              <>
                Properties in{" "}
                {data?.data?.[0]?.city?.name || "your destination"}
              </>
            ) : (
              "Find your perfect place to stay"
            )}
          </h1>
          <p className="text-muted-foreground">
            {isSearchMode ? (
              <>
                {checkIn && checkOut && (
                  <>
                    {fromDateString(checkIn).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {" - "}
                    {fromDateString(checkOut).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </>
                )}
                {" • "}
                {guests} {Number(guests) === 1 ? "Guest" : "Guests"}
                {data?.meta && ` • ${data.meta.total} properties found`}
              </>
            ) : (
              <>
                Discover amazing places to stay
                {data?.meta && ` • ${data.meta.total} properties available`}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            variant="outline"
            className="sm:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <div
            className={cn(
              "flex flex-col sm:flex-row gap-4 flex-1",
              showFilters ? "block" : "hidden sm:flex"
            )}
          >
            <Select
              value={propertyType}
              onValueChange={handlePropertyTypeChange}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(propertyTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">
                  {sortBy === "price" ? "Low to High" : "A to Z"}
                </SelectItem>
                <SelectItem value="desc">
                  {sortBy === "price" ? "High to Low" : "Z to A"}
                </SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse"
              >
                <div className="aspect-4/3 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load properties</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.data?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-6">
              {isSearchMode
                ? "Try adjusting your search criteria or filters"
                : "No properties available at the moment"}
            </p>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline">
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {!isLoading && !error && data?.data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {data.data.map((property) => (
                <PropertyCardForm key={property.id} property={property} />
              ))}
            </div>

            {totalPages > 1 && data.meta && (
              <PaginationSection
                meta={data.meta}
                onChangePage={(page) => setCurrentPage(page)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default PropertyListingComponent;