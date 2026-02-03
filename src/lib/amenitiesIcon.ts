import {
    Wifi,
    Car,
    Waves,
    Utensils,
    Tv,
    Wind,
    Coffee,
    Dumbbell,
    Shield,
    Snowflake,
    WashingMachine,
    Flame,
    Mountain,
    TreeDeciduous,
    type LucideIcon,
  } from "lucide-react";
  
  const amenityIconMap: Record<string, LucideIcon> = {
    WIFI: Wifi,
    PARKING: Car,
    POOL: Waves,
    KITCHEN: Utensils,
    TV: Tv,
    AC: Wind,
    COFFEE: Coffee,
    GYM: Dumbbell,
    SECURITY: Shield,
    HEATING: Flame,
    WASHER: WashingMachine,
    FRIDGE: Snowflake,
    MOUNTAIN_VIEW: Mountain,
    GARDEN: TreeDeciduous,
  };
  
  export function getAmenityIcon(code?: string | null): LucideIcon {
    if (!code) return Wifi;
    return amenityIconMap[code] ?? Wifi;
  }
  