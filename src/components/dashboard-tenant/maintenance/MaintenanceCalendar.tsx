"use client";
import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import { RoomNonAvailability } from "@/types/room";
import { fromDateString } from "@/lib/date";

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
  // Expand every blocked range into individual dates for calendar highlighting
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
      className="w-full"
    />
  );
};

export default MaintenanceCalendar;