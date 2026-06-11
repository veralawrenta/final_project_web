"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetTransactionIdByTenant } from "@/hooks/useTransactions";
import { transactionStatusConfig } from "@/types/transaction";
import { formatCurrency } from "@/lib/price/currency";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  FileText,
  Image,
  Users,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { formatDate } from "date-fns";

interface TenantTransactionDetailsProps {
  onBack: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const TenantTransactionDetails = ({
  onBack,
  onConfirm,
  onCancel,
}: TenantTransactionDetailsProps) => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);

  const { data: t, isPending } = useGetTransactionIdByTenant(
    Array.isArray(transactionId) ? transactionId[0] : transactionId,
  );

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground text-sm">
          Loading transaction...
        </div>
      </div>
    );
  }

  if (!t) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground text-sm">Transaction not found.</p>
      </div>
    );
  }

  const status = transactionStatusConfig[t.status];
  const StatusIcon = status.icon;

  const nights = Math.ceil(
    (new Date(t.checkOut).getTime() - new Date(t.checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const isBankTransfer = t.paymentMethod === "BANK_TRANSFER";
  const canCancel = t.status === "pending" || t.status === "confirmed";

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    setShowCancelDialog(false);
    onCancel?.();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-heading font-bold">Booking Details</h1>
          <p className="text-sm text-muted-foreground font-mono">
            {t.transactionId}
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${status.bgColor} ${status.color}`}
        >
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Property & Booking Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Card */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="aspect-video w-full bg-muted relative">
              <img
                src={
                  t.room.property.propertyImages?.urlImages ||
                  "/placeholder.svg"
                }
                alt={t.room.property.propertyName}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-xl px-3 py-1.5">
                <p className="text-sm font-semibold">
                  {t.room.property.propertyName}
                </p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Room</p>
                    <p className="text-sm font-semibold">{t.room.roomName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Guests</p>
                    <p className="text-sm font-semibold">
                      {t.totalGuests} guest{t.totalGuests > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in</p>
                    <p className="text-sm font-semibold">
                      {formatDate(t.checkIn, "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-out</p>
                    <p className="text-sm font-semibold">
                      {formatDate(t.checkOut, "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {nights} night{nights > 1 ? "s" : ""}
                </span>
                <span className="text-lg font-heading font-bold text-primary">
                  {formatCurrency(t.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Proof (Bank Transfer only) */}
          {isBankTransfer && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Payment Proof
              </h3>
              {t.paymentProof ? (
                <div className="space-y-3">
                  <div
                    className="relative rounded-xl overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowProofModal(true)}
                  >
                    <img
                      src={t.paymentProof}
                      alt="Payment proof"
                      className="w-full max-h-80 object-contain bg-muted"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 hover:bg-foreground/10 transition-colors">
                      <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
                        <Image className="h-3.5 w-3.5 mr-1.5" /> Click to
                        enlarge
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl text-xs"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Proof
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-status-pending/10 border border-status-pending/30 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-status-pending shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      No payment proof uploaded yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      The guest has not submitted proof of payment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Guest & Payment Info */}
        <div className="space-y-6">
          {/* Guest Info */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <h3 className="font-heading font-semibold text-sm">
              Guest Information
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {t.user.firstName[0]}
                {t.user.lastName[0]}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {t.user.firstName} {t.user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{t.user.email}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <h3 className="font-heading font-semibold text-sm">
              Payment Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <div className="flex items-center gap-1.5 font-medium">
                  <CreditCard className="h-3.5 w-3.5" />
                  {t.paymentMethod ?? "—"}
                </div>
              </div>
              {t.paymentDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span className="font-medium">
                    {formatDate(t.paymentDate, "dd MMM yyyy")}
                  </span>
                </div>
              )}
              {t.createdAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Booking Date</span>
                  <span className="font-medium">
                    {formatDate(t.createdAt, "dd MMM yyyy")}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-lg font-heading font-bold text-primary">
                  {formatCurrency(t.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {(t.status === "pending" || t.status === "confirmed") && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-heading font-semibold text-sm">Actions</h3>
              {t.status === "pending" && (
                <Button
                  className="w-full gap-2 rounded-xl"
                  onClick={handleConfirm}
                >
                  <CheckCircle className="h-4 w-4" /> Confirm Booking
                </Button>
              )}
              {canCancel ? (
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="h-4 w-4" /> Cancel Booking
                </Button>
              ) : !isBankTransfer ? (
                <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Cancellation is not available for {t.paymentMethod}{" "}
                    payments. Please contact support for assistance.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel {t.user.firstName} {t.user.lastName}'s
              reservation for {t.room.property.propertyName} ({t.room.roomName}
              ). The guest will be notified and any payment will need to be
              refunded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Proof Modal */}
      {showProofModal && t.paymentProof && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm"
          onClick={() => setShowProofModal(false)}
        >
          <div
            className="max-w-3xl max-h-[90vh] p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={t.paymentProof}
              alt="Payment proof"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <Button
              variant="secondary"
              size="sm"
              className="mt-2 w-full rounded-xl"
              onClick={() => setShowProofModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantTransactionDetails;
