import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { DayButton } from "react-day-picker";

interface PropertyDayButtonProps
  extends React.ComponentProps<typeof DayButton> {
  calendar: {
    date: string;
    lowestPrice: number | null;
    roomPrices?: { isSeasonalRate: boolean }[];
  }[];
}

// Compact price: 2.999.999 → "2,9jt" | 150.000 → "150rb"
function formatCompact(price: number): string {
  if (price >= 1_000_000) {
    const val = price / 1_000_000;
    // show one decimal only if it's not a whole number
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
    return `${formatted}jt`;
  }
  if (price >= 1_000) {
    return `${Math.round(price / 1_000)}rb`;
  }
  return String(price);
}

export function PropertyDayButton({
  day,
  calendar,
  modifiers,
  className,
  ...props
}: PropertyDayButtonProps) {
  const dayData = calendar.find(
    (d) => d.date === format(day.date, "dd-MM-yyyy")
  );

  const isSeasonal = dayData?.roomPrices?.some((r) => r.isSeasonalRate);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "flex flex-col items-center justify-center h-auto w-full min-w-0 rounded-md py-1 px-0",
        modifiers.selected && "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      <span className="text-sm leading-none">{day.date.getDate()}</span>

      {dayData?.lowestPrice && (
        <span
          className={cn(
            "text-[9px] leading-tight mt-0.5",
            modifiers.selected
              ? "text-primary-foreground/80"
              : isSeasonal
              ? "text-orange-500 font-semibold"
              : "text-muted-foreground"
          )}
        >
          {formatCompact(dayData.lowestPrice)}
        </span>
      )}
    </Button>
  );
}