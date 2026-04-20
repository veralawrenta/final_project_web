"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    useCancelTransactionByUser,
    useGetTransactionIdByUser,
    useUploadPaymentProof,
} from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/price/currency";
import { STATUS_CONFIG } from "@/lib/transaction-config";
import { BANK, TransactionStatus } from "@/types/transaction";
import { differenceInCalendarDays, formatDate, startOfDay } from "date-fns";
import { ArrowLeft, Badge, CalendarDays, Check, CheckCircle, Copy, CreditCard, Eye, FileImage, Link, MapPin, Shield, Star, Upload, Users, X, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { GrStatusInfo } from "react-icons/gr";
import { toast } from "sonner";


const TransactionDetail = () => {
  const params = useParams();
  const transactionId = params.transactionId as string;
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  const {
    data: transaction,
    isPending,
    isError,
  } = useGetTransactionIdByUser(transactionId);

  const { mutate: cancelBooking, isPending: isCancelling } =
    useCancelTransactionByUser();
  const { mutate: uploadPaymentProof, isPending: isUploading } =
    useUploadPaymentProof();

  const nights = transaction
    ? differenceInCalendarDays(
        startOfDay(new Date(transaction.checkOut)),
        startOfDay(new Date(transaction.checkIn)),
      )
    : 0;

  const statusConfig = transaction
    ? (STATUS_CONFIG[transaction.status] ?? {
        label: transaction.status,
        className: "bg-muted text-muted-foreground border-border",
        icon: Check,
      })
    : null;

  const StatusIcon = statusConfig?.icon;

  const canCancel =
    transaction?.status === TransactionStatus.WAITING_FOR_PAYMENT &&
    !transaction.paymentDate;
  const needUploadPaymentProof =
    transaction?.status === TransactionStatus.WAITING_FOR_PAYMENT &&
    transaction.paymentMethod === "BANK_TRANSFER" &&
    !transaction.paymentProof &&
    !transaction.paymentDate;
  const alreadyUploadedProof =
    transaction?.status === TransactionStatus.WAITING_FOR_CONFIRMATION &&
    !!transaction.paymentProof &&
    !!transaction.paymentDate;

  const fileTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      toast.error("File size exceeds 1MB. Please choose a smaller file.");
      return;
    }

    if (file.type !== fileTypes.find((type) => type === file.type)) {
      toast.error(
        "Invalid file type. Please upload a JPEG, PNG, JPG, or GIF image.",
      );
      return;
    }
    setPaymentProof(file);
    if (file.type !== fileTypes.find((type) => type === file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => setIsPreviewing(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setIsPreviewing(null);
    }
  };

  const handleSubmitPaymentProof = () => {
    if (!paymentProof) {
      toast.error("Please select a payment proof to upload.");
      return;
    }
    uploadPaymentProof(
      {
        paymentProof,
        transactionId,
      },
      {
        onSuccess: () => {
          setPaymentProof(null);
          setIsPreviewing(null);
        },
      },
    );
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(transactionId);
    setCopying(true);
    toast.success("Transaction ID copied to clipboard");
    setTimeout(() => setCopying(false), 2000);
  };

  if (isPending) {
    return (
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-2xl border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      </main>
    );
  }
  if (isError || !transaction) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <CalendarDays className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold">Booking Not Found</h1>
          <p className="text-muted-foreground">
            The booking you're looking for doesn't exist.
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/profile/user/booking">Back to My Bookings</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 pb-10 md:px-8">
        <div className="mx-auto max-w-4xl space-y-6">

          {/* Back */}
          <button
            onClick={() => router.push("/profile/user/booking")}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to My Bookings
          </button>

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-heading font-bold">Booking Details</h1>
                <Badge className={`rounded-lg border px-3 py-1 text-xs font-semibold gap-1.5 ${statusConfig!.className}`}>
                  <GrStatusInfo className="h-3.5 w-3.5" />
                  {statusConfig!.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Booking ID:</span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {transactionId}
                  {copying ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-primary/5 border border-primary/10 px-5 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Total Amount</p>
              <p className="mt-0.5 text-3xl font-heading font-bold text-primary">
                {formatCurrency(transaction.totalPrice)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left Column ───────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Property card */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="relative h-48 bg-muted">
                  {transaction.room.property.propertyImages?.urlImages ? (
                    <img
                      src={transaction.room.property.propertyImages.urlImages}
                      alt={transaction.room.property.propertyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <CalendarDays className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="font-heading font-bold text-xl">{transaction.room.property.propertyName}</h2>
                    <p className="flex items-center gap-1.5 text-sm opacity-90 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {transaction.room.property.city}, {transaction.room.property.address}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Room</p>
                      <p className="mt-1 text-sm font-semibold">{transaction.room.roomName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Guests</p>
                      <p className="mt-1 text-sm font-semibold flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {transaction.totalGuests} guest{transaction.totalGuests !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Duration</p>
                      <p className="mt-1 text-sm font-semibold">{nights} night{nights !== 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Booked on</p>
                      <p className="mt-1 text-sm font-semibold">{transaction.createdAt ? formatDate(transaction.createdAt, "dd MMM yyyy") : "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trip Schedule */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" /> Trip Schedule
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-muted/40 border border-border p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Check-in</p>
                    <p className="mt-1 text-sm font-bold">{formatDate(transaction.checkIn, "dd MMM yyyy")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">From 2:00 PM</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 border border-border p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium">Check-out</p>
                    <p className="mt-1 text-sm font-bold">{formatDate(transaction.checkOut, "dd MMM yyyy")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Before 12:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Upload proof — only WAITING_FOR_PAYMENT + BANK_TRANSFER + no proof yet */}
              {paymentProof && (
                <div className="rounded-2xl border-2 border-[hsl(var(--status-pending))]/30 bg-[hsl(var(--status-pending))]/5 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--status-pending))]/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-[hsl(var(--status-pending))]" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg">Upload Payment Proof</h3>
                      <p className="text-xs text-muted-foreground">Transfer to the account below, then upload your receipt</p>
                    </div>
                  </div>

                  {/* Bank info */}
                  <div className="p-4 bg-card rounded-2xl border border-border space-y-2.5 text-sm mb-5">
                    <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="font-semibold">{BANK.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Account Number</span><span className="font-mono font-semibold">{BANK.number}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Account Holder</span><span className="font-semibold">{BANK.holder}</span></div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount to Transfer</span>
                      <span className="font-heading font-bold text-primary text-lg">
                        {transaction.totalPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                      </span>
                    </div>
                  </div>

                  {/* File input */}
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />

                  {!paymentProof ? (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
                    >
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                        <FileImage className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="font-semibold text-sm mb-1">Click to upload</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG, or PDF (max 5MB)</p>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
                        {isPreviewing
                          ? <img src={isPreviewing} alt="Payment proof" className="w-full max-h-48 object-contain" />
                          : (
                            <div className="flex items-center gap-3 p-4">
                              <FileImage className="h-8 w-8 text-primary" />
                              <div>
                                <p className="text-sm font-semibold">{paymentProof.name}</p>
                                <p className="text-xs text-muted-foreground">{(paymentProof.size / 1024).toFixed(0)} KB</p>
                              </div>
                            </div>
                          )
                        }
                        <button onClick={() => { setPaymentProof(null); setIsPreviewing(null); }}
                          className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-[hsl(var(--status-confirmed))]/10 rounded-xl border border-[hsl(var(--status-confirmed))]/20">
                        <CheckCircle className="h-4 w-4 text-[hsl(var(--status-confirmed))] shrink-0" />
                        <span className="text-xs text-[hsl(var(--status-confirmed))] font-medium">File ready to upload</span>
                      </div>
                    </div>
                  )}

                  <Button variant="default" size="lg" className="w-full mt-5 rounded-2xl"
                    onClick={handleSubmitPaymentProof} disabled={!paymentProof || isUploading}
                  >
                    {isUploading
                      ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Uploading...</span>
                      : <span className="flex items-center gap-2"><Upload className="h-4 w-4" />Submit Payment Proof</span>
                    }
                  </Button>
                </div>
              )}

              {/* Proof already submitted */}
              {alreadyUploadedProof && (
                <div className="rounded-2xl border border-[hsl(var(--status-confirmed))]/30 bg-[hsl(var(--status-confirmed))]/5 p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-[hsl(var(--status-confirmed))]" />
                    <div>
                      <p className="font-semibold text-sm">Payment proof submitted</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Your booking is being verified. This usually takes 1-2 hours.</p>
                    </div>
                  </div>
                  {/* Show the uploaded image if available */}
                  {transaction.paymentProof && (
                    <img src={transaction.paymentProof} alt="Submitted proof" className="mt-4 w-full max-h-48 object-contain rounded-xl border border-border" />
                  )}
                </div>
              )}

            </div>

            <div className="space-y-5">

              {/* Payment info */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Payment
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-semibold">{transaction.paymentMethod?.replace("_", " ") ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-semibold">{transaction.paymentDate ? formatDate(transaction.paymentDate, "dd MMM yyyy") : "—"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-heading font-bold text-primary text-lg">
                      {formatCurrency(transaction.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2.5">
                <h3 className="font-heading font-bold text-base mb-3">Quick Actions</h3>

                <Button asChild variant="outline" size="sm" className="w-full rounded-xl gap-1.5 justify-start">
                  <Link href={`/property/${transaction.room.roomId}`}>
                    <Eye className="h-3.5 w-3.5" /> View Property
                  </Link>
                </Button>

                {transaction.status === TransactionStatus.CONFIRMED &&
                  new Date(transaction.checkOut) < new Date() && (
                    <Button asChild size="sm" className="w-full rounded-xl gap-1.5 justify-start bg-primary hover:bg-primary/90">
                      <Link href={`/bookings/${transactionId}/review`}>
                        <Star className="h-3.5 w-3.5" /> Leave Review
                      </Link>
                    </Button>
                  )
                }

                {canCancel && (
                  <Button variant="outline" size="sm" disabled={isCancelling}
                    onClick={() => cancelBooking(transactionId)}
                    className="w-full rounded-xl gap-1.5 justify-start text-[hsl(var(--status-cancelled))] hover:text-[hsl(var(--status-cancelled))] hover:bg-[hsl(var(--status-cancelled))]/5"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {isCancelling ? "Cancelling…" : "Cancel Booking"}
                  </Button>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Your booking is protected by Staynuit's Secure Booking Guarantee.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
  );
};

export default TransactionDetail;
