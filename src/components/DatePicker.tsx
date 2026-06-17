"use client";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { PropertyDayButton } from "./property/search-bar/PropertyDayButton";

interface CalendarDay {
  date: string;
  lowestPrice: number | null;
  roomPrices?: { isSeasonalRate: boolean }[];
}

interface DatePickerProps {
  label: string;
  value?: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (date?: Date) => void;
  disabled?: boolean;
  disabledDate?: (date: Date) => boolean;
  calendar?: CalendarDay[];
}

export function DatePicker({
  label,
  value,
  open,
  onOpenChange,
  onSelect,
  disabled,
  disabledDate,
  calendar = [],
}: DatePickerProps) {
  return (
    <div>
      <label className="block text-xs mb-1.5 text-muted-foreground">
        {label}
      </label>

      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full h-12 bg-secondary justify-start"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {value ? format(value, "dd-MM-yyyy") : "Select date"}
          </Button>
        </PopoverTrigger>

        {/* FIX 1: constrain width to viewport on mobile, wider on sm+
            - w-[calc(100vw-2rem)] caps it to screen width minus padding on mobile
            - sm:w-auto lets it size naturally on larger screens
            - overflow-hidden prevents any child from breaking out
            - align="start" avoids it popping off the right edge         */}
        <PopoverContent
          className="p-0 w-[calc(100vw-2rem)] sm:w-auto overflow-hidden"
          align="start"
          sideOffset={8}
        >
          <CalendarComponent
            mode="single"
            selected={value}
            onSelect={onSelect}
            disabled={disabledDate}
            className="p-2 sm:p-3 w-full"
            components={{
              DayButton: (props) => (
                <PropertyDayButton {...props} calendar={calendar} />
              ),
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}