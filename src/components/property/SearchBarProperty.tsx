"use client";
import { Button } from "@/components/ui/button";
import { useGetMonthCalendarSearch } from "@/hooks/useProperty";
import { addMonths, format, isBefore, startOfDay } from "date-fns";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DatePicker } from "../DatePicker";

interface Props {
  propertyId: number;
  maxGuests?: number;
  defaultCheckIn?: Date;
  defaultCheckOut?: Date;
 guests?: number;
 onGuestsChange : (guests: number) => void;
}

export function PropertyDetailSearchBar({
  propertyId,
  maxGuests = 10,
  defaultCheckIn,
  defaultCheckOut,
  guests,
  onGuestsChange,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkIn, setCheckIn] = useState<Date | undefined>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(defaultCheckOut);
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);

  const maxCheckoutDate = checkIn ? addMonths(checkIn, 1) : undefined;

  const calendarMonth = checkIn ?? new Date();

  const { data } = useGetMonthCalendarSearch(propertyId, calendarMonth, true);

  const calendarForPicker = useMemo(() => {
    return (data?.calendar ?? []).map((day) => ({
      date: day.date,
      lowestPrice: day.lowestPrice,
      isSeasonalRate: day.roomPrices?.some((r) => r.isSeasonalRate) ?? false,
    }));
  }, [data?.calendar]);

  const search = () => {
    if (!checkIn || !checkOut) return;
    const params = new URLSearchParams({
      checkIn: format(checkIn, "dd-MM-yyyy"),
      checkOut: format(checkOut, "dd-MM-yyyy"),
      guests: String(guests),
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="glass rounded-2xl p-4 md:p-6 shadow-strong">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DatePicker
          label="Check-in"
          open={openCheckIn}
          onOpenChange={setOpenCheckIn}
          value={checkIn}
          onSelect={(date) => {
            if (!date) return;
            setCheckIn(date);
            setCheckOut(undefined);
            setOpenCheckIn(false);
          }}
          disabledDate={(date: Date) => {
            const d = date;
            if (isBefore(startOfDay(d), startOfDay(new Date()))) return true;
            const day = data?.calendar.find(
              (c) => c.date === format(d, "dd-MM-yyyy"),
            );
            if (day && day.availableRoomsCount === 0) return true;
            return false;
          }}
          calendarData={calendarForPicker}
        />

        <DatePicker
          label="Check-out"
          open={openCheckOut}
          onOpenChange={setOpenCheckOut}
          value={checkOut}
          disabled={!checkIn}
          onSelect={(date) => {
            if (!date) return;
            setCheckOut(date);
            setOpenCheckOut(false);
          }}
          disabledDate={(date: Date) => {
            if (!checkIn) return true;

            const d = date;

            if (d <= checkIn) return true;
            if (maxCheckoutDate && d > maxCheckoutDate) return true;

            const day = data?.calendar.find(
              (c) => c.date === format(d, "dd-MM-yyyy"),
            );

            if (day && day.availableRoomsCount === 0) return true;

            return false;
          }}
          calendarData={calendarForPicker}
        />

        <div>
          <label className="block text-xs mb-1.5 text-muted-foreground font-medium">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => onGuestsChange(Number(e.target.value))}
            className="w-full h-12 bg-secondary rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} Guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-end gap-2">
          <Button
            className="h-12 w-full"
            disabled={!checkIn || !checkOut}
            onClick={search}
          >
            <Search className="h-4 w-4 mr-2" />
            Check Availability
          </Button>
        </div>
      </div>
    </div>
  );
}
