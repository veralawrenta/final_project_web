import { formatLocalDate } from "./date";
interface CalendarDay {
  date: string;
  lowestPrice: number | null;
}

export function calculateTotalPrice(
  checkIn: Date,
  checkOut: Date,
  calendar: CalendarDay[]
): number {
  let total = 0;
  const current = new Date(checkIn);

  while (current < checkOut) {
    const dateStr = formatLocalDate(current);
    const day = calendar.find((d) => d.date === dateStr);

    if (day?.lowestPrice) {
      total += day.lowestPrice;
    }

    current.setDate(current.getDate() + 1);
  }

  return total;
}
