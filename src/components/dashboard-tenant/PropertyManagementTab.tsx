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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteProperty, useGetTenantProperties } from "@/hooks/useProperty";
import { formatCurrency } from "@/lib/price/currency";
import { TenantProperty } from "@/types/property";
import { Edit, Eye, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";

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
  const [debounceSearch] = useDebounceValue(search, 500);
  const [isDeletingProperty, setIsDeletingProperty] = useState<number | null>(
    null
  );

  const { data: tenantProperties, isPending } = useGetTenantProperties({
    search: debounceSearch,
    page,
    take: 3,
  });

  const deletePropertyMutation = useDeleteProperty();

  const handleDelete = () => {
    if (isDeletingProperty) {
      deletePropertyMutation.mutate(isDeletingProperty);
      setIsDeletingProperty(null);
    }
  };

  const handleEditProperty = (propertyId: number): void => {
    onEditProperty(propertyId);
  };

  const deletingProperty: TenantProperty | undefined =
    tenantProperties?.data.find(
      (p: TenantProperty) => p.id === isDeletingProperty
    );

  const onChangePage = (page: number) => {
    setPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Property Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all your properties in one place
          </p>
        </div>
        <Button className="gap-2" onClick={onAddProperty}>
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {isPending && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      )}

      {/* Properties List */}
      {!isPending && tenantProperties && (
        <>
          <div className="grid gap-4">
            {tenantProperties.data.map((property: TenantProperty) => (
              <div
                key={property.id}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-48 h-40 sm:h-auto relative bg-muted flex items-center justify-center">
                    {property.propertyImages &&
                    property.propertyImages.length > 0 ? (
                      <img
                        src={
                          property.propertyImages.find((img) => img.isCover)
                            ?.urlImages || property.propertyImages[0].urlImages
                        }
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MapPin className="h-12 w-12 text-muted-foreground/30" />
                    )}
                    <Badge
                      variant={
                        property.status === "PUBLISHED"
                          ? "default"
                          : "secondary"
                      }
                      className={`absolute top-2 left-2 ${
                        property.status === "DRAFT"
                          ? "bg-warning text-warning-foreground"
                          : ""
                      }`}
                    >
                      {property.status}
                    </Badge>
                  </div>
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-bold font-mono">
                            ID: {property.id}
                          </span>
                          {property.category && (
                            <span className="px-2 py-0.5 bg-accent/10 text-accent rounded text-xs font-medium">
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
                            {property.totalRooms === 1 ? "room" : "rooms"}{" "}
                            available
                          </p>
                        )}

                        {property.status === "DRAFT" && (
                          <p className="text-sm text-warning mt-2">
                            ⚠️ Complete property setup to publish
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

            {tenantProperties.data.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <p className="text-muted-foreground">
                  {search
                    ? "No properties found matching your search"
                    : "No properties found"}
                </p>
                {!search && (
                  <Button className="mt-4 gap-2" onClick={onAddProperty}>
                    <Plus className="h-4 w-4" />
                    Add Your First Property
                  </Button>
                )}
              </div>
            )}
          </div>

          {Math.ceil(tenantProperties.meta.total / tenantProperties.meta.take) >
            1 && (
            <PaginationSection
              onChangePage={onChangePage}
              meta={tenantProperties.meta}
            />
          )}
        </>
      )}
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
            <p className="text-destructive font-medium">
              ⚠️ This action will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>All rooms associated with this property</li>
              <li>All booking records and history</li>
              <li>All maintenance schedules and records</li>
              <li>All seasonal rate configurations</li>
              <li>All property images</li>
            </ul>
            <p className="text-sm font-medium">This action cannot be undone.</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending
                ? "Deleting..."
                : "Delete Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
