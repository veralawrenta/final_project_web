"use client";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  Filter,
  LayoutGrid,
  ImageIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Room } from "@/types/room";
import { useDeleteRoom, useGetTenantRooms } from "@/hooks/useRoom";
import PaginationSection from "@/components/PaginationSection";
import { useGetTenantProperties } from "@/hooks/useProperty";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/price/currency";
import Image from "next/image";

const RoomManagementTab = () => {
  const router = useRouter();
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sortBy, setSortBy] = useQueryState("sortBy", { defaultValue: "name" });
  const [sortOrder, setSortOrder] = useQueryState("sortOrder", { defaultValue: "asc" });
  const [propertyType, setPropertyType] = useQueryState("propertyType", { defaultValue: "all" });
  
  const [debounceSearch] = useDebounceValue(search, 500);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);

  const { data: tenantProperties } = useGetTenantProperties();
  const { data: tenantRooms, isPending } = useGetTenantRooms({
    page,
    take: 6,
    search: debounceSearch,
    sortBy,
    sortOrder,
    propertyType: propertyType !== "all" ? propertyType : undefined,
  });
  const deleteRoomMutation = useDeleteRoom();

  const onChangePage = (page: number) => {
    setPage(page);
  };

  const handleAddRoom = () => {
    router.push("/dashboard/tenant/room/create");
  };

  const handleEditRoom = (room: Room) => {
    router.push(`/dashboard/tenant/room/update/${room.id}`);
  };

  const handleDelete = () => {
    if (deleteRoom?.id) {
      deleteRoomMutation.mutate(deleteRoom.id);
      setDeleteRoom(null);
    }
  };

  const handleClearAll = () => {
    setSearch("");
    setPropertyType("all");
    setSortBy("name");
    setSortOrder("asc");
    setPage(1);
  };

  const filteredRooms = tenantRooms?.data || [];

  const hasActiveFilters = 
    search !== "" || 
    propertyType !== "all" ||
    sortBy !== "name" ||
    sortOrder !== "asc";
  const hasApiResults = tenantRooms?.data && tenantRooms.data.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
            Room Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor rooms across your property portfolio.
          </p>
        </div>
        <Button className="gap-2 shadow-sm" onClick={handleAddRoom}>
          <Plus className="h-4 w-4" />
          Add New Room
        </Button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by room name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Property Type Filter */}
        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="HOTEL">Hotel</SelectItem>
            <SelectItem value="APARTMENT">Apartment</SelectItem>
            <SelectItem value="VILLA">Villa</SelectItem>
            <SelectItem value="HOUSE">House</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="basePrice">Price</SelectItem>
            <SelectItem value="createdAt">Date Created</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
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

      {!isPending && tenantRooms?.data && (
        <div className="text-sm text-muted-foreground">
          {filteredRooms.length}{" "}
          {filteredRooms.length === 1 ? "room" : "rooms"}
          {hasActiveFilters && " found"}
        </div>
      )}

      <div className="space-y-4">
        {isPending && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 w-full border-2 border-dashed rounded-3xl bg-muted/5">
            <div className="relative h-16 w-16 animate-pulse">
               <Image
                src="/images/nuit-logo.png"
                width={300}
                height={300}
                alt="Loading..."
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col items-center space-y-2">
               <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
               <p className="text-xs font-medium text-muted-foreground">Fetching your rooms...</p>
            </div>
          </div>
        )}
        {!isPending && filteredRooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed rounded-3xl bg-muted/30">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No rooms found</h3>
            <p className="text-muted-foreground text-center max-w-xs mt-2">
              {!hasApiResults && search
                ? `No rooms match "${search}". Try a different search term.`
                : hasActiveFilters
                ? "No rooms match your current filters."
                : "You haven't added any rooms yet. Start by creating your first listing."}
            </p>
            {hasActiveFilters ? (
              <Button 
                variant="outline" 
                className="mt-6 gap-2" 
                onClick={handleClearAll}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            ) : (
              <Button className="mt-6" onClick={handleAddRoom}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Room
              </Button>
            )}
          </div>
        )}

        {!isPending && filteredRooms.map((room) => {
          const coverImage = room.roomImages?.find((img: any) => img.isCover)?.urlImages;
          const firstImage = room.roomImages?.[0]?.urlImages;
          const displayImage = coverImage || firstImage;

          return (
            <div
              key={room.id}
              className="group bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all duration-200"
            >
              <div className="hidden md:flex items-center gap-6">
                <div className="h-24 w-32 rounded-xl overflow-hidden bg-muted shrink-0">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={room.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-heading font-bold text-xl leading-tight">{room.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Property: {room.property?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {room.property?.city?.name} • {room.property?.category?.name}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{room.totalGuests} Guests</span>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold tracking-tight text-foreground">
                      {formatCurrency(room.basePrice)}
                    </span>
                    <span className="text-[12px] text-muted-foreground font-medium">/night</span>
                  </div>

                  <div className="flex gap-1 group-hover:text-primary transition-opacity">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => handleEditRoom(room)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteRoom(room)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="md:hidden space-y-4">
                <div className="flex gap-4">
                  <div className="h-20 w-24 rounded-xl overflow-hidden bg-muted shrink-0">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={room.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-lg leading-tight mb-1 truncate">{room.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {room.property?.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {room.property?.city?.name} • {room.property?.category?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{room.totalGuests}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold tracking-tight text-foreground">
                        {formatCurrency(room.basePrice)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">/night</span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleEditRoom(room)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteRoom(room)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {!!tenantRooms?.meta && !isPending && filteredRooms.length > 0 && (
        <div className="pt-4">
          <PaginationSection
            meta={tenantRooms.meta}
            onChangePage={onChangePage}
          />
        </div>
      )}

      <AlertDialog open={!!deleteRoom} onOpenChange={() => setDeleteRoom(null)}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Room</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
                Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteRoom?.name}"</span>? 
                This will remove the room from <span className="font-semibold text-foreground">{deleteRoom?.property?.name}.</span>
            </AlertDialogDescription>
            <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg">
                <p className="text-destructive text-xs font-bold uppercase tracking-wider mb-2">
                  Permanent Action
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">• All images will be removed</li>
                </ul>
              </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90 rounded-xl"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomManagementTab;