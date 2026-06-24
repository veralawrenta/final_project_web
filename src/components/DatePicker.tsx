"use client";
import { formatCurrency } from "@/lib/price/currency";
import { cn } from "@/lib/utils";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

interface CalendarDay {
  date: string;
  lowestPrice: number | null;
  isSeasonalRate?: boolean;
  availableRoomsCount?: number;
}

interface DatePickerProps {
  label: string;
  value?: Date;
  onSelect: (date: Date) => void;
  calendarData?: CalendarDay[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  disabledDate?: (date: Date) => boolean;
}

export function DatePicker({
  label,
  value,
  onSelect,
  calendarData = [],
  open: controlledOpen,
  onOpenChange,
  disabled = false,
  disabledDate,
}: DatePickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ?? new Date());

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (next: boolean) => {
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };

  // Map calendar data for O(1) lookups by date string
  const priceMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    calendarData.forEach((day) => map.set(day.date, day));
    return map;
  }, [calendarData]);

  // Generate all days needed to display a perfect grid for the current month
  const daysGrid = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  const handleDateClick = (date: Date) => {
    onSelect(date);
    setIsOpen(false);
  };

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="relative w-full">
      <label className="block text-xs mb-1.5 font-medium text-muted-foreground">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 px-3 bg-secondary border border-input rounded-md flex items-center justify-start text-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Calendar className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        <span>{value ? format(value, "dd-MM-yyyy") : "Select date"}</span>
      </button>

      {/* Calendar Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop for easy closing on mobile tap outside */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-0 mt-2 z-50 p-4 bg-background border rounded-xl shadow-lg w-[calc(100vw-2rem)] sm:w-[380px] max-w-sm">
            {/* Header: Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-md hover:bg-accent border"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="font-semibold text-sm">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-md hover:bg-accent border"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday Labels Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-x-1 gap-y-2">
              {daysGrid.map((date, index) => {
                const dateStr = format(date, "dd-MM-yyyy");
                const dayData = priceMap.get(dateStr);
                const isSelected = value && isSameDay(date, value);
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isDisabledByRule = disabledDate?.(date) ?? false;

                return (
                  <button
                    key={index}
                    type="button"
                    disabled={!isCurrentMonth}
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      "h-12 w-full p-1 rounded-md flex flex-col items-center justify-between transition-all focus:outline-none",
                      !isCurrentMonth && "opacity-0 pointer-events-none", // Hide days outside current month completely
                      isDisabledByRule &&
                        isCurrentMonth &&
                        "opacity-30 cursor-not-allowed hover:bg-transparent",
                      isSelected
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-accent",
                    )}
                  >
                    {/* Date Number */}
                    <span className="text-xs font-medium">
                      {format(date, "d")}
                    </span>

                    {/* Price Label */}
                    {dayData?.lowestPrice ? (
                      <span
                        className={cn(
                          "text-[7px] px-1 rounded-sm tracking-tight font-semibold",
                          isSelected
                            ? "text-primary-foreground"
                            : dayData.isSeasonalRate
                              ? "text-orange-500"
                              : "text-blue-600",
                        )}
                      >
                        {formatCurrency(dayData.lowestPrice)}
                      </span>
                    ) : (
                      <span className="h-3 w-1" /> /* Spacer to hold layout balance */
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
