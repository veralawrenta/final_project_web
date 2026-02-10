"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMasterAmenities } from "@/hooks/useAmenities";
import { useGetCategories } from "@/hooks/useCategory";
import { useGetCities } from "@/hooks/useGetCities";
import { getAmenityIcon } from "@/lib/amenitiesIcon";
import { cn } from "@/lib/utils";
import { StepOneFormData } from "@/lib/validator/dashboard.create-property.schema";
import { NewImageData } from "@/types/images";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CreateImageUploader from "../CreateImageUploader";
import { InteractiveMap } from "../MapComponent";
import { RichTextEditor } from "@/components/RichTextEditor";
import { FieldDescription } from "@/components/ui/field";

const KOTA_TUA_LAT = -6.1352;
const KOTA_TUA_LNG = 106.8133;

interface CreatePropertyStep1Props {
  onContinue: (data: StepOneFormData, images: NewImageData[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type FormValues = Omit<StepOneFormData, "cityId" | "categoryId"> & {
  cityId: string;
  categoryId: string;
};

export function CreatePropertyStep1Form({
  onContinue,
  onCancel,
  isLoading,
}: CreatePropertyStep1Props) {
  const [propertyImages, setPropertyImages] = useState<NewImageData[]>([]);

  const { data: cities = [], isLoading: loadingCities } = useGetCities();
  const { data: categories = [], isLoading: loadingCategories } =
    useGetCategories();
  const { data: amenities = [], isLoading: loadingAmenities } =
    useGetMasterAmenities();

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      description: "",
      address: "",
      cityId: "",
      categoryId: "",
      latitude: KOTA_TUA_LAT,
      longitude: KOTA_TUA_LNG,
      propertyType: "VILLA",
      amenities: [],
    },
  });

  const convertFormData = (data: FormValues): StepOneFormData => {
    return {
      ...data,
      cityId: Number(data.cityId),
      categoryId: Number(data.categoryId),
    };
  };

  const validateAllFields = (): boolean => {
    const formData = form.getValues();

    if (!formData.name.trim()) {
      toast.error("Property name is required");
      return false;
    }

    if (!formData.description.trim() || formData.description === "<p></p>") {
      toast.error("Description is required");
      return false;
    }

    if (!formData.address.trim()) {
      toast.error("Address is required");
      return false;
    }

    if (!formData.cityId) {
      toast.error("City is required");
      return false;
    }

    if (!formData.categoryId) {
      toast.error("Category is required");
      return false;
    }

    if (formData.amenities.length === 0) {
      toast.error("Please select at least one amenity");
      return false;
    }

    if (propertyImages.length === 0) {
      toast.error("Please upload at least one property image");
      return false;
    }

    return true;
  };

  const handleContinue = (data: FormValues) => {
    if (!validateAllFields()) {
      return;
    }

    onContinue(convertFormData(data), propertyImages);
  };

  const canSubmit = propertyImages.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Create Property</h1>
        <p className="text-sm text-muted-foreground">
          Step 1 of 2 • Basic details
        </p>
      </div>
      <div className="flex gap-2">
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className="h-1 flex-1 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="form-name">Property Name</FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        placeholder="e.g., Sunset Beach Villa"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FieldDescription>This field must be filled out.</FieldDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="form-description">Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Describe your property..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="propertyType">
                        Property Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent id="propertyType">
                          <SelectItem value="VILLA">Villa</SelectItem>
                          <SelectItem value="HOUSE">House</SelectItem>
                          <SelectItem value="APARTMENT">Apartment</SelectItem>
                          <SelectItem value="HOTEL">Hotel</SelectItem>
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
                      <FormLabel htmlFor="cityId">City</FormLabel>
                      {loadingCities ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((city: any) => (
                              <SelectItem
                                key={city.id}
                                value={city.id.toString()}
                              >
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="categoryId">Category</FormLabel>
                      {loadingCategories ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat: any) => (
                              <SelectItem
                                key={cat.id}
                                value={cat.id.toString()}
                              >
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="form-address">Address</FormLabel>
                    <FormControl>
                      <Input
                        id="form-address"
                        placeholder="Full address"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormDescription>You can drag your location via map below and edit your address here.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="form-latitude" className="text-sm">
                        Latitude
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="form-latitude"
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="font-mono text-sm"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="form-longitude" className="text-sm">
                        Longitude
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="form-longitude"
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="font-mono text-sm"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-md overflow-hidden border">
                <InteractiveMap
                  latitude={form.getValues("latitude")}
                  longitude={form.getValues("longitude")}
                  onLocationChange={async (lat, lng) => {
                    form.setValue("latitude", parseFloat(lat.toFixed(6)), {
                      shouldValidate: false,
                    });
                    form.setValue("longitude", parseFloat(lng.toFixed(6)), {
                      shouldValidate: false,
                    });
                
                    try {
                      const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`
                      );
                      const data = await res.json();
                
                      if (data?.display_name) {
                        form.setValue("address", data.display_name, {
                          shouldValidate: true,
                        });
                      }
                    } catch (e) {
                      console.error("Reverse geocoding failed", e);
                    }
                  }}
                  height="300px"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Amenities</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {form.watch("amenities").length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAmenities ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {amenities.map((amenity: any) => {
                          const Icon = getAmenityIcon(amenity.code);
                          const isSelected = field.value.includes(amenity.code);

                          return (
                            <button
                              key={amenity.code}
                              type="button"
                              onClick={() => {
                                const newValue = isSelected
                                  ? field.value.filter(
                                      (c: string) => c !== amenity.code
                                    )
                                  : [...field.value, amenity.code];
                                field.onChange(newValue);
                              }}
                              className={cn(
                                "flex items-center gap-2 p-3 rounded-md border text-left transition-colors text-sm",
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 dark:border-gray-800 hover:border-primary/50"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-4 w-4",
                                  isSelected ? "text-primary" : "text-gray-500"
                                )}
                              />
                              <span className="flex-1 truncate">
                                {amenity.name}
                              </span>
                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                  <svg
                                    className="w-2.5 h-2.5 text-white"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7"></path>
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Property Images</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateImageUploader
                images={propertyImages}
                onImagesChange={setPropertyImages}
                maxImages={10}
                showCoverBadge={true}
              />
              {propertyImages.length === 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
                  At least one image is required
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>

            <Button
              type="button"
              onClick={form.handleSubmit(handleContinue)}
              disabled={isLoading || !canSubmit}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
