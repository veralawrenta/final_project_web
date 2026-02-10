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
  ChevronRight,
  Bed,
  MapPin,
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

  const handleViewRoom = (roomId: number) => {
    router.push(`/dashboard/tenant/room/${roomId}`);
  };

  const handleEditRoom = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    router.push(`/dashboard/tenant/room/update/${room.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, room: Room) => {
    e.stopPropagation();
    setDeleteRoom(room);
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
              onClick={() => handleViewRoom(room.id)}
              className="group bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer"
            >
              <div className="hidden md:flex items-center gap-6">
                <div className="relative h-28 w-40 rounded-xl overflow-hidden bg-muted shrink-0 ring-1 ring-border group-hover:ring-primary/30 transition-all">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={room.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-1 space-y-2.5 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-xl leading-tight group-hover:text-primary transition-colors truncate">
                        {room.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Bed className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="text-sm text-muted-foreground font-medium truncate">
                          {room.property?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {room.property?.city?.name} • {room.property?.category?.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{room.totalGuests}</span>
                    <span className="text-xs text-muted-foreground">guests</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold tracking-tight text-foreground">
                        {formatCurrency(room.basePrice)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">per night</span>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                      onClick={(e) => handleEditRoom(e, room)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                      onClick={(e) => handleDeleteClick(e, room)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:hidden space-y-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-28 rounded-xl overflow-hidden bg-muted shrink-0 ring-1 ring-border">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={room.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon className="h-7 w-7 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3 className="font-heading font-bold text-lg leading-tight truncate">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <Bed className="h-3 w-3 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {room.property?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <p className="text-[10px] text-muted-foreground truncate">
                        {room.property?.city?.name} • {room.property?.category?.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 rounded-lg">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold">{room.totalGuests}</span>
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-bold tracking-tight text-foreground">
                        {formatCurrency(room.basePrice)}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">per night</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => handleEditRoom(e, room)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDeleteClick(e, room)}
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