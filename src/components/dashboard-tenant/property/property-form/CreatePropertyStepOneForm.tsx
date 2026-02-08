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
import { ArrowRight, Home, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CreateImageUploader from "../CreateImageUploader";
import { InteractiveMap } from "../MapComponent";
import { RichTextEditor } from "@/components/RichTextEditor";

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

  // Convert form values to the expected type
  const convertFormData = (data: FormValues): StepOneFormData => {
    return {
      ...data,
      cityId: Number(data.cityId),
      categoryId: Number(data.categoryId),
    };
  };

  // Validate all required fields
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Property</h1>
        <p className="text-muted-foreground">
          Step 1 of 2: Property Details & Images
        </p>
      </div>

      <div className="flex gap-2">
        <div className="h-2 flex-1 rounded-full bg-primary" />
        <div className="h-2 flex-1 rounded-full bg-muted" />
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <CardTitle>Basic Information</CardTitle>
              </div>
              <CardDescription>Tell us about your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Sunset Beach Villa"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rich Text Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Write your description..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VILLA">🏖️ Villa</SelectItem>
                          <SelectItem value="HOUSE">🏠 House</SelectItem>
                          <SelectItem value="APARTMENT">
                            🏢 Apartment
                          </SelectItem>
                          <SelectItem value="HOTEL">🏨 Hotel</SelectItem>
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
                      <FormLabel>City *</FormLabel>
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
                      <FormLabel>Category *</FormLabel>
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
                    <FormLabel>Full Address *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Street address, area, landmarks..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle>Location on Map</CardTitle>
              </div>
              <CardDescription>
                Click or drag the marker to pinpoint your exact location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Latitude
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="font-mono text-sm"
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
                      <FormLabel className="text-xs text-muted-foreground">
                        Longitude
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Interactive Map */}
              <div className="rounded-lg overflow-hidden border border-border">
                <InteractiveMap
                  latitude={form.getValues("latitude")}
                  longitude={form.getValues("longitude")}
                  onLocationChange={(lat, lng) => {
                    form.setValue("latitude", parseFloat(lat.toFixed(6)), {
                      shouldValidate: false,
                    });
                    form.setValue("longitude", parseFloat(lng.toFixed(6)), {
                      shouldValidate: false,
                    });
                  }}
                  height="350px"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amenities *</CardTitle>
              <CardDescription>
                Select all amenities available at your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAmenities ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="amenities"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                                "relative flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all text-left",
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border hover:border-primary/50 hover:bg-accent/50"
                              )}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded border-2 flex items-center justify-center shrink-0",
                                  isSelected
                                    ? "bg-primary border-primary"
                                    : "border-input"
                                )}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 text-primary-foreground"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path d="M5 13l4 4L19 7"></path>
                                  </svg>
                                )}
                              </div>

                              <Icon
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  isSelected
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                              />

                              <span className="text-sm flex-1">
                                {amenity.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Select at least one amenity
                        </p>
                        <Badge
                          variant={
                            field.value.length > 0 ? "default" : "secondary"
                          }
                        >
                          {field.value.length} selected
                        </Badge>
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <CreateImageUploader
                images={propertyImages}
                onImagesChange={setPropertyImages}
                maxImages={10}
                label="Property Images"
                showCoverBadge={true}
              />

              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  📸 <strong>Tips:</strong> Use high-resolution photos. The
                  first image will be your cover photo. You can change it by
                  clicking the star.
                </p>
              </div>

              {propertyImages.length === 0 && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    ⚠️ <strong>Required:</strong> At least one property image is
                    required to continue.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>

            <Button
              type="button"
              onClick={form.handleSubmit(handleContinue)}
              disabled={isLoading || !canSubmit}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue to Rooms
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}