"use client";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useDebounceValue } from "usehooks-ts";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Search,
  Filter,
  LayoutGrid,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Room } from "@/types/room";
import { useDeleteRoom, useGetTenantRooms } from "@/hooks/useRoom";
import PaginationSection from "@/components/PaginationSection";
import { useGetTenantProperties } from "@/hooks/useProperty";
import { useRouter } from "next/navigation";

const RoomManagementTab = () => {
  const router = useRouter();
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [debounceSearch] = useDebounceValue(search, 500);

  const [selectedProperty, setSelectedProperty] = useState<string>("all");
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);

  const { data: tenantProperties } = useGetTenantProperties();
  const { data: tenantRooms, isPending } = useGetTenantRooms({
    page,
    take: 3,
    search: debounceSearch,
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

  const filteredRooms =
    tenantRooms?.data?.filter((room) => {
      if (selectedProperty === "all") return true;
      return room.propertyId === Number(selectedProperty);
    }) || [];

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

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by room name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 focus-visible:ring-primary"
          />
        </div>
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-full sm:w-[240px] bg-background">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by property" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Properties</SelectItem>
            {tenantProperties?.data?.map((property: any) => (
              <SelectItem key={property.id} value={property.id.toString()}>
                {property.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Loading State: Skeleton Cards */}
        {isPending &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-2xl p-5 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-4 border-t flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}

        {/* Empty State */}
        {!isPending && filteredRooms.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed rounded-3xl bg-muted/30">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <LayoutGrid className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No rooms found</h3>
            <p className="text-muted-foreground text-center max-w-xs mt-2">
              {search || selectedProperty !== "all" 
                ? "Try adjusting your filters or search terms to find what you're looking for." 
                : "You haven't added any rooms yet. Start by creating your first listing."}
            </p>
            {search || selectedProperty !== "all" ? (
              <Button 
                variant="outline" 
                className="mt-6" 
                onClick={() => {setSearch(""); setSelectedProperty("all");}}
              >
                Clear all filters
              </Button>
            ) : (
              <Button className="mt-6" onClick={handleAddRoom}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Room
              </Button>
            )}
          </div>
        )}

        {/* Room Grid */}
        {!isPending && filteredRooms.map((room) => (
          <div
            key={room.id}
            className="group bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-lg text-[10px] font-bold tracking-wider uppercase">
                ID: {room.id}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

            <h3 className="font-heading font-bold text-xl leading-tight mb-1">{room.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Property Ref: #{room.propertyId}
            </p>

            <div className="flex items-center gap-3 py-3 border-t border-border mt-auto">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{room.totalGuests} Guests</span>
              </div>
              <div className="ml-auto flex items-baseline gap-1">
                <span className="text-sm font-medium text-primary">$</span>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {room.basePrice.toLocaleString()}
                </span>
                <span className="text-[12px] text-muted-foreground font-medium">/night</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!!tenantRooms?.meta && !isPending && filteredRooms.length > 0 && (
        <div className="pt-4">
          <PaginationSection
            meta={tenantRooms.meta}
            onChangePage={onChangePage}
          />
        </div>
      )}

      {/* Keep existing AlertDialog logic */}
      <AlertDialog open={!!deleteRoom} onOpenChange={() => setDeleteRoom(null)}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Room</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <p>
                Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteRoom?.name}"</span>? 
                This will remove the room from Property ID: {deleteRoom?.propertyId}.
              </p>
              <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg">
                <p className="text-destructive text-xs font-bold uppercase tracking-wider mb-2">
                  Permanent Action
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">• All images will be removed</li>
                  <li className="flex items-center gap-2">• Maintenance logs will be cleared</li>
                </ul>
              </div>
            </AlertDialogDescription>
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