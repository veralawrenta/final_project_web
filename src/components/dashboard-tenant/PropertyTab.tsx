"use client";
import { useDeleteProperty, useGetTenantProperties } from "@/hooks/useProperty";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Edit, Eye, MapPin, Plus, Search, Trash2, Building2 } from "lucide-react";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Skeleton } from "../ui/skeleton";
import PaginationSection from "../PaginationSection";

const PropertyManagementTab = () => {
  const router = useRouter();
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [isDeletingProperty, setIsDeletingProperty] = useState<number | null>(
    null
  );

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [debounceSearch] = useDebounceValue(search, 500);

  const { data: tenantProperties, isPending } = useGetTenantProperties({
    search: debounceSearch,
    page,
    take: 3,
  });
  const deleteMutation = useDeleteProperty();

  const properties = tenantProperties?.data ?? [];

  const handleAddProperty = () => {
    router.push("/dashboard/tenant/property/create");
  };

  const handleEditProperty = (propertyId: string) => {
    router.push(`/dashboard/tenant/property/${propertyId}/edit`);
  };

  const handleDelete = () => {
    if (isDeletingProperty === null) return;
    deleteMutation.mutate(isDeletingProperty, {
      onSuccess: () => {
        setIsDeletingProperty(null);
      },
    });
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber-100 text-amber-700 border-amber-200",
    PUBLISHED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const onChangePage = (page: number) => {
    setPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
            Property Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all your properties in one place
          </p>
        </div>
        <Button onClick={handleAddProperty} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-background focus-visible:ring-primary"
        />
      </div>

      <div className="grid gap-4">
        {/* Professional Skeleton Loader */}
        {isPending &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-xl flex overflow-hidden h-[144px]">
              <Skeleton className="w-48 h-full rounded-none" />
              <div className="flex-1 p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}

        {/* Empty State - Professional & Actionable */}
        {!isPending && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed rounded-3xl bg-muted/30">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold">No properties found</h3>
            <p className="text-muted-foreground text-center max-w-xs mt-2">
              {search 
                ? `We couldn't find any properties matching "${search}". Try a different search term.` 
                : "You haven't listed any properties yet. Start by adding your first property to the platform."}
            </p>
            {search ? (
              <Button 
                variant="outline" 
                className="mt-6" 
                onClick={() => setSearch("")}
              >
                Clear search query
              </Button>
            ) : (
              <Button className="mt-6" onClick={handleAddProperty}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Property
              </Button>
            )}
          </div>
        )}

        {/* Property List */}
        {!isPending && properties.map((property: any) => {
          const coverImage =
            property.propertyImages?.find((i: any) => i.isCover)?.url ||
            property.propertyImages?.[0]?.url ||
            "/placeholder.jpg";

          return (
            <div
              key={property.id}
              className="group border rounded-xl bg-card overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row">
                <img
                  src={coverImage}
                  alt={property.name}
                  className="w-full sm:w-48 h-48 sm:h-36 object-cover"
                />
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                          statusColors[property.propertyStatus]
                        }`}
                      >
                        {property.propertyStatus}
                      </span>

                      <h3 className="font-bold text-lg mt-1 group-hover:text-primary transition-colors">
                        {property.name}
                      </h3>

                      <div className="flex items-center gap-1 text-muted-foreground text-sm mt-0.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {property.address}
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                         <p className="text-sm font-medium bg-secondary/50 px-2 py-1 rounded-md">
                          {property.rooms?.length || 0} Rooms
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => router.push(`/dashboard/tenant/property/${property.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleEditProperty(property.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                onClick={() => setIsDeletingProperty(property.id)}
                                disabled={property.hasActiveBookings}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {property.hasActiveBookings && (
                            <TooltipContent side="top">
                              <p className="text-xs">Active bookings prevent deletion</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!!tenantProperties?.meta && !isPending && properties.length > 0 && (
        <div className="mt-8 flex justify-center">
          <PaginationSection
            meta={tenantProperties.meta}
            onChangePage={onChangePage}
          />
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeletingProperty !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setIsDeletingProperty(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Are you sure you want to delete this property? This action is permanent.</p>
              <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-xl text-sm space-y-1">
                <p className="font-bold text-destructive uppercase text-[10px] tracking-widest">Permanent Loss of:</p>
                <p className="text-muted-foreground">• All associated room listings</p>
                <p className="text-muted-foreground">• Pricing history and availability calendars</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90 rounded-xl"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Property"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PropertyManagementTab;