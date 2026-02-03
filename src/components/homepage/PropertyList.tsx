"use client";

import PaginationSection from "@/components/PaginationSection";
import { useGetAllProperties, useSearchProperties } from "@/hooks/useProperty";
import { fromDateString, normalizeLocalDate } from "@/lib/date/date";
import { useSearchParams } from "next/navigation";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import PropertyCardForm from "../property/PropertyCard";
import { PropertyType } from "@/types/property";

type SortBy = "name" | "price";
type SortOrder = "asc" | "desc";
type PropertyTypeFilter = "all" | PropertyType;

export default function PropertyListingPage() {
  const searchParams = useSearchParams();
  const cityId = searchParams.get("cityId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");

  const isSearchMode = Boolean(cityId && checkIn && checkOut && guests);
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>(["name", "price"]).withDefault("name")
  );

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault("asc")
  );

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [propertyType, setPropertyType] = useQueryState(
    "propertyType",
    parseAsStringEnum<PropertyTypeFilter>([
      "all",
      PropertyType.APARTMENT,
      PropertyType.HOTEL,
      PropertyType.VILLA,
      PropertyType.HOUSE,
    ]).withDefault("all")
  );

  const searchQuery = useSearchProperties({
    cityId: Number(cityId),
    checkIn: normalizeLocalDate(fromDateString(checkIn!)),
    checkOut: normalizeLocalDate(fromDateString(checkOut!)),
    totalGuests: Number(guests),
    page,
    sortBy,
    sortOrder,
    propertyType: propertyType === "all" ? undefined : propertyType,
  });

  const allQuery = useGetAllProperties({
    page,
    sortBy,
    sortOrder,
    propertyType: propertyType === "all" ? undefined : propertyType,
  });

  const { data, isLoading, error } = isSearchMode ? searchQuery : allQuery;

  if (isLoading) {
    return <p className="text-center py-20">Loading properties…</p>;
  }

  if (error) {
    return <p className="text-center py-20 text-destructive">Failed to load</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.data.map((property) => (
          <PropertyCardForm key={property.id} property={property} />
        ))}
      </div>
      {!!data?.meta && (
        <PaginationSection meta={data.meta} onChangePage={(p) => setPage(p)} />
      )}
    </div>
  );
}
