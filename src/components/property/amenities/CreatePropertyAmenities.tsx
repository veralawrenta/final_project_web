"use client";

import { getAmenityIcon } from "@/lib/amenitiesIcon";
import { cn } from "@/lib/utils";
import { MasterAmenity } from "@/types/amenity";

interface CreatePropertyAmenityProps {
  amenities: MasterAmenity[];
  value: number[]; // selected amenity IDs
  onChange: (value: number[]) => void;
  disabled?: boolean;
}

export function CreatePropertyAmenity({
  amenities,
  value,
  onChange,
  disabled = false,
}: CreatePropertyAmenityProps) {
  const toggleAmenity = (amenityId: number) => {
    if (value.includes(amenityId)) {
      onChange(value.filter((id) => id !== amenityId));
    } else {
      onChange([...value, amenityId]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {amenities.map((amenity) => {
        const Icon = getAmenityIcon(amenity.code);
        const selected = value.includes(amenity.id);

        return (
          <button
            key={amenity.id}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => toggleAmenity(amenity.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3 text-left transition",
              "focus:outline-none focus:ring-2 focus:ring-primary",
              selected
                ? "border-primary bg-primary/10"
                : "border-border bg-background hover:bg-secondary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                selected ? "text-primary" : "text-muted-foreground"
              )}
            />
            <span className="text-sm font-medium">{amenity.name}</span>
          </button>
        );
      })}
    </div>
  );
}
