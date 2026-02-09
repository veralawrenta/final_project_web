"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { normalizeLocalDate } from "@/lib/date/date";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { DateRange, Matcher } from "react-day-picker";

export interface DateRangePickerProps {
  value?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  numberOfMonths?: 1 | 2;
  disabledRanges?: Matcher[];
}

function DateRangePicker({
  value,
  onSelect,
  placeholder = "Pick start and end date",
  className,
  disabled = false,
  id,
  numberOfMonths: numberOfMonthsProp = 2,
  disabledRanges = [],
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const today = useMemo(() => normalizeLocalDate(new Date()), []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = () => setIsSmallScreen(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const numberOfMonths = isSmallScreen ? 1 : numberOfMonthsProp;

  const handleSelect = useCallback(
    (range: DateRange | undefined) => {
      if (!range) {
        onSelect?.(undefined);
        return;
      }

      const normalized: DateRange = {
        from: range.from ? normalizeLocalDate(range.from) : undefined,
        to: range.to ? normalizeLocalDate(range.to) : undefined,
      };

      onSelect?.(normalized);

      if (normalized.from && normalized.to) {
        setOpen(false);
      }
    },
    [onSelect]
  );

  const displayText = useMemo(() => {
    if (!value?.from) return placeholder;
    
    try {
      // Check if the date is valid before formatting
      if (isNaN(value.from.getTime())) return placeholder;
      
      if (!value.to) return format(value.from, "MMM d, yyyy");
      
      // Check if end date is valid
      if (isNaN(value.to.getTime())) return format(value.from, "MMM d, yyyy");
      
      return `${format(value.from, "MMM d, yyyy")} – ${format(
        value.to,
        "MMM d, yyyy"
      )}`;
    } catch (error) {
      // If date formatting fails, return placeholder
      console.error("Date formatting error:", error);
      return placeholder;
    }
  }, [value, placeholder]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          data-empty={!value?.from}
          className={cn(
            "data-[empty=true]:text-muted-foreground w-full min-w-0 justify-start text-left font-normal sm:w-xs",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{displayText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="range"
          defaultMonth={value?.from ?? today}
          selected={value}
          onSelect={handleSelect}
          numberOfMonths={numberOfMonths}
          showOutsideDays={false}
          disabled={[{ before: today }, ...disabledRanges]}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DateRangePicker };