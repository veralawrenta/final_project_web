import { getAmenityIcon } from "@/lib/amenitiesIcon";
import { MasterAmenity } from "@/types/amenity";

interface PropertyAmenitiesProps {
  amenities: MasterAmenity[];
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  if (!amenities || amenities.length === 0) return null;
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {amenities.map((amenity) => {
          const Icon = getAmenityIcon(amenity.code);
          return (
            <div
              key={amenity.id}
              className="flex items-center gap-2 p-3 bg-secondary rounded-lg"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-sm">{amenity.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}