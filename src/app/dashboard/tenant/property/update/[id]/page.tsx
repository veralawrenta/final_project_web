"use client";
import { EditPropertyForm } from "@/components/dashboard-tenant/property/property-form/EditPropertyForm";
import { Button } from "@/components/ui/button";
import {
  useDeletePropertyImage,
  useUploadPropertyImage,
} from "@/hooks/useImages";
import { useGetTenantPropertyId, useUpdateProperty } from "@/hooks/useProperty";
import { UpdatePropertFormValues } from "@/lib/validator/dashboard.update-property.schema";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const EditPropertyPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const propertyId = Number(params.id);

  const updatePropertyMutation = useUpdateProperty(propertyId);
  const uploadImageMutation = useUploadPropertyImage();
  const deleteImageMutation = useDeletePropertyImage();

  // Fetch property data here with useQuery...
  const { data: property, isLoading } = useGetTenantPropertyId(propertyId);

  const handleSave = async (
    propertyData: UpdatePropertFormValues,
    imagesToAdd: File[],
    imagesToRemove: number[],
    coverImageId?: number
  ) => {
    try {
      await updatePropertyMutation.mutateAsync({
        ...propertyData,
      });
      if (imagesToRemove.length > 0) {
        await Promise.all(
          imagesToRemove.map((propertyImageId: number) =>
            deleteImageMutation.mutateAsync(propertyImageId)
          )
        );
      }
      if (imagesToAdd.length > 0) {
        await Promise.all(
          imagesToAdd.map((file, index) => {
            uploadImageMutation.mutateAsync({
              propertyId,
              file,
              isCover: index === 0 && !coverImageId,
            });
          })
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground tracking-wide">
          Loading property...
        </span>
      </div>
    );
  }
  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold">Property not found</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          The property you are looking for does not exist or has been removed.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/tenant/property")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <EditPropertyForm
      property={property}
      onSave={handleSave}
      onCancel={() => router.push("/dashboard/tenant/property")}
    />
  );
};
export default EditPropertyPage;
