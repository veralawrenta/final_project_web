"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  UpdatePropertFormValues,
  updatePropertySchema,
} from "@/lib/validator/dashboard.update-property.schema";

import { RichTextEditor } from "@/components/RichTextEditor";
import { useGetMasterAmenities } from "@/hooks/useAmenities";
import { useGetCategories } from "@/hooks/useCategory";
import { useGetCities } from "@/hooks/useGetCities";
import { ExistingImageData, NewImageData } from "@/types/images";
import { PropertyType, type TenantPropertyId } from "@/types/property";
import EditImageUploader from "../EditImageUploader";
import { InteractiveMap } from "../MapComponent";

const PROPERTY_TYPES = Object.values(PropertyType);

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PropertyType.APARTMENT]: "Apartment",
  [PropertyType.HOUSE]: "House",
  [PropertyType.VILLA]: "Villa",
  [PropertyType.HOTEL]: "Hotel",
};
interface EditPropertyFormProps {
  property: TenantPropertyId;
  onSave: (
    propertyData: UpdatePropertFormValues,
    imagesToAdd: File[],
    imagesToRemove: number[]
  ) => Promise<void>;
  onCancel: () => void;
}

export function EditPropertyForm({
  property,
  onSave,
  onCancel,
}: EditPropertyFormProps) {
  const { data: categories } = useGetCategories();
  const { data: cities } = useGetCities();
  const { data: masterAmenities } = useGetMasterAmenities();
  const defaultValues: UpdatePropertFormValues = {
    name: property.name,
    description: property.description ?? "",
    address: property.address ?? "",
    cityId: property.cityId,
    categoryId: property.categoryId ?? undefined,
    latitude: property.latitude,
    longitude: property.longitude,
    propertyType: property.propertyType,
    amenities: property.amenities ?? [],
  };

  const form = useForm<UpdatePropertFormValues>({
    resolver: zodResolver(updatePropertySchema),
    defaultValues,
  });

  const [existingImages, setExistingImages] = useState<ExistingImageData[]>([]);
  const [newImages, setNewImages] = useState<NewImageData[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setExistingImages(
      property.images.map((img) => ({
        id: img.id,
        url: img.urlImages,
        isCover: img.isCover,
      }))
    );
  }, [property.images]);

  const locationLocked = property.hasMaintenance || property.hasSeasonalRate;

  const propertyTypeLocked = property.status === "PUBLISHED";
  const selectedAmenities = form.watch("amenities") ?? [];
  const toggleAmenity = (code: string) => {
    const current = form.getValues("amenities") ?? [];
    form.setValue(
      "amenities",
      current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code]
    );
  };

  const onSubmit = async (data: UpdatePropertFormValues) => {
    setIsSubmitting(true);
    try {
      // PATCH-safe payload (only defined fields)
      const payload = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      ) as UpdatePropertFormValues;

      await onSave(
        payload,
        newImages.map((img) => img.file),
        imagesToDelete
      );

      setNewImages([]);
      setImagesToDelete([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">Edit Property</h1>
          <p className="text-muted-foreground">{property.name}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.status === "PUBLISHED"
              ? "bg-green-500/10 text-green-600"
              : "bg-yellow-500/10 text-yellow-600"
          }`}
        >
          {property.status}
        </span>
      </div>
      <div className="bg-card rounded-2xl border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        disabled={propertyTypeLocked}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROPERTY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {PROPERTY_TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <Select
                        disabled={locationLocked}
                        value={field.value?.toString()}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities?.map((city) => (
                            <SelectItem
                              key={city.id}
                              value={city.id.toString()}
                            >
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        value={field.value?.toString()}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4 border-t pt-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input
                          disabled={locationLocked}
                          type="number"
                          step="any"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input
                          disabled={locationLocked}
                          type="number"
                          step="any"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <InteractiveMap
                latitude={form.watch("latitude") ?? -8.4095}
                longitude={form.watch("longitude") ?? 115.1889}
                onLocationChange={(lat, lng) => {
                  form.setValue("latitude", lat);
                  form.setValue("longitude", lng);
                }}
                height="300px"
              />
            </section>

            <section className="space-y-4 border-t pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {masterAmenities?.map((amenity) => (
                  <label key={amenity.code} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedAmenities.includes(amenity.code)}
                      onCheckedChange={() => toggleAmenity(amenity.code)}
                    />
                    {amenity.name}
                  </label>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                {selectedAmenities.length} selected
              </p>
            </section>

            <section className="space-y-4 border-t pt-6">
              <EditImageUploader
                existingImages={existingImages}
                newImages={newImages}
                onExistingImagesChange={setExistingImages}
                onNewImagesChange={setNewImages}
                onDeleteExisting={(id) =>
                  setImagesToDelete((prev) => [...prev, id])
                }
                isPublished={property.status === "PUBLISHED"}
              />
            </section>
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}