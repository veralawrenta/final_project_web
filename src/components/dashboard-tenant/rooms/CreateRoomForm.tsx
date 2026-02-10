"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetTenantProperties } from "@/hooks/useProperty";
import { useCreateRoom } from "@/hooks/useRoom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RoomData, RoomFormCard } from "../property/property-forms/RoomFormCard";

const CreateRoomForm = () => {
  const router = useRouter();
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null
  );

  const { data: tenantProperties, isLoading: propertiesLoading } =
    useGetTenantProperties();
  const { mutateAsync: createRoom, isPending: isCreating } = useCreateRoom();

  const handleCancel = () => {
    router.push("/dashboard/tenant/room");
  };

  const handleSubmit = async (data: RoomData) => {
    if (!selectedPropertyId) {
      toast.error("Please select a property first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("basePrice", data.basePrice.toString());
      formData.append("totalGuests", data.totalGuests.toString());
      formData.append("totalUnits", data.totalUnits.toString());

      data.images.forEach((img) => {
        formData.append("urlImages", img.file);
      });

      await createRoom({
        propertyId: selectedPropertyId,
        formData,
      });
    } catch (error: any) {
      console.error("Failed to create room:", error);
    }
  };

  if (propertiesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading properties...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          disabled={isCreating}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">
            Create New Room
          </h1>
          <p className="text-muted-foreground mt-1">
            Add a new room to your property
          </p>
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Property *</label>
          <Select
            value={selectedPropertyId?.toString()}
            onValueChange={(value) => setSelectedPropertyId(Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a property to add this room to" />
            </SelectTrigger>
            <SelectContent>
              {tenantProperties?.data?.map((property: any) => (
                <SelectItem key={property.id} value={property.id.toString()}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedPropertyId && (
            <p className="text-xs text-muted-foreground">
              You must select a property before adding room details
            </p>
          )}
        </div>
      </div>
      {selectedPropertyId ? (
        <RoomFormCard
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isCreating}
          submitLabel="Create Room"
          title="Room Details"
          description="Maximum 3 images per room"
        />
      ) : (
        <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            Please select a property above to continue
          </p>
        </div>
      )}
    </div>
  );
};

export default CreateRoomForm;