import {
  Wifi,
  Car,
  Waves,
  Wind,
  Utensils,
  Dumbbell,
  ShieldCheck,
  Bus,
  PawPrint,
  CigaretteOff,
  type LucideIcon,
} from "lucide-react";

const amenityIconMap: Record<string, LucideIcon> = {
  WIFI: Wifi,
  POOL: Waves,
  PARKING: Car,
  AC: Wind,
  BREAKFAST: Utensils,
  GYM: Dumbbell,
  FRONT_DESK: ShieldCheck,
  SHUTTLE: Bus,
  PET: PawPrint,
  NON_SMOKING: CigaretteOff,
};

export function getAmenityIcon(code?: string | null): LucideIcon {
  if (!code) return Wifi;
  return amenityIconMap[code] ?? Wifi;
}
