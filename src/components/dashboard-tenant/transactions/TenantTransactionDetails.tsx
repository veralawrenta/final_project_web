"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCancelTransactionByTenant, useConfirmTransaction, useGetTransactionIdByTenant, useRejectTransaction } from "@/hooks/useTenantTransactions";
import { formatEnum } from "@/lib/enum-utils";
import { formatCurrency } from "@/lib/price/currency";
import { TransactionStatus, transactionStatusConfig } from "@/types/transaction";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Building2,
  Calendar,
  CheckCircle,
  Copy,
  Check,
  CreditCard,
  Download,
  FileText,
  Image,
  Mail,
  Hash,
  Users,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

interface TenantTransactionDetailsProps {
  onBack: () => void;
}

const TenantTransactionDetails = ({
  onBack,
}: TenantTransactionDetailsProps) => {
  const params = useParams();
  const transactionId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [copied, setCopied] = useState(false);
  
  const { data: t, isPending } = useGetTransactionIdByTenant(transactionId);

  const confirmMutation = useConfirmTransaction();
  const rejectMutation = useRejectTransaction();
  const cancelMutation = useCancelTransactionByTenant();

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

  const status = transactionStatusConfig[t.displayStatus];
  const StatusIcon = status?.icon;

  const nights = Math.ceil(
    (new Date(t.checkOut).getTime() - new Date(t.checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const isBankTransfer = t.paymentMethod === "BANK_TRANSFER";
  const canCancel = t.status === TransactionStatus.WAITING_FOR_PAYMENT;
  const canReject = t.status === TransactionStatus.WAITING_FOR_CONFIRMATION;
  const canConfirm = t.status === TransactionStatus.WAITING_FOR_CONFIRMATION;

  const handleConfirm = () => {
    confirmMutation.mutate(transactionId)
  };

  const handleReject = () => {
    setShowRejectDialog(false);
    rejectMutation.mutate({transactionId, reason: rejectReason.trim()});
    setRejectReason("");
  };

  const handleCancel = () => {
    setShowCancelDialog(false)
    cancelMutation.mutate({transactionId, reason:cancelReason.trim()})
    setCancelReason("");
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(t.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
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
        </div>
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${status?.className}`}
        >
          {StatusIcon && <StatusIcon className="h-4 w-4" />}
          {status?.label}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="aspect-video w-full bg-muted relative">
              <img
                src={
                  t.room.property.propertyImages[0]?.urlImages ||
                  "/placeholder.svg"
                }
                alt={t.room.property.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-xl px-3 py-1.5">
                <p className="text-sm font-semibold">
                  {t.room.property.name}
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
                    <p className="text-sm font-semibold">{t.room.name}</p>
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
                      {format(t.checkIn, "dd-MM-yyyy")}
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
                      {format(t.checkOut, "dd-MM-yyyy")}
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
                      No payment made or uploaded yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                     The guest selected but has not submitted proof of payment. You may cancel this booking until payment is uploaded.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Guest & Payment Info */}
        <div className="space-y-6">
          {/* Refined Guest Info Card */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <h3 className="font-heading font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Primary Guest
            </h3>
            
            <div className="flex items-center gap-3.5 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold text-sm shadow-inner shrink-0">
                {t.user.firstName[0].toUpperCase()}
                {t.user.lastName[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-heading font-bold text-base text-foreground truncate">
                  {t.user.firstName} {t.user.lastName}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                  <span className="truncate">{t.user.email}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                 Booking Reference ID
                </span>
                <div className="flex items-center justify-between gap-2 bg-secondary/60 border border-border/80 px-2.5 py-1.5 rounded-xl group">
                  <code className="text-xs font-mono font-semibold text-foreground truncate select-all">
                    {t.id}
                  </code>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 focus:outline-none focus:ring-1 focus:ring-primary/40"
                    title="Copy ID to clipboard"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500 animate-in fade-in" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform active:scale-90" />
                    )}
                  </button>
                </div>
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
                  {formatEnum(t.paymentMethod) ?? "—"}
                </div>
              </div>
              {t.paymentDate && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span className="font-medium">
                    {format(t.paymentDate, "dd-MM-yyyy")}
                  </span>
                </div>
              )}
              {t.createdAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Booking Date</span>
                  <span className="font-medium">
                    {format(t.createdAt, "dd-MM-yyyy")}
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
          {(canConfirm || canCancel || canReject) && (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
              <h3 className="font-heading font-semibold text-sm">Actions</h3>
              {canConfirm && (
                <Button
                  className="w-full gap-2 rounded-xl"
                  onClick={handleConfirm}
                >
                  <CheckCircle className="h-4 w-4" /> Confirm Booking
                </Button>
              )}
              {canReject && (
                <Button
                variant={"outline"}
                onClick={() => setShowRejectDialog(true)}
                className="w-full gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10" >
                <Ban className="h-4 w-4" /> Reject Transaction
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                  className="w-full gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4" /> Cancel Booking
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={(o) => { setShowCancelDialog(o); if (!o) setCancelReason(''); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel {`${t.user.firstName} ${t.user.lastName}`}'s reservation for {t.room.property.name} ({t.room.name})?
              The guest has not uploaded their payment proof yet. They will be notified with the reason below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason for cancellation <span className="text-destructive">*</span></Label>
            <Textarea
              id="cancel-reason"
              placeholder="e.g. Room unavailable for selected dates, property closed for maintenance..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              maxLength={500}
              rows={4}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground text-right">{cancelReason.length}/500</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowCancelDialog(false)}>Keep Booking</Button>
            <Button
              onClick={handleCancel}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={(o) => { setShowRejectDialog(o); if (!o) setRejectReason(''); }}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reject this booking?</DialogTitle>
            <DialogDescription>
              Reject {`${t.user.firstName} ${t.user.lastName}`}'s payment for {t.room.property.name} ({t.room.name}).
              {isBankTransfer
                ? ' If the payment proof is invalid or insufficient, provide a reason so the guest can resubmit or request a refund.'
                : ' The Xendit payment will need to be refunded. The guest will be notified with the reason below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason for rejection <span className="text-destructive">*</span></Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Payment proof unclear, amount mismatch, suspicious transaction..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={500}
              rows={4}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground text-right">{rejectReason.length}/500</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setShowRejectDialog(false)}>Keep Booking</Button>
            <Button
              onClick={handleReject}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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