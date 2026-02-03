import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetMasterAmenities } from '@/hooks/useAmenities';
import { useGetCategoriesForCreateProperty } from '@/hooks/useCategory';
import { useGetCities } from '@/hooks/useGetCities';
import { UseFormReturn } from 'react-hook-form';
import { InteractiveMap } from './MapComponent';
import { MasterAmenity } from '@/types/amenity';
import { Checkbox } from '@/components/ui/checkbox';

const propertyTypes = ['VILLA', 'HOTEL', 'HOUSE', 'APARTMENT'] as const;

interface PropertyBasicInfoProps {
  form: UseFormReturn<any>;
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
};

export function PropertyBasicInfo({
  form,
  selectedAmenities,
  onAmenitiesChange,
}: PropertyBasicInfoProps) {
  const { data: citiesData, isPending: citiesLoading } = useGetCities();
  const { data: categoriesData, isPending: categoriesLoading } = useGetCategoriesForCreateProperty();
  const { data: amenities, isPending: amenitiesLoading } = useGetMasterAmenities();

  const cities = citiesData?.data || [];
  const categories = categoriesData?.data || [];

  const toggleAmenity = (amenityCode: string) => {
    onAmenitiesChange(
      selectedAmenities.includes(amenityCode)
        ? selectedAmenities.filter((code) => code !== amenityCode)
        : [...selectedAmenities, amenityCode]
    );
  };

  return (
    <div className="space-y-4">
      {/* Property Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Property Name <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter property name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Description <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your property..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Location Coordinates */}
      <div className="space-y-2">
        <FormLabel>Location Coordinates</FormLabel>
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
                    placeholder="-90 to 90"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    placeholder="-180 to 180"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-2">
          <InteractiveMap
            latitude={form.watch('latitude') || -6.2088}
            longitude={form.watch('longitude') || 106.8456}
            onLocationChange={(lat, lng) => {
              form.setValue('latitude', parseFloat(lat.toFixed(6)));
              form.setValue('longitude', parseFloat(lng.toFixed(6)));
            }}
            height="200px"
          />
        </div>
      </div>

      {/* Address */}
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Address <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter full address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Property Type, City, Category */}
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Property Type <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
              <FormLabel>
                City <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
                disabled={citiesLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={citiesLoading ? 'Loading...' : 'Select city'}
                    />
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Category <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
                disabled={categoriesLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        categoriesLoading ? 'Loading...' : 'Select category'
                      }
                    />
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Amenities */}
      <div className="space-y-2">
        <FormLabel>
          Amenities <span className="text-destructive">*</span>
        </FormLabel>
        {amenitiesLoading ? (
          <div className="p-4 border border-border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Loading amenities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
            {amenities?.map((amenity: MasterAmenity) => (
              <div key={amenity.code} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity.code}`}
                  checked={selectedAmenities.includes(amenity.code)}
                  onCheckedChange={() => toggleAmenity(amenity.code)}
                />
                <label
                  htmlFor={`amenity-${amenity.code}`}
                  className="text-sm cursor-pointer"
                >
                  {amenity.name}
                </label>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {selectedAmenities.length} amenities selected
        </p>
        {selectedAmenities.length === 0 && (
          <p className="text-xs text-destructive">Select at least 1 amenity</p>
        )}
      </div>
    </div>
  );
}