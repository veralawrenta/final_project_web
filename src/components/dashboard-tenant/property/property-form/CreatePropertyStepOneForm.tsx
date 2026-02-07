'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Loader2, MapPin, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPropertyOneSchema, StepOneFormData } from '@/lib/validator/dashboard.create-property.schema';
import { useGetCities } from '@/hooks/useGetCities';
import { useGetMasterAmenities } from '@/hooks/useAmenities';
import { InteractiveMap } from '../MapComponent';
import { getAmenityIcon } from '@/lib/amenitiesIcon';
import CreateImageUploader from '../CreateImageUploader';
import { useGetCategories } from '@/hooks/useCategory';

const KOTA_TUA_LAT = -6.1352;
const KOTA_TUA_LNG = 106.8133;

interface CreatePropertyStep1Props {
  onSaveDraft: (data: StepOneFormData, images: ImageData[]) => void;
  onContinue: (data: StepOneFormData, images: ImageData[]) => void;
  onCancel: () => void; 
  isLoading?: boolean;
}

export function CreatePropertyStep1({
  onSaveDraft,
  onContinue,
  onCancel,
  isLoading,
}: CreatePropertyStep1Props) {
  const [images, setImages] = useState<ImageData[]>([]);

  const { data: cities = [], isLoading: loadingCities } = useGetCities();
  const { data: categories = [], isLoading: loadingCategories } = useGetCategories();
  const { data: amenities = [], isLoading: loadingAmenities } = useGetMasterAmenities();
  
  const form = useForm<StepOneFormData>({
    resolver: zodResolver(createPropertyOneSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      cityId: 0,
      categoryId: 0,
      latitude: KOTA_TUA_LAT,
      longitude: KOTA_TUA_LNG,
      propertyType: 'VILLA',
      amenities: [],
    },
  });

  const selectedAmenities = form.watch('amenities');
  const toggleAmenity = (code: string) => {
    const current = form.getValues('amenities');
    
    if (current.includes(code)) {
      form.setValue('amenities', current.filter((c) => c !== code));
    } else {
      form.setValue('amenities', [...current, code]);
    }
  };

  // Handle "Save as Draft" button
  const handleSaveDraft = (data: StepOneFormData) => {
    // Validate images
    if (images.length === 0) {
      alert('Please upload at least one property image');
      return;
    };
    
    onSaveDraft(data, images);
  };

  const handleContinue = (data: StepOneFormData) => {
    if (images.length === 0) {
      alert('Please upload at least one property image');
      return;
    };
    onContinue(data, images);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Property</h1>
        <p className="text-muted-foreground">Step 1 of 2: Property Details & Images</p>
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
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what makes your property special..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {field.value.length} characters
                    </p>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VILLA">🏖️ Villa</SelectItem>
                          <SelectItem value="HOUSE">🏠 House</SelectItem>
                          <SelectItem value="APARTMENT">🏢 Apartment</SelectItem>
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
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities.map((city: any) => (
                              <SelectItem key={city.id} value={city.id.toString()}>
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
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat: any) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                  latitude={form.watch('latitude')}
                  longitude={form.watch('longitude')}
                  onLocationChange={(lat, lng) => {
                    form.setValue('latitude', parseFloat(lat.toFixed(6)));
                    form.setValue('longitude', parseFloat(lng.toFixed(6)));
                  }}
                  height="350px"
                />
              </div>

              {/* Location Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Default: Kota Tua Jakarta</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>
                Select all amenities available at your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAmenities ? (
                // Loading Skeleton
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {amenities.map((amenity: any) => {
                      const Icon = getAmenityIcon(amenity.code);
                      const isSelected = selectedAmenities.includes(amenity.code);
                      
                      return (
                        <div
                          key={amenity.code}
                          onClick={() => toggleAmenity(amenity.code)}
                          className={`
                            relative flex items-center gap-3 p-3 rounded-lg border-2 
                            cursor-pointer transition-all
                            ${
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/50 hover:bg-accent/50'
                            }
                          `}
                        >
                          <Checkbox
                            id={amenity.code}
                            checked={isSelected}
                            onCheckedChange={() => toggleAmenity(amenity.code)}
                          />
                          <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <label
                            htmlFor={amenity.code}
                            className="text-sm cursor-pointer flex-1 select-none"
                          >
                            {amenity.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Select at least one amenity
                    </p>
                    <Badge variant={selectedAmenities.length > 0 ? "default" : "secondary"}>
                      {selectedAmenities.length} selected
                    </Badge>
                  </div>
                  <FormMessage>{form.formState.errors.amenities?.message}</FormMessage>
                </>
              )}
            </CardContent>
          </Card>
        
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
              <CardDescription>
                Upload 1-10 high-quality photos showcasing your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Reusable Image Uploader */}
              <CreateImageUploader
                images={images}
                onImagesChange={setImages}
                maxImages={10}
                label="Property Images"
                showCoverBadge={true}
              />
              
              {/* Image Tips */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  📸 <strong>Tips:</strong> Use high-resolution photos. 
                  The first image will be your cover photo. You can change it by clicking the star.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
            
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={form.handleSubmit(handleSaveDraft)}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save as Draft
              </Button>

              {/* Continue Button */}
              <Button
                type="button"
                onClick={form.handleSubmit(handleContinue)}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue to Rooms
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}