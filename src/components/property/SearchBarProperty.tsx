"use client";

import { Button } from "@/components/ui/button";
import { useGetMonthCalendarSearch } from "@/hooks/useProperty";
import { calculateTotalPrice } from "@/lib/date/calculatePrice";
import {
  countNights,
  formatLocalDate,
  isBeforeToday,
  normalizeLocalDate,
} from "@/lib/date/date";
import { addMonths } from "date-fns";
import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { DatePicker } from "../DatePicker";

interface Props {
  propertyId: number;
  maxGuests?: number;
}

export function PropertyDetailSearchBar({ propertyId, maxGuests = 6 }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(1);
  const [openCheckIn, setOpenCheckIn] = useState(false);
  const [openCheckOut, setOpenCheckOut] = useState(false);

  const maxCheckoutDate = checkIn ? addMonths(checkIn, 1) : undefined;

  const calendarMonth = normalizeLocalDate(checkIn ?? new Date());

  const { data } = useGetMonthCalendarSearch(propertyId, calendarMonth, true);

  const nights = countNights(checkIn, checkOut);

  const totalPrice =
    checkIn && checkOut && data
      ? calculateTotalPrice(checkIn, checkOut, data.calendar)
      : 0;

  const search = () => {
    if (!checkIn || !checkOut) return;

    // Navigate to the same page with updated query params
    const params = new URLSearchParams({
      checkIn: formatLocalDate(checkIn),
      checkOut: formatLocalDate(checkOut),
      guests: guests.toString(),
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="glass rounded-2xl p-4 md:p-6 shadow-strong">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CHECK-IN */}
        <DatePicker
          label="Check-in"
          open={openCheckIn}
          onOpenChange={setOpenCheckIn}
          value={checkIn}
          onSelect={(date) => {
            if (!date) return;
            setCheckIn(normalizeLocalDate(date));
            setCheckOut(undefined);
            setOpenCheckIn(false);
          }}
          disabledDate={(date) => {
            const d = normalizeLocalDate(date);
            if (isBeforeToday(d)) return true;
            const day = data?.calendar.find(
              (c) => c.date === formatLocalDate(d)
            );
            if (day && day.availableRoomsCount === 0) return true;
            return false;
          }}
          calendar={data?.calendar}
        />

        {/* CHECK-OUT */}
        <DatePicker
          label="Check-out"
          open={openCheckOut}
          onOpenChange={setOpenCheckOut}
          value={checkOut}
          disabled={!checkIn}
          onSelect={(date) => {
            if (!date) return;
            setCheckOut(normalizeLocalDate(date));
            setOpenCheckOut(false);
          }}
          disabledDate={(date) => {
            if (!checkIn) return true;

            const d = normalizeLocalDate(date);

            if (d <= checkIn) return true;
            if (maxCheckoutDate && d > normalizeLocalDate(maxCheckoutDate))
              return true;

            const day = data?.calendar.find(
              (c) => c.date === formatLocalDate(d)
            );

            if (day && day.availableRoomsCount === 0) return true;

            return false;
          }}
          calendar={data?.calendar}
        />

        {/* GUESTS */}
        <div>
          <label className="block text-xs mb-1.5 text-muted-foreground font-medium">
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full h-12 bg-secondary rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} Guest{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* SEARCH BUTTON */}
        <div className="flex flex-col justify-end gap-2">
          {nights > 0 && totalPrice > 0 && (
            <div className="text-xs text-center text-muted-foreground">
              {nights} night{nights > 1 ? "s" : ""} •{" "}
              <strong className="text-foreground">
                ${totalPrice.toLocaleString()}
              </strong>
            </div>
          )}
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