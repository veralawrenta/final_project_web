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
import { Building2, Home, Hotel, LayoutGrid, Palmtree, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import PropertyCardForm from "./property/PropertyCard";
import {
  parseAsInteger,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";

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

const propertyTypeConfig: Record<PropertyTypeFilter, { label: string; icon: any }> = {
  all: { label: "All", icon: LayoutGrid },
  VILLA: { label: "Villa", icon: Palmtree },
  HOTEL: { label: "Hotel", icon: Hotel },
  APARTMENT: { label: "Apartment", icon: Building2 },
  HOUSE: { label: "House", icon: Home },
};

const PropertyListingComponent = () => {
  const [cityId] = useQueryState("cityId", parseAsInteger);
  const [checkIn] = useQueryState("checkIn");
  const [checkOut] = useQueryState("checkOut");
  const [guests] = useQueryState("guests", parseAsInteger.withDefault(1));
  const [propertyType, setPropertyType] = useQueryState(
    "propertyType",
    parseAsStringEnum<PropertyTypeFilter>([
      "all",
      PropertyType.VILLA,
      PropertyType.HOUSE,
      PropertyType.APARTMENT,
      PropertyType.HOTEL,
    ]).withDefault("all")
  );
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>(["name", "price"]).withDefault("name")
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault("asc")
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1))

  const [showFilters, setShowFilters] = useState(false);

  const isSearchMode = !!cityId && !!checkIn && !!checkOut && !!guests;
  const hasActiveFilters =
    propertyType !== "all" || sortBy !== "name" || sortOrder !== "asc";

  const activeFilterCount = [
    propertyType !== "all",
    sortBy !== "name",
    sortOrder !== "asc",
  ].filter(Boolean).length;


  const searchQuery = useSearchProperties(
    {
      cityId: cityId ?? 0,
      checkIn: checkIn ? normalizeLocalDate(fromDateString(checkIn)) : new Date(),
      checkOut: checkOut ? normalizeLocalDate(fromDateString(checkOut)) : new Date(),
      totalGuests: guests,
      page,
      take: ITEMS_PER_PAGE,
      sortBy,
      sortOrder,
      propertyType: propertyType === "all" ? undefined : propertyType,
    },
    { enabled: isSearchMode }
  );

  const allQuery = useGetAllProperties(
    {
      page,
      take: ITEMS_PER_PAGE,
      sortBy,
      sortOrder,
      propertyType: propertyType === "all" ? undefined : propertyType,
    },
    { enabled: !isSearchMode }
  );

  const { data, isLoading, error } = isSearchMode ? searchQuery : allQuery;
  const handleClearFilters = () => {
    setPropertyType("all");
    setSortBy("name");
    setSortOrder("asc");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePropertyTypeChange = (value: PropertyTypeFilter) => {
    setPropertyType(value);
    setPage(1);
  };

  const handleSortByChange = (value: SortBy) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: SortOrder) => {
    setSortOrder(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-linear-to-b from-accent/5 to-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">
            {isSearchMode
              ? `Properties in ${data?.data?.[0]?.city?.name ?? "your destination"}`
              : "Find your perfect place to stay"}
          </h1>

          <p className="text-muted-foreground">
            {isSearchMode && checkIn && checkOut && (
              <>
                {checkIn} – {checkOut} • {guests} {guests === 1 ? "Guest" : "Guests"}
                {data?.meta && ` • ${data.meta.total} ${data.meta.total === 1 ? "property" : "properties"} found`}
              </>
            )}
            {!isSearchMode && data?.meta && (
              <>{data.meta.total} {data.meta.total === 1 ? "property" : "properties"} available</>
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          className="sm:hidden mb-4 w-full"
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
            "flex flex-col sm:flex-row gap-4 mb-6",
            showFilters ? "flex" : "hidden sm:flex"
          )}
        >
          <Select value={propertyType} onValueChange={handlePropertyTypeChange}>
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

          <Select value={sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Sort By" />
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
              <SelectItem value="asc">A to Z</SelectItem>
              <SelectItem value="desc">Z to A</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading properties...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <p className="text-destructive mb-2">Failed to load properties</p>
              <p className="text-sm text-muted-foreground">Please try again later</p>
            </div>
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            {data.data.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">No properties found</p>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  {hasActiveFilters && (
                    <Button onClick={handleClearFilters}>Clear Filters</Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {data.data.map((property) => (
                    <PropertyCardForm key={property.id} property={property} />
                  ))}
                </div>

                <PaginationSection meta={data.meta} onChangePage={handlePageChange} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyListingComponent;