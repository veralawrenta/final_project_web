"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useCancelTransactionByUser,
  useGetTransactionIdByUser,
  useUploadPaymentProof,
} from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/price/currency";
import {
  BANK,
  TransactionStatus,
  transactionStatusConfig,
} from "@/types/transaction";
import { differenceInCalendarDays, format, startOfDay } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle,
  Copy,
  CreditCard,
  Eye,
  FileImage,
  Loader2,
  MapPin,
  Shield,
  Star,
  Upload,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { GrStatusInfo } from "react-icons/gr";
import { toast } from "sonner";

const TransactionDetail = () => {
  const params = useParams();
  const transactionId = params.id as string;
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
    ? (transactionStatusConfig[transaction.displayStatus] ?? {
        label: transaction.status,
        className: "bg-muted text-muted-foreground border-border",
        icon: Check,
      })
    : null;

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

  const InteractiveMap = dynamic(
    () =>
      import("@/components/dashboard-tenant/property/property-forms/maps/InteractiveMaps").then(
        (mod) => mod.InteractiveMap,
      ),
    { ssr: false },
  );

  const fileTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB. Please choose a smaller file.");
      return;
    }

    if (!fileTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload a JPEG, PNG, or GIF image.",
      );
      return;
    }

    setPaymentProof(file);
    const reader = new FileReader();
    reader.onloadend = () => setIsPreviewing(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitPaymentProof = () => {
    if (!paymentProof) {
      toast.error("Please select a payment proof to upload.");
      return;
    }
    uploadPaymentProof(
      { paymentProof, transactionId },
      {
        onSuccess: () => {
          setPaymentProof(null);
          setIsPreviewing(null);
          toast.success("Payment proof uploaded successfully");
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
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="h-5 w-28 bg-muted animate-pulse rounded-md" />
          <div className="h-24 bg-muted animate-pulse rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-72 bg-muted animate-pulse rounded-2xl" />
              <div className="h-36 bg-muted animate-pulse rounded-2xl" />
            </div>
            <div className="h-56 bg-muted animate-pulse rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !transaction) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto">
            <CalendarDays className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-heading font-bold tracking-tight">
            Booking Not Found
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The booking parameters are invalid, or this transaction ID does not
            exist.
          </p>
          <Button
            asChild
            variant="outline"
            className="rounded-xl w-full text-xs font-semibold"
          >
            <Link href="/profile/user/transactions">Back to My Bookings</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-6 pb-16 md:px-8 bg-slate-50/30">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation Breadcrumb */}
        <button
          onClick={() => router.push("/profile/user/transactions")}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to My Bookings
        </button>

        {/* Heading Header Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-heading font-bold tracking-tight sm:text-2xl md:text-3xl">
                Booking Details
              </h1>
              <Badge
                className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold gap-1.5 shadow-none tracking-wide ${statusConfig!.className}`}
              >
                <GrStatusInfo className="h-3 w-3" />
                {statusConfig!.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">Booking ID:</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 font-mono font-bold text-primary hover:opacity-80 transition-opacity bg-muted/60 px-2 py-0.5 rounded"
              >
                {transactionId.toUpperCase()}
                {copying ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
          <div className="rounded-xl bg-white border border-border px-5 py-3 sm:text-right shrink-0 self-start sm:self-auto min-w-[160px] shadow-xs">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Total Amount
            </p>
            <p className="mt-0.5 text-xl sm:text-2xl font-heading font-bold text-slate-900">
              {formatCurrency(transaction.totalPrice)}
            </p>
          </div>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Column Left: Core Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Display Meta Card */}
            {/* Property Display Meta Card */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-xs">
              <div className="relative h-44 sm:h-56 bg-muted">
                {transaction.room.property.propertyImages?.[0]?.urlImages ? (
                  <img
                    src={transaction.room.property.propertyImages[0].urlImages}
                    alt={transaction.room.property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <h2 className="font-heading font-bold text-base sm:text-xl line-clamp-1 tracking-tight">
                    {transaction.room.property.name}
                  </h2>
                  <p className="flex items-center gap-1.5 text-xs opacity-90 truncate font-medium">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-white/80" />
                    {transaction.room.property.city.name},{" "}
                    {transaction.room.property.address}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 bg-white space-y-4">
                {/* Core Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                      Room Type
                    </p>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {transaction.room.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                      Guests
                    </p>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        {transaction.totalGuests} guest
                        {transaction.totalGuests !== 1 ? "s" : ""}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                      Duration
                    </p>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800">
                      {nights} night{nights !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                      Booked on
                    </p>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-slate-800">
                      {transaction.createdAt
                        ? format(new Date(transaction.createdAt), "dd-MM-yyyy")
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Enhanced Tenant Meta Box */}
                <div className="container mx-auto mt-4 py-3 border-t-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
                        Property Host
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                        {transaction.room.property.tenant.tenantName}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold bg-green-600 px-2 py-0.5 border-slate-200 text-muted tracking-wide shrink-0 self-start sm:self-auto shadow-xs"
                  >
                    Verified Host
                  </Badge>
                </div>
              </div>
            </div>

            {/* Trip Schedule Dates Layout */}
            <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-xs">
              <h3 className="font-heading font-bold text-sm sm:text-base mb-4 flex items-center gap-2 text-slate-900">
                <CalendarDays className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />{" "}
                Trip Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="rounded-xl bg-slate-50 border border-border/50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                    Check-in
                  </p>
                  <p className="mt-0.5 text-sm sm:text-base font-bold text-slate-900">
                    {format(new Date(transaction.checkIn), "dd-MM-yyyy")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    From 2:00 PM
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-border/50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                    Check-out
                  </p>
                  <p className="mt-0.5 text-sm sm:text-base font-bold text-slate-900">
                    {format(new Date(transaction.checkOut), "dd-MM-yyyy")}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                    Before 12:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Property Location Map Module */}
            {transaction.room.property.latitude &&
              transaction.room.property.longitude && (
                <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
                  <h3 className="font-heading font-bold text-sm sm:text-base flex items-center gap-2 text-slate-900">
                    <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />{" "}
                    Property Location
                  </h3>
                  <div className="relative rounded-xl overflow-hidden border border-border/70 z-0 shadow-inner">
                    <InteractiveMap
                      latitude={parseFloat(transaction.room.property.latitude)}
                      longitude={parseFloat(
                        transaction.room.property.longitude,
                      )}
                      onLocationChange={() => {}}
                      height="240px"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-border/40 text-xs text-muted-foreground font-medium">
                    <MapPin className="h-4 w-4 shrink-0 text-primary/70 mt-0.5" />
                    <span>
                      {transaction.room.property.address},{" "}
                      {transaction.room.property.city.name}
                    </span>
                  </div>
                </div>
              )}
          </div>

          {/* Column Right: Billing & Actions Side Control */}
          <div className="space-y-5">
            {/* Upload Wire / Verification Interface Area - Positioned contextually over billing on desktop layout steps */}
            {needUploadPaymentProof && (
              <div className="rounded-2xl border border-[hsl(var(--status-pending))]/30 bg-white p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--status-pending))]/10 flex items-center justify-center shrink-0">
                    <Upload className="h-4 w-4 text-[hsl(var(--status-pending))]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-slate-950">
                      Upload Payment
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Transfer exact funds to proceed.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-border/70 space-y-2.5 text-xs shadow-none">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">
                      Bank
                    </span>
                    <span className="font-bold text-slate-800">
                      {BANK.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">
                      Account No.
                    </span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 border border-border rounded">
                      {BANK.number}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">
                      Holder
                    </span>
                    <span className="font-semibold text-slate-800">
                      {BANK.holder}
                    </span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-muted-foreground font-semibold">
                      Amount Due
                    </span>
                    <span className="font-heading font-bold text-primary text-base">
                      {formatCurrency(transaction.totalPrice)}
                    </span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!paymentProof ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-dashed border-border hover:border-primary/40 hover:bg-slate-50 rounded-xl p-5 text-center transition-all group cursor-pointer"
                  >
                    <FileImage className="h-5 w-5 mx-auto text-muted-foreground/80 group-hover:text-primary transition-colors mb-2" />
                    <p className="font-bold text-xs mb-0.5 text-slate-700">
                      Attach Receipt Image
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      JPG, PNG, GIF up to 5MB
                    </p>
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <div className="relative rounded-xl overflow-hidden border border-border bg-slate-50 p-1.5">
                      {isPreviewing ? (
                        <img
                          src={isPreviewing}
                          alt="Preview receipt snapshot"
                          className="w-full max-h-40 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center gap-2.5 p-2 bg-white rounded-lg border">
                          <FileImage className="h-6 w-6 text-primary shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate text-slate-800">
                              {paymentProof.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {(paymentProof.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setPaymentProof(null);
                          setIsPreviewing(null);
                        }}
                        className="absolute top-2.5 right-2.5 w-6 h-6 bg-slate-900/90 shadow text-white rounded-md flex items-center justify-center hover:bg-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-[11px] text-emerald-800 font-medium">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>File attached and ready</span>
                    </div>
                  </div>
                )}

                <Button
                  variant="default"
                  size="sm"
                  className="w-full rounded-xl text-xs font-semibold h-9 shadow-sm"
                  onClick={handleSubmitPaymentProof}
                  disabled={!paymentProof || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Submit Verification
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Proof Snapshot Existing State Block */}
            {alreadyUploadedProof && (
              <div className="rounded-2xl border border-[hsl(var(--status-confirmed))]/20 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-[hsl(var(--status-confirmed))] mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-slate-900">
                      Payment Proof Submitted
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Verification parameters are processing and typically take
                      1-2 hours.
                    </p>
                  </div>
                </div>
                {transaction.paymentProof && (
                  <div className="rounded-xl overflow-hidden border border-border/80 p-1 bg-slate-50">
                    <img
                      src={transaction.paymentProof}
                      alt="Submitted confirmation receipt"
                      className="w-full max-h-40 object-contain rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Financial Invoice Breakdown Component */}
            <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-xs">
              <h3 className="font-heading font-bold text-sm mb-4 flex items-center gap-2 text-slate-900">
                <CreditCard className="h-4 w-4 text-primary" /> Payment Summary
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">
                    Method
                  </span>
                  <span className="font-bold text-slate-800 capitalize">
                    {transaction.paymentMethod
                      ?.replace("_", " ")
                      .toLowerCase() ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">
                    Payment Date
                  </span>
                  <span className="font-bold text-slate-800">
                    {transaction.paymentDate
                      ? format(new Date(transaction.paymentDate), "dd-MM-yyyy")
                      : "—"}
                  </span>
                </div>
                <Separator className="bg-border/60" />
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-muted-foreground font-semibold">
                    Total Price
                  </span>
                  <span className="font-heading font-bold text-primary text-base">
                    {formatCurrency(transaction.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* User Quick Actions Panel */}
            <div className="rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-xs space-y-2">
              <h3 className="font-heading font-bold text-[10px] uppercase tracking-wider text-muted-foreground/90 mb-1">
                Quick Actions
              </h3>

              <Button
                asChild
                variant="default"
                size="sm"
                className="w-full rounded-xl gap-2 justify-start h-9 text-xs font-semibold"
              >
                <Link href={`/properties/${transaction.room.property.id}`}>
                  <Eye className="h-3.5 w-3.5" /> View Property Listing
                </Link>
              </Button>
              <div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl gap-2 justify-start h-9 text-xs font-semibold"
                >
                  <Link href={`/customer-service-form`}>
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                    Contact Customer Service
                  </Link>
                </Button>
              </div>

              {transaction.status === TransactionStatus.CONFIRMED &&
                new Date(transaction.checkOut) < new Date() && (
                  <Button
                    asChild
                    size="sm"
                    className="w-full rounded-xl gap-2 justify-start h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-white"
                  >
                    <Link
                      href={`/profile/user/transaction/${transactionId}/create-review`}
                    >
                      <Star className="h-3.5 w-3.5" /> Leave Property Review
                    </Link>
                  </Button>
                )}

              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isCancelling}
                  onClick={() => cancelBooking(transactionId)}
                  className="w-full rounded-xl gap-2 justify-start h-9 text-xs font-semibold text-[hsl(var(--status-cancelled))] border-[hsl(var(--status-cancelled))]/20 hover:text-[hsl(var(--status-cancelled))] hover:bg-[hsl(var(--status-cancelled))]/5 bg-white"
                >
                  {isCancelling ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {isCancelling ? "Cancelling..." : "Cancel Booking"}
                </Button>
              )}
            </div>

            {/* Secure Guarantee Tag Footer line */}
            <div className="rounded-2xl border border-border/60 bg-slate-50 p-4">
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                  Your transaction parameters are safe. Secure processing is
                  encrypted under Staynuit's End-to-End Protection Guarantee.
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
