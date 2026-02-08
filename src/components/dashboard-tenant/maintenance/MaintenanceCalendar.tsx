"use client";
import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import { RoomNonAvailability } from "@/types/room";
import { fromDateString } from "@/lib/date/date";
import { DateRange } from "react-day-picker";

interface MaintenanceCalendarProps {
  records: RoomNonAvailability[] | undefined;
  isLoading: boolean;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

const MaintenanceCalendar = ({
  records,
  isLoading,
  selectedDate,
  onSelectDate,
}: MaintenanceCalendarProps) => {
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
    <Calendar
      mode="single"
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
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        caption: "flex justify-center pt-1 relative items-center mb-4",
      }}
    />
  );
};

export default MaintenanceCalendar;