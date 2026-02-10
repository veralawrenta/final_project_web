import { DateRange } from "react-day-picker";
//convert all dates into pure calendar date string to strip down the time and timezone
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

//converting string back to date object guarantees no timezone shift and accidental utc parsing
export function fromDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

//parse ISO string date to Date object
export function parseISODate(isoString: string): Date {
  const dateOnly = isoString.split("T")[0];
  return fromDateString(dateOnly);
};

//removing time to date
export function normalizeLocalDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};


export function countNights(
  start?: Date,
  end?: Date
): number {
  if (!start || !end) return 0;

  const s = normalizeLocalDate(start);
  const e = normalizeLocalDate(end);

  const diff =
    e.getTime() - s.getTime();

  if (diff <= 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
};

export function isBeforeToday(date: Date): boolean {
  const today = normalizeLocalDate(new Date());
  const d = normalizeLocalDate(date);
  return d < today;
}
