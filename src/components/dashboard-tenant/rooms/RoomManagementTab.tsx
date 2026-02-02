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
  Loader2,
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
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Room Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage rooms across all your properties
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddRoom}>
          <Plus className="h-4 w-4" />
          Add Room
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by property" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isPending && (
          <div className="col-span-full flex flex-col items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {!isPending && filteredRooms.map((room) => (
          <div
            key={room.id}
            className="bg-card rounded-2xl border border-border p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-bold font-mono">
                  ID: {room.id}
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Edit Room"
                  onClick={() => handleEditRoom(room)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  title="Delete Room"
                  onClick={() => setDeleteRoom(room)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <h3 className="font-heading font-semibold text-lg">{room.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              Property ID: {room.propertyId}
            </p>

            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{room.totalGuests} guests</span>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold">{room.basePrice}</span>
              <span className="text-sm text-muted-foreground">/ night</span>
            </div>
          </div>
        ))}

        {!isPending && filteredRooms.length === 0 && (
          <div className="col-span-full text-center py-12 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground">No rooms found</p>
          </div>
        )}
      </div>
      
      {!!tenantRooms?.meta && (
        <PaginationSection
          meta={tenantRooms.meta}
          onChangePage={onChangePage}
        />
      )}

      <AlertDialog open={!!deleteRoom} onOpenChange={() => setDeleteRoom(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete "
                <strong>{deleteRoom?.name}</strong>" from Property ID:{" "}
                {deleteRoom?.propertyId}?
              </p>
              <p className="text-destructive font-medium">
                ⚠️ This action will permanently delete:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>All room images for this room</li>
                <li>All maintenance schedules for this room</li>
              </ul>
              <p className="text-sm font-medium">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoomManagementTab;
