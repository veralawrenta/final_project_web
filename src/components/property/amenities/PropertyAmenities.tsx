import { getAmenityIcon } from "@/lib/amenitiesIcon";

interface Amenity {
  id: number;
  name: string;
  code: string | null;
}

interface PropertyAmenitiesProps {
  amenities: Amenity[];
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-heading font-semibold mb-4">
        What this place offers
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {amenities.map((amenity) => {
          const Icon = getAmenityIcon(amenity.code);

          return (
            <div
              key={amenity.id}
              className="flex items-center gap-3 p-3 bg-secondary rounded-xl"
            >
              <Icon className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm">{amenity.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
