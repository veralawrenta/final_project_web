"use client";
import { useMemo, useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RoomNonAvailability } from "@/types/room";
import { fromDateString } from "@/lib/date/date";
import { DateRange } from "react-day-picker";

interface MaintenanceCalendarProps {
  records: RoomNonAvailability[] | undefined;
  isLoading: boolean;
  selectedDate: DateRange | undefined;
  onSelectDate: (date: DateRange | undefined) => void;
}

const MaintenanceCalendar = ({
  records,
  isLoading,
  selectedDate,
  onSelectDate,
}: MaintenanceCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    selectedDate?.from ?? new Date()
  );

  useEffect(() => {
    // keep internal month in sync when parent changes selectedDate
    if (selectedDate?.from) setCurrentMonth(selectedDate.from);
  }, [selectedDate]);
  const blockedDates = useMemo(() => {
    if (!records) return [];
    const dates: Date[] = [];

    records.forEach((record) => {
      const start = fromDateString(record.startDate);
      const end = fromDateString(record.endDate);
      const current = new Date(start);

      while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });

    return dates;
  }, [records]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCurrentMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
            )
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-sm font-medium">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCurrentMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
            )
          }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Calendar
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        mode="range"
        selected={selectedDate}
        onSelect={onSelectDate}
        modifiers={{ blocked: blockedDates }}
        modifiersStyles={{
          blocked: {
            backgroundColor: "hsl(var(--warning) / 0.2)",
            borderRadius: "50%",
          },
        }}
        className="w-full h-full"
        classNames={{
          months: "w-full",
          month: "w-full space-y-4",
          table: "w-full border-collapse",
          head_row: "flex w-full justify-between mb-2",
          head_cell: "text-muted-foreground rounded-md flex-1 font-medium text-[0.8rem] text-center",
          row: "flex w-full mt-2 justify-between",
          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1 h-10",
          day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-accent rounded-full transition-all mx-auto flex items-center justify-center",
          button_previous: "absolute left-1",
          button_next: "absolute right-1",
          month_caption: "hidden",
        }}
      />
    </div>
  );
};

export default MaintenanceCalendar;