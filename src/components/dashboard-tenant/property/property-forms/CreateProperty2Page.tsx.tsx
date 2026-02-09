"use client";
import { useRouter } from "next/navigation";
import { useCreateRoom } from "@/hooks/useRoom";
import { usePublishProperty } from "@/hooks/useProperty";
import { toast } from "sonner";
import { CreatePropertyStep2Form, SavedRoom } from "@/components/dashboard-tenant/property/property-forms/CreatePropertyForm2";

interface CreatePropertyStep2PageProps {
  propertyId: number;
}

const CreatePropertyStep2Page = ({ propertyId }: CreatePropertyStep2PageProps) => {
  const router = useRouter();
  const createRoom = useCreateRoom();
  const publishProperty = usePublishProperty();

  const handleStep2Complete = async (rooms: SavedRoom[]) => {
    if (!propertyId) {
      toast.error("Property ID not found");
      return;
    }

    try {
      const roomPromises = rooms.map(async (room) => {
        const roomFormData = new FormData();
        roomFormData.append("name", room.name);
        roomFormData.append("description", room.description);
        roomFormData.append("basePrice", room.basePrice.toString());
        roomFormData.append("totalGuests", room.totalGuests.toString());
        roomFormData.append("totalUnits", room.totalUnits.toString());
        room.images.forEach((img) => {
          roomFormData.append("urlImages", img.file);
        });

        return createRoom.mutateAsync({ propertyId, formData: roomFormData });
      });

      await Promise.all(roomPromises);
      await publishProperty.mutateAsync(propertyId);

    } catch (error: any) {
      console.error("Failed to complete property:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleCancel = () => {
    router.push("/dashboard/tenant/property");
  };

  return (
    <CreatePropertyStep2Form
      onComplete={handleStep2Complete}
      isLoading={createRoom.isPending || publishProperty.isPending}
    />
  );
};

export default CreatePropertyStep2Page;