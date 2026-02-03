import { Button } from "@/components/ui/button";
import { formatLocalDate } from "@/lib/date/date";
import { cn } from "@/lib/utils";
import type { DayButton } from "react-day-picker";

interface PropertyDayButtonProps
  extends React.ComponentProps<typeof DayButton> {
  calendar: {
    date: string;
    lowestPrice: number | null;
    roomPrices?: { isSeasonalRate: boolean }[];
  }[];
}

export function PropertyDayButton({
  day,
  calendar,
  modifiers,
  className,
  ...props
}: PropertyDayButtonProps) {
  const dayData = calendar.find(
    (d) => d.date === formatLocalDate(day.date)
  );

  const isSeasonal = dayData?.roomPrices?.some(
    (r) => r.isSeasonalRate
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "flex flex-col h-12 w-full rounded-md",
        modifiers.selected && "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      <span className="text-sm">{day.date.getDate()}</span>

      {dayData?.lowestPrice && (
        <span
          className={cn(
            "text-[10px]",
            isSeasonal
              ? "text-orange-500 font-semibold"
              : "text-muted-foreground"
          )}
        >
          ${dayData.lowestPrice}
        </span>
      )}
    </Button>
  );
}
