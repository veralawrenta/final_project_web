"use client";
import { CreatePropertyStep1Form } from "@/components/dashboard-tenant/property/property-forms/CreatePropertyForm1";
import { useCreateProperty } from "@/hooks/useProperty";
import { StepOneFormData } from "@/lib/validator/dashboard.create-property.schema";
import { NewImageData } from "@/types/images";
import { useRouter } from "next/navigation";

interface CreatePropertyStep1PageProps {
  onCancel: () => void;
}

const CreatePropertyStep1Page = ({
  onCancel,
}: CreatePropertyStep1PageProps) => {
  const router = useRouter();
  const createProperty = useCreateProperty();

  const buildPropertyFormData = (
    data: StepOneFormData,
    images: NewImageData[]
  ): FormData => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("address", data.address);
    formData.append("cityId", String(data.cityId));
    //formData.append("categoryId", String(data.categoryId));
    if (data.categoryId !== undefined && data.categoryId !== null) {
      formData.append("categoryId", data.categoryId.toString());
    }
    formData.append("latitude", String(data.latitude));
    formData.append("longitude", String(data.longitude));
    formData.append("propertyType", data.propertyType);

    formData.append("amenities", JSON.stringify(data.amenities));
    images.forEach((img) => {
      formData.append("urlImages", img.file);
    });

    return formData;
  };

  const handleStep1Continue = async (
    data: StepOneFormData,
    images: NewImageData[]
  ) => {
    try {
      const formData = buildPropertyFormData(data, images);
      const property = await createProperty.mutateAsync(formData);

      router.push(`/dashboard/tenant/property/create/${property.id}/rooms`);
    } catch (error: any) {
      console.error("Failed to create property:", error);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <CreatePropertyStep1Form
      onContinue={handleStep1Continue}
      onCancel={handleCancel}
      isLoading={createProperty.isPending}
    />
  );
};

export default CreatePropertyStep1Page;
