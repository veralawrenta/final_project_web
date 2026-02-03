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
            {value ? format(value, "MMM dd, yyyy") : "Select date"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <CalendarComponent
            mode="single"
            selected={value}
            onSelect={onSelect}
            disabled={disabledDate}
            className="p-3"
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
