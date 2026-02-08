"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateProperty, usePublishProperty } from "@/hooks/useProperty";
import { toast } from "sonner";
import { useCreateRoom } from "@/hooks/useRoom";
import { NewImageData } from "@/types/images";
import {
  CreatePropertyStep2Form,
  SavedRoom,
} from "./property-form/CreatePropertyStepTwoForm";
import { StepOneFormData } from "@/lib/validator/dashboard.create-property.schema";
import { CreatePropertyStep1Form } from "./property-form/CreatePropertyStepOneForm";

interface CreatePropertyFormsProps {
  onCancel: () => void;
}

const CreatePropertyForms = ({ onCancel }: CreatePropertyFormsProps) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyId, setPropertyId] = useState<number | null>(null);

  const createProperty = useCreateProperty();
  const createRoom = useCreateRoom();
  const publishProperty = usePublishProperty();

  const buildPropertyFormData = (
    data: StepOneFormData,
    images: NewImageData[]
  ): FormData => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("address", data.address);
    formData.append("cityId", String(data.cityId));
    formData.append("categoryId", String(data.categoryId));
    formData.append("latitude", String(data.latitude));
    formData.append("longitude", String(data.longitude));
    formData.append("propertyType", data.propertyType);

    formData.append("amenities", JSON.stringify(data.amenities));
    images.forEach((img) => {
      formData.append("urlImages", img.file);
    });

    return formData;
  };

  // Step 1: Create property in database (as DRAFT)
  const handleStep1Continue = async (
    data: StepOneFormData,
    images: NewImageData[]
  ) => {
    try {
      const formData = buildPropertyFormData(data, images);
      const property = await createProperty.mutateAsync(formData);

      // Save propertyId to use in Step 2
      setPropertyId(property.id);
      setCurrentStep(2);
      toast.success("Property created as draft. Now add rooms.");
    } catch (error: any) {
      console.error("Failed to create property:", error);
      // Error toast handled by mutation
    }
  };

  // Step 2: Create rooms then publish property
  const handleStep2Complete = async (rooms: SavedRoom[]) => {
    if (!propertyId) {
      toast.error("Property ID not found. Please go back to Step 1.");
      return;
    }

    try {
      // Create all rooms for the property
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

      // After all rooms are created, publish the property
      await publishProperty.mutateAsync(propertyId);

      // Success handled by publishProperty mutation (redirects to property list)
    } catch (error: any) {
      console.error("Failed to complete property:", error);
      // Error toast handled by mutations
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleCancel = () => {
    if (propertyId) {
      // Property already created, redirect to property list
      router.push("/dashboard/tenant/property");
    } else {
      onCancel();
    }
  };

  if (currentStep === 1) {
    return (
      <CreatePropertyStep1Form
        onContinue={handleStep1Continue}
        onCancel={handleCancel}
        isLoading={createProperty.isPending}
      />
    );
  }

  return (
    <CreatePropertyStep2Form
      onComplete={handleStep2Complete}
      onBack={handleBack}
      onCancel={handleCancel}
      isLoading={createRoom.isPending || publishProperty.isPending}
    />
  );
};

export default CreatePropertyForms;
