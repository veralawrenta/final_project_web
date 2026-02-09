"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewImageData } from "@/types/images";
import {
  ArrowLeft,
  Bed,
  Check,
  DollarSign,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RoomData, RoomFormCard } from "../RoomFormCard";

export interface SavedRoom {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  totalGuests: number;
  totalUnits: number;
  images: NewImageData[];
}

interface CreatePropertyStep2Props {
  onComplete: (rooms: SavedRoom[]) => void;
  onBack: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CreatePropertyStep2Form({
  onComplete,
  onBack,
  onCancel,
  isLoading,
}: CreatePropertyStep2Props) {
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  const handleAddNewRoom = () => {
    setEditingRoomId(null);
    setShowForm(true);
  };

  const handleEditRoom = (room: SavedRoom) => {
    setEditingRoomId(room.id);
    setShowForm(true);
  };

  const handleDeleteRoom = (roomId: number) => {
    setSavedRooms(savedRooms.filter((r) => r.id !== roomId));
    toast.success("Room removed from list");
  };

  const handleSaveRoom = (data: RoomData) => {
    if (editingRoomId) {
      // Update existing room
      setSavedRooms(
        savedRooms.map((room) =>
          room.id === editingRoomId
            ? {
                ...room,
                ...data,
              }
            : room
        )
      );
      toast.success("Room updated in list");
    } else {
      // Add new room
      const newRoom: SavedRoom = {
        id: Date.now(),
        ...data,
      };
      setSavedRooms([...savedRooms, newRoom]);
      toast.success("Room added to list");
    }

    setShowForm(false);
    setEditingRoomId(null);
  };

  const handleSaveAndAddAnother = (data: RoomData) => {
    const newRoom: SavedRoom = {
      id: Date.now(),
      ...data,
    };
    setSavedRooms([...savedRooms, newRoom]);
    toast.success("Room added. You can add another.");

    // Reset form by toggling
    setShowForm(false);
    setTimeout(() => {
      setEditingRoomId(null);
      setShowForm(true);
    }, 50);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRoomId(null);
  };

  const handleComplete = () => {
    if (savedRooms.length === 0) {
      toast.error("Please add at least one room before completing");
      return;
    }

    onComplete(savedRooms);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const editingRoom = editingRoomId
    ? savedRooms.find((r) => r.id === editingRoomId)
    : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Property</h1>
        <p className="text-muted-foreground">Step 2 of 2: Add Rooms</p>
      </div>

      <div className="flex gap-2">
        <div className="h-2 flex-1 rounded-full bg-primary" />
        <div className="h-2 flex-1 rounded-full bg-primary" />
      </div>

      {/* Saved Rooms List */}
      {savedRooms.length > 0 && !showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Added Rooms ({savedRooms.length})</CardTitle>
                <CardDescription>
                  Your rooms are ready to publish
                </CardDescription>
              </div>
              <Button onClick={handleAddNewRoom} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedRooms.map((room) => (
              <div
                key={room.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                  {room.images[0] && (
                    <img
                      src={room.images[0].preview}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {room.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {room.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <Badge variant="secondary" className="gap-1">
                      {formatCurrency(room.basePrice)}/night
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="h-3 w-3" />
                      {room.totalGuests} guests
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Bed className="h-3 w-3" />
                      {room.totalUnits} units
                    </Badge>
                    <Badge variant="outline">
                      {room.images.length} image
                      {room.images.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditRoom(room)}
                    title="Edit room"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRoom(room.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete room"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Room Form */}
      {showForm ? (
        <RoomFormCard
          onSubmit={handleSaveRoom}
          onCancel={savedRooms.length > 0 ? handleCancelForm : undefined}
          isLoading={false}
          submitLabel={editingRoomId ? "Update Room" : "Save Room"}
          showSecondaryAction={!editingRoomId}
          secondaryActionLabel="Save & Add Another"
          onSecondaryAction={handleSaveAndAddAnother}
          title={editingRoomId ? "Edit Room" : "Add New Room"}
          description={
            editingRoomId
              ? "Update room details and images"
              : "Fill in room details and upload images"
          }
          initialData={editingRoom}
        />
      ) : (
        savedRooms.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bed className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                No rooms added yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                Add at least one room to continue
              </p>
              <Button onClick={handleAddNewRoom}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Room
              </Button>
            </CardContent>
          </Card>
        )
      )}

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={savedRooms.length === 0 || isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Check className="h-4 w-4 mr-2" />
            Complete & Publish
          </Button>
        </div>
      </div>
    </div>
  );
}