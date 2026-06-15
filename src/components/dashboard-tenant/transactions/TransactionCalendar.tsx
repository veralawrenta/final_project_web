import { Button } from "@/components/ui/button";
import { filterToDisplayStatus, TransactionManagementPayload, transactionStatusConfig, TransactionStatusFilter } from "@/types/transaction";
import { getDaysInMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TransactionCalendarProps {
  transactions: TransactionManagementPayload[];
  activeStatus: TransactionStatusFilter;
  calendarMonth: Date,
  setCalendarMonth: (date: Date) => void;
};

const getFirstDayOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const TransactionCalendar = ({transactions, activeStatus, calendarMonth, setCalendarMonth} : TransactionCalendarProps) => {
  const getTransactionForDate = (day: number) => {
    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return transactions.filter((b) => 
    dateStr >= b.checkIn &&
    dateStr < b.checkOut &&
    (activeStatus === "all" || b.displayStatus === filterToDisplayStatus[activeStatus]),
    );
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))
          }
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="font-heading font-bold text-lg">
          {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))
          }
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
 
      {/* Day Labels */}
      <div className="grid grid-cols-7 border-b border-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>
 
      <div className="grid grid-cols-7">
        {Array.from({ length: getFirstDayOfMonth(calendarMonth) }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border bg-muted/20" />
        ))}
 
        {/* Day cells */}
        {Array.from({ length: getDaysInMonth(calendarMonth) }).map((_, i) => {
          const day = i + 1;
          const dayBookings = getTransactionForDate(day);
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === calendarMonth.getMonth() &&
            new Date().getFullYear() === calendarMonth.getFullYear();
 
          return (
            <div
              key={day}
              className={`min-h-[100px] border-b border-r border-border p-1.5 ${isToday ? 'bg-primary/5' : ''}`}
            >
              <span
                className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-lg ${
                  isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {day}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayBookings.slice(0, 2).map((b) => (
                  <div
                    key={b.transactionId}
                    className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium ${transactionStatusConfig[b.displayStatus].bgColor} ${transactionStatusConfig[b.displayStatus].color}`}
                    title={`${b.user.firstName} - ${b.room.property.propertyName}`}
                  >
                    {`${b.user.firstName} ${b.user.lastName}`}
                  </div>
                ))}
                {dayBookings.length > 2 && (
                  <span className="text-[10px] text-muted-foreground px-1.5">
                    +{dayBookings.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionCalendar;
