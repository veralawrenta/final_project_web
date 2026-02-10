"use client";
import PaginationSection from "@/components/PaginationSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteProperty, useGetTenantProperties } from "@/hooks/useProperty";
import { formatCurrency } from "@/lib/price/currency";
import { PropertyType, TenantProperty } from "@/types/property";
import {
  Edit,
  Eye,
  MapPin,
  Plus,
  Search,
  Trash2,
  Filter,
  ArrowUpDown,
  X,
} from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import Image from "next/image"; // Added for the branded loader

type SortBy = "name" | "price";
type SortOrder = "asc" | "desc";

interface PropertyManagementTabProps {
  onAddProperty: () => void;
  onEditProperty: (propertyId: number) => void;
  onViewProperty: (propertyId: number) => void;
}

export default function PropertyManagementTab({
  onAddProperty,
  onEditProperty,
  onViewProperty,
}: PropertyManagementTabProps) {
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [propertyType, setPropertyType] = useQueryState(
    "propertyType",
    parseAsStringEnum<PropertyType>([
      PropertyType.VILLA,
      PropertyType.HOUSE,
      PropertyType.APARTMENT,
      PropertyType.HOTEL,
    ])
  );
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>(["name", "price"]).withDefault("name")
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault("asc")
  );
  const [debounceSearch] = useDebounceValue(search, 500);
  const [isDeletingProperty, setIsDeletingProperty] = useState<number | null>(
    null
  );

  const { data: tenantProperties, isPending } = useGetTenantProperties({
    search: debounceSearch,
    page,
    take: 3,
    propertyType: propertyType ?? undefined,
    sortBy,
    sortOrder,
  });

  const deletePropertyMutation = useDeleteProperty();

  const handleDelete = () => {
    if (!isDeletingProperty) return;
    deletePropertyMutation.mutate(isDeletingProperty, {
      onSuccess: () => {
        setIsDeletingProperty(null);
      },
    });
  };

  const handleEditProperty = (propertyId: number): void => {
    onEditProperty(propertyId);
  };

  const onChangePage = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (page !== 1) {
      setPage(1);
    }
  };

  const handleClearAll = () => {
    setSearch("");
    setPropertyType(null);
    setSortBy("name");
    setSortOrder("asc");
    setPage(1);
  };

  const handleFilterChange = (value: string) => {
    if (value === "all") {
      setPropertyType(null);
    } else {
      setPropertyType(value as PropertyType);
    }
    setPage(1);
  };

  const deletingProperty: TenantProperty | undefined =
    tenantProperties?.data.find(
      (p: TenantProperty) => p.id === isDeletingProperty
    );
  const hasActiveFilters =
    search.trim() !== "" ||
    propertyType !== null ||
    sortBy !== "name" ||
    sortOrder !== "asc";
  const hasResults = tenantProperties?.data && tenantProperties.data.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
            Property Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all your properties in one place
          </p>
        </div>
        <Button className="gap-2 shadow-sm" onClick={onAddProperty}>
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={propertyType ?? "all"} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={PropertyType.VILLA}>Villa</SelectItem>
            <SelectItem value={PropertyType.HOUSE}>House</SelectItem>
            <SelectItem value={PropertyType.APARTMENT}>Apartment</SelectItem>
            <SelectItem value={PropertyType.HOTEL}>Hotel</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={(value) => {
            const [newSortBy, newSortOrder] = value.split("-") as [SortBy, SortOrder];
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name: A-Z</SelectItem>
            <SelectItem value="name-desc">Name: Z-A</SelectItem>
            <SelectItem value="price-asc">Price: Low-High</SelectItem>
            <SelectItem value="price-desc">Price: High-Low</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleClearAll}
            title="Clear all filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!isPending && tenantProperties?.meta && (
        <div className="text-sm text-muted-foreground">
          {tenantProperties.meta.total}{" "}
          {tenantProperties.meta.total === 1 ? "property" : "properties"}
          {hasActiveFilters && " found"}
        </div>
      )}
      {isPending && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 w-full border-2 border-dashed rounded-4xl bg-muted/5">
          <div className="relative h-16 w-16 animate-pulse">
            <Image
              src="/images/nuit-logo.png"
              fill
              alt="Loading..."
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-muted-foreground">Fetching properties...</p>
          </div>
        </div>
      )}

      {!isPending && (
        <>
          {!hasResults ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed rounded-3xl bg-muted/30">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No properties found</h3>
              <p className="text-muted-foreground text-center max-w-xs mt-2">
                {hasActiveFilters
                  ? "No properties match your filters. Try adjusting your criteria."
                  : "You haven't added any properties yet. Start by creating your first property."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearAll} className="mt-4 gap-2">
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {tenantProperties.data.map((property: TenantProperty) => (
                  <div
                    key={property.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-40 sm:h-auto relative bg-muted flex items-center justify-center">
                        {property.propertyImages && property.propertyImages.length > 0 ? (
                          <img
                            src={
                              property.propertyImages.find((img) => img.isCover)
                                ?.urlImages || property.propertyImages[0].urlImages
                            }
                            alt={property.name}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MapPin className="h-12 w-12 text-muted-foreground/30" />
                        )}
                      </div>

                      <div className="flex-1 p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex gap-2 mb-1 flex-wrap">
                              {property.category && (
                                <span className="px-2 py-0.5 bg-accent/10 text-primary rounded text-xs font-medium">
                                  {property.category}
                                </span>
                              )}
                              <span className="px-2 py-0.5 bg-secondary rounded text-xs font-medium capitalize">
                                {property.propertyType}
                              </span>
                            </div>

                            <h3 className="font-heading font-semibold text-lg">
                              {property.name}
                            </h3>

                            <div className="flex items-center gap-1 text-muted-foreground mt-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span className="text-sm">{property.city}</span>
                            </div>
                            {property.lowestPrice !== null && (
                              <p className="text-lg font-bold mt-2">
                                {formatCurrency(property.lowestPrice)}
                                <span className="text-sm font-normal text-muted-foreground">
                                  {" "}
                                  / night
                                </span>
                              </p>
                            )}
                            {property.totalRooms > 0 && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {property.totalRooms}{" "}
                                {property.totalRooms === 1 ? "room" : "rooms"} available
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 flex-wrap justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Property"
                              onClick={() => onViewProperty(property.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Property"
                              onClick={() => handleEditProperty(property.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              title="Delete Property"
                              onClick={() => setIsDeletingProperty(property.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {tenantProperties.meta && (
                <PaginationSection
                  onChangePage={onChangePage}
                  meta={tenantProperties.meta}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Delete Confirmation remains unchanged */}
      <AlertDialog
        open={!!isDeletingProperty}
        onOpenChange={() => setIsDeletingProperty(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              Are you sure you want to delete "
              <strong>{deletingProperty?.name}</strong>"?
            </AlertDialogDescription>
            <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg mt-2">
              <p className="text-destructive text-xs font-bold uppercase tracking-wider mb-2">
                ⚠️ Permanent Action
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>All rooms and associated images</li>
                <li>All booking records and history</li>
                <li>Maintenance and seasonal rate rules</li>
              </ul>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending ? "Deleting..." : "Delete Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}