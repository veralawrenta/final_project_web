import { PropertyInfo } from "@/types/property";
import { formatDate } from "date-fns";
import {
  Building2,
  Calendar,
  ChevronDown,
  Clock,
  MapPin,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

interface DetailStepProps {
  property: PropertyInfo;
  checkIn: string;
  checkOut: string;
  totalGuests: number;
  bookedUnits: number;
  specialRequest: string;
  nights: number;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onTotalGuestsChange: (guests: number) => void;
  onBookedUnitsChange: (units: number) => void;
  onSpecialRequestChange: (request: string) => void;
}
const CreateTransactionStep = ({
  property,
  checkIn,
  checkOut,
  totalGuests,
  bookedUnits,
  specialRequest,
  nights,
  onCheckInChange,
  onCheckOutChange,
  onTotalGuestsChange,
  onBookedUnitsChange,
  onSpecialRequestChange,
}: DetailStepProps) => (
  <>
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
      <div className="relative h-48">
        <img
          src={property.propertyImage}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="font-bold text-xl">{property.name}</h2>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-sm opacity-90">
              <MapPin className="h-3.5 w-3.5" /> {property.address}
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-current text-yellow-400" />{" "}
              {property.ratings}
              <span className="opacity-75">({property.reviews})</span>
            </span>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
      <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" /> Your Trip
      </h3>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={checkIn}
              min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
              onChange={(e) => onCheckInChange(e.target.value)}
              className="w-full pl-11 pr-3 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Check-out
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={checkOut}
              min={
                checkIn ||
                new Date(Date.now() + 86400000).toISOString().split("T")[0]
              }
              onChange={(e) => onCheckOutChange(e.target.value)}
              className="w-full pl-11 pr-3 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Guests
          </label>
          <div className="relative">
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={totalGuests}
              onChange={(e) => onTotalGuestsChange(Number(e.target.value))}
              className="w-full pl-11 pr-8 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} guest{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Units
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={bookedUnits}
              onChange={(e) => onBookedUnitsChange(Number(e.target.value))}
              className="w-full pl-11 pr-8 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} unit{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {nights > 0 && (
        <div className="mt-4 p-3 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <Clock className="h-4 w-4" />
            {nights} night{nights > 1 ? "s" : ""} ·{" "}
            {formatDate(checkIn, "dd MM yyyy")} →{" "}
            {formatDate(checkOut, "dd MM yyyy")}
          </div>
        </div>
      )}
    </div>

    <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" /> Special Requests
      </h3>
      <textarea
        value={specialRequest}
        onChange={(e) => onSpecialRequestChange(e.target.value)}
        placeholder="Early check-in, extra pillows, airport transfer..."
        rows={3}
        className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none placeholder:text-muted-foreground/60"
      />
      <p className="text-xs text-muted-foreground mt-2">
        Special requests are subject to availability
      </p>
    </div>
  </>
);

export default CreateTransactionStep;
