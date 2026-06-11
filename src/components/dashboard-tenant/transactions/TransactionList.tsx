import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/price/currency";
import { Transactions, transactionStatusConfig } from "@/types/transaction";
import { formatDate } from "date-fns";
import { CheckCircle, Eye, MoreHorizontal, XCircle } from "lucide-react";
import { toast } from "sonner";

interface TransactionListProps {
  transactions : Transactions[];
  onViewTransaction? : (transactions : Transactions) => void;
  onCancelRequest: (transactions : Transactions) => void;
};

const TransactionList = ({transactions, onViewTransaction, onCancelRequest} : TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center flex flex-col items-center justify-center min-h-[240px]">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border text-xs text-muted-foreground mb-3 font-medium">
        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Zero Results
      </div>
      <h4 className="font-medium text-sm text-foreground">No matching reservations</h4>
      <p className="text-xs text-muted-foreground max-w-xs mt-1">
        Try broadening your search or modifying your booking status filters to see available data.
      </p>
    </div>
    )
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[1fr_1.2fr_0.8fr_0.6fr_0.5fr_0.3fr] gap-4 px-5 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span>Guest</span>
        <span>Property / Room</span>
        <span>Dates</span>
        <span>Amount</span>
        <span>Status</span>
        <span></span>
      </div>
 
      <div className="divide-y divide-border">
        {transactions.map((t) => {
          const status = transactionStatusConfig[t.status];
          const StatusIcon = status.icon;
          const nights = Math.ceil(
            (new Date(t.checkOut).getTime() - new Date(t.checkIn).getTime()) /
              (1000 * 60 * 60 * 24),
          );
 
          return (
            <div
              key={t.transactionId}
              className="md:grid md:grid-cols-[1fr_1.2fr_0.8fr_0.6fr_0.5fr_0.3fr] md:gap-4 md:items-center flex flex-col gap-3 p-4 md:px-5 md:py-4 hover:bg-muted/20 transition-colors"
            >
              {/* Guest */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                  {`${t.user.firstName[0]} ${t.user.lastName[0]}`}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{`${t.user.firstName} ${t.user.lastName}`}</p>
                  <p className="text-xs text-muted-foreground font-mono">{t.transactionId}</p>
                </div>
              </div>
 
              {/* Property */}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.room.property.propertyName}</p>
                <p className="text-xs text-muted-foreground">{t.room.roomName}</p>
              </div>
 
              {/* Dates */}
              <div>
                <p className="text-sm">
                  {formatDate(t.checkIn, "dd-MM-yyyy")} – {formatDate(t.checkOut, "dd-MM-yyyy")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {nights} night{nights > 1 ? 's' : ''} · {t.totalGuests} guest{t.totalGuests > 1 ? 's' : ''}
                </p>
              </div>
 
              {/* Amount */}
              <div>
                <p className="text-sm font-bold">{formatCurrency(t.totalPrice)}</p>
                <p className="text-xs text-muted-foreground">{t.paymentMethod}</p>
              </div>
 
              {/* Status */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit ${status.bgColor} ${status.color}`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {status.label}
              </div>
 
              {/* Actions */}
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewTransaction?.(t)}>
                      <Eye className="h-4 w-4 mr-2" /> View Details
                    </DropdownMenuItem>
                    {t.status === "pending" && (
                      <DropdownMenuItem onClick={() => toast.success(`Transaction no. ${t.transactionId} confirmed!`)}>
                        <CheckCircle className="h-4 w-4 mr-2" /> Confirm
                      </DropdownMenuItem>
                    )}
                    {(t.status === 'pending' || t.status === 'confirmed') && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onCancelRequest(t)}
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Cancel
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionList;
