import { TransactionStatus } from "@/types/transaction";
import { CalendarDays, CheckCircle, Clock, XCircle } from "lucide-react";

export const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  [TransactionStatus.WAITING_FOR_PAYMENT]: {
    label: "Awaiting Payment",
    className:
      "bg-[hsl(var(--status-pending))]/10 text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]/20",
    icon: Clock,
  },
  [TransactionStatus.WAITING_FOR_CONFIRMATION]: {
    label: "Pending Confirmation",
    className:
      "bg-[hsl(var(--status-pending))]/10 text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]/20",
    icon: Clock,
  },
  [TransactionStatus.CONFIRMED]: {
    label: "Confirmed",
    className: "bg-primary/10 text-primary border-primary/20",
    icon: CalendarDays,
  },
  [TransactionStatus.COMPLETED]: {
    label: "Completed",
    className:
      "bg-[hsl(var(--status-confirmed))]/10 text-[hsl(var(--status-confirmed))] border-[hsl(var(--status-confirmed))]/20",
    icon: CheckCircle,
  },
  [TransactionStatus.CANCELLED_BY_USER]: {
    label: "Cancelled by You",
    className:
      "bg-[hsl(var(--status-cancelled))]/10 text-[hsl(var(--status-cancelled))] border-[hsl(var(--status-cancelled))]/20",
    icon: XCircle,
  },
  [TransactionStatus.CANCELLED_BY_TENANT]: {
    label: "Cancelled by Tenant",
    className:
      "bg-[hsl(var(--status-cancelled))]/10 text-[hsl(var(--status-cancelled))] border-[hsl(var(--status-cancelled))]/20",
    icon: XCircle,
  },
  [TransactionStatus.EXPIRED]: {
    label: "Expired",
    className: "bg-muted text-muted-foreground border-border",
    icon: XCircle,
  },
};