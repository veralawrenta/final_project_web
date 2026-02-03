import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { createPropertySchema } from "@/lib/validator/dashboard.property.schema";
import { CreatePropertyPayload, PropertyRoom } from "@/types/property";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { RoomFormModal } from "./RoomFormModal";
import { PropertyImagesModal } from "./PropertyImagesModal";
import { PropertyImagesSection } from "./PropertyImagesSection";
import { PropertyBasicInfo } from "./CreateBasicProperty";
import { PropertyRoomsSection } from "./PropertyRoomSection";

interface PropertyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: any | null;
  onSubmit: (data: CreatePropertyPayload) => void;
}

const PropertyFormDialog = ({
  open,
  onOpenChange,
  property,
  onSubmit,
}: PropertyFormDialogProps) => {
  const isEdit = !!property;

  // Property images state
  const [propertyImageFiles, setPropertyImageFiles] = useState<File[]>([]);
  const [propertyImagePreviews, setPropertyImagePreviews] = useState<string[]>(
    []
  );

  const [rooms, setRooms] = useState<PropertyRoom[]>([]);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    property?.amenities?.map((a: any) => a.code) || []
  );

  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);

  const form = useForm<z.infer<typeof createPropertySchema>>({
    resolver: zodResolver(createPropertySchema),
    defaultValues: {
      name: property?.name || "",
      description: property?.description || "",
      address: property?.address || "",
      cityId: property?.city?.id || undefined,
      categoryId: property?.category?.id || undefined,
      latitude: property?.latitude || -6.2088,
      longitude: property?.longitude || 106.8456,
      propertyType: (property?.propertyType as any) || undefined,
      amenities: property?.amenities?.map((a: any) => a.code) || [],
      propertyImages: [],
      rooms: [],
    },
  });

  const handleSubmit = (data: z.infer<typeof createPropertySchema>) => {
    const submitData : CreatePropertyPayload = {
      ...data,
      amenities: selectedAmenities, 
      propertyImages: propertyImageFiles,
      rooms: rooms.map((room) => ({
        name: room.name,
        description: room.description,
        basePrice: room.basePrice,
        totalGuests: room.totalGuests,
        totalUnits: room.totalUnits,
        roomImages: room.imageFiles,
      })),
    };

    onSubmit(submitData);
    resetForm();
  };

  const resetForm = () => {
    form.reset();
    setPropertyImageFiles([]);
    setPropertyImagePreviews([]);
    setSelectedAmenities([]);
    setRooms([]);
    onOpenChange(false);
  };

  const handleAddRoom = (room: PropertyRoom) => {
    setRooms([...rooms, room]);
    setRoomModalOpen(false);
  };

  const handleRemoveRoom = (roomId: string) => {
    setRooms(rooms.filter((r) => r.id !== roomId));
    toast.success("Room removed");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {isEdit ? "Edit Property" : "Add New Property"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <PropertyBasicInfo
                form={form}
                selectedAmenities={selectedAmenities}
                onAmenitiesChange={setSelectedAmenities}
              />
              <PropertyImagesSection
                imageFiles={propertyImageFiles}
                imagePreviews={propertyImagePreviews}
                onOpenModal={() => setImagesModalOpen(true)}
              />
              <PropertyRoomsSection
                rooms={rooms}
                onAddRoom={() => setRoomModalOpen(true)}
                onRemoveRoom={handleRemoveRoom}
              />
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    propertyImageFiles.length === 0 ||
                    rooms.length === 0 ||
                    selectedAmenities.length === 0
                  }
                >
                  {isEdit ? "Update Property" : "Create Property"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <PropertyImagesModal
        open={imagesModalOpen}
        onOpenChange={setImagesModalOpen}
        imageFiles={propertyImageFiles}
        imagePreviews={propertyImagePreviews}
        onImagesChange={(files, previews) => {
          setPropertyImageFiles(files);
          setPropertyImagePreviews(previews);
        }}
      />
      <RoomFormModal
        open={roomModalOpen}
        onOpenChange={setRoomModalOpen}
        onAddRoom={handleAddRoom}
        onAddAnother={(room) => {
          setRooms([...rooms, room]);
        }}
      />
    </>
  );
};
export default PropertyFormDialog;
