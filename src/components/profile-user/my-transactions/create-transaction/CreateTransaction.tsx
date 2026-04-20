"use client";

import {
  useCreateTransaction,
  useUploadPaymentProof,
} from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/price/currency";
import {
  cardDetailsSchema,
  createTransactionSchema,
  PaymentMethodEnum,
  type CreateTransactionFormValues,
} from "@/lib/validator/profile.transaction.schema";
import {
  BANK,
  type TransactionPaymentMethod,
} from "@/types/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  FileImage,
  Lock,
  MapPin,
  Shield,
  Sparkles,
  Star,
  Upload,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step =
  | "details"
  | "payment"
  | "upload_proof"
  | "processing_payment"
  | "confirmation";

interface PropertyInfo {
  roomId: number;
  title: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
}

interface BookingPageProps {
  property: PropertyInfo;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const detailsSchema = createTransactionSchema.pick({
  checkIn: true,
  checkOut: true,
  totalGuests: true,
  bookedUnits: true,
});

const fullSchema = createTransactionSchema.and(cardDetailsSchema.partial());

function calcNights(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Component ────────────────────────────────────────────────────────────────

const CreateTransaction = ({ property }: BookingPageProps) => {
  const router = useRouter();

  // nuqs — step lives in the URL so back/forward works
  const [step, setStep] = useQueryState<Step>("step", {
    defaultValue: "details",
    parse: (v) =>
      [
        "details",
        "payment",
        "upload_proof",
        "processing_payment",
        "confirmation",
      ].includes(v)
        ? (v as Step)
        : "details",
    serialize: (v) => v,
  });

  // Form state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [totalGuests, setTotalGuests] = useState(1);
  const [bookedUnits, setBookedUnits] = useState(1);
  const [specialRequest, setSpecialRequest] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<TransactionPaymentMethod>("BANK_TRANSFER");

  // Card form
  const {
    register: registerCard,
    handleSubmit: handleCardSubmit,
    formState: { errors: cardErrors },
    getValues: getCardValues,
  } = useForm<z.infer<typeof cardDetailsSchema>>({
    resolver: zodResolver(cardDetailsSchema),
  });

  // Upload proof
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Transaction result
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState<string>("");

  // Mutations
  const { mutate: createTransaction, isPending: isCreating } =
    useCreateTransaction();
  const { mutate: uploadProof, isPending: isUploading } =
    useUploadPaymentProof();

  // ── Derived ──
  const nights = calcNights(checkIn, checkOut);
  const subtotal = property.price * bookedUnits * nights;
  const serviceFee = Math.round(subtotal * 0.1);
  const taxes = Math.round(subtotal * 0.11);
  const total = subtotal + serviceFee + taxes;

  // ── Handlers ──

  function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      toast.error("File too large. Max 1 MB.");
      return;
    }
    setProofFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setProofPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setProofPreview(null);
    }
  }

  async function handleContinue() {
    if (step === "details") {
      setStep("payment");
      return;
    }

    if (step === "payment") {
      const base = {
        roomId: property.roomId,
        checkIn,
        checkOut,
        totalGuests,
        bookedUnits,
        paymentMethod: selectedPaymentMethod,
      };

      // Build payload — card details only if credit card
      let payload: CreateTransactionFormValues = base as any;
      if (selectedPaymentMethod === PaymentMethodEnum.CREDIT_CARD) {
        const cardOk = await new Promise<boolean>((resolve) => {
          handleCardSubmit(
            (cardData) => {
              payload = { ...base, ...cardData } as any;
              resolve(true);
            },
            () => resolve(false),
          )();
        });
        if (!cardOk) {
          toast.error("Please fix card details.");
          return;
        }
      }

      createTransaction(payload as any, {
        onSuccess: (data) => {
          setTransactionId(data.transactionId);
          setConfirmationNumber(data.transactionId.slice(-8).toUpperCase());

          if (selectedPaymentMethod === PaymentMethodEnum.BANK_TRANSFER) {
            setStep("upload_proof");
          } else {
            // Xendit redirect flow
            if (data.paymentUrl) {
              setPaymentUrl(data.paymentUrl);
              setStep("processing_payment");
            } else {
              setStep("confirmation");
            }
          }
        },
      });
    }
  }

  async function handleSubmitProof() {
    if (!proofFile || !transactionId) return;
    uploadProof(
      { transactionId, paymentProof: proofFile },
      { onSuccess: () => setStep("confirmation") },
    );
  }

  // Auto-redirect to Xendit after 3s
  useEffect(() => {
    if (step !== "processing_payment" || !paymentUrl) return;
    const t = setTimeout(() => {
      window.location.href = paymentUrl;
    }, 3000);
    return () => clearTimeout(t);
  }, [step, paymentUrl]);

  // ── Step metadata ──
  const steps: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: "details", label: "Details", icon: Calendar },
    { key: "payment", label: "Payment", icon: CreditCard },
    { key: "upload_proof", label: "Proof", icon: Upload },
  ];

  const paymentMethods: {
    key: TransactionPaymentMethod;
    label: string;
    icon: React.ElementType;
    desc: string;
  }[] = [
    {
      key: "CREDIT_CARD",
      label: "Credit / Debit Card",
      icon: CreditCard,
      desc: "Visa, Mastercard, JCB",
    },
    {
      key: "SHOPEEPAY",
      label: "ShopeePay",
      icon: Wallet,
      desc: "Pay with your ShopeePay balance",
    },
    {
      key: "BANK_TRANSFER",
      label: "Bank Transfer",
      icon: Building2,
      desc: "Manual transfer + upload proof",
    },
  ];

  const isProcessing = isCreating;
  const isUploadingProof = isUploading;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container flex items-center h-16 px-4">
          {step !== "confirmation" && step !== "processing_payment" ? (
            <button
              onClick={() => {
                if (step === "upload_proof") setStep("payment");
                else if (step === "payment") setStep("details");
                else router.back();
              }}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>
          ) : (
            <div className="w-16" />
          )}
          <h1 className="font-semibold text-lg flex-1 text-center">
            {step === "confirmation"
              ? "🎉 Booking Confirmed"
              : step === "upload_proof"
                ? "Upload Payment Proof"
                : step === "processing_payment"
                  ? "Processing Payment"
                  : "Complete Your Booking"}
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="container py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps */}
          {step !== "confirmation" && step !== "processing_payment" && (
            <div className="flex items-center justify-center gap-0 mb-10">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const currentIdx = steps.findIndex((x) => x.key === step);
                const isActive = step === s.key;
                const isComplete = currentIdx > i;
                return (
                  <div key={s.key} className="flex items-center">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg scale-110"
                            : isComplete
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {isComplete ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`w-16 sm:w-20 h-0.5 mx-2 sm:mx-4 mb-6 rounded-full transition-colors ${
                          isComplete ? "bg-primary" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ── Left Column ── */}
            <div className="lg:col-span-3 space-y-6">
              {/* ─── STEP: details ─── */}
              {step === "details" && (
                <>
                  {/* Property Card */}
                  <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                    <div className="relative h-48">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h2 className="font-bold text-xl">{property.title}</h2>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-sm opacity-90">
                            <MapPin className="h-3.5 w-3.5" />{" "}
                            {property.location}
                          </span>
                          <span className="flex items-center gap-1 text-sm">
                            <Star className="h-3.5 w-3.5 fill-current text-yellow-400" />{" "}
                            {property.rating}
                            <span className="opacity-75">
                              ({property.reviews})
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" /> Your Trip
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Check-in
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="date"
                            value={checkIn}
                            min={
                              new Date(Date.now() + 86400000)
                                .toISOString()
                                .split("T")[0]
                            }
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="w-full pl-11 pr-3 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Check-out
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="date"
                            value={checkOut}
                            min={
                              checkIn ||
                              new Date(Date.now() + 86400000)
                                .toISOString()
                                .split("T")[0]
                            }
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full pl-11 pr-3 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Guests
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <select
                            value={totalGuests}
                            onChange={(e) =>
                              setTotalGuests(Number(e.target.value))
                            }
                            className="w-full pl-11 pr-8 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <option key={n} value={n}>
                                {n} guest{n > 1 ? "s" : ""}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Units
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <select
                            value={bookedUnits}
                            onChange={(e) =>
                              setBookedUnits(Number(e.target.value))
                            }
                            className="w-full pl-11 pr-8 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <option key={n} value={n}>
                                {n} unit{n > 1 ? "s" : ""}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {nights > 0 && (
                      <div className="mt-4 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-2 text-sm text-primary font-medium">
                          <Clock className="h-4 w-4" />
                          {nights} night{nights > 1 ? "s" : ""} ·{" "}
                          {formatDate(checkIn, "dd MM yyyy")} →{" "}
                          {formatDate(checkOut, "dd MM yyyy")}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Special Requests */}
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" /> Special
                      Requests
                    </h3>
                    <textarea
                      value={specialRequest}
                      onChange={(e) => setSpecialRequest(e.target.value)}
                      placeholder="Early check-in, extra pillows, airport transfer..."
                      rows={3}
                      className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none placeholder:text-muted-foreground/60"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Special requests are subject to availability
                    </p>
                  </div>
                </>
              )}

              {/* ─── STEP: payment ─── */}
              {step === "payment" && (
                <>
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" /> Payment
                      Method
                    </h3>

                    <div className="space-y-3 mb-6">
                      {paymentMethods.map(
                        ({ key, label, icon: Icon, desc }) => (
                          <button
                            key={key}
                            onClick={() => setSelectedPaymentMethod(key)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                              selectedPaymentMethod === key
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground/30"
                            }`}
                          >
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedPaymentMethod === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p
                                className={`font-semibold text-sm ${selectedPaymentMethod === key ? "text-primary" : "text-foreground"}`}
                              >
                                {label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {desc}
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPaymentMethod === key ? "border-primary" : "border-muted-foreground/30"}`}
                            >
                              {selectedPaymentMethod === key && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                          </button>
                        ),
                      )}
                    </div>

                    {/* Credit Card Form */}
                    {selectedPaymentMethod === "CREDIT_CARD" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Card Number
                          </label>
                          <input
                            {...registerCard("cardNumber")}
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          />
                          {cardErrors.cardNumber && (
                            <p className="text-xs text-destructive mt-1">
                              {cardErrors.cardNumber.message}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              First Name
                            </label>
                            <input
                              {...registerCard("cardHolderFirstName")}
                              type="text"
                              placeholder="John"
                              className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            {cardErrors.cardHolderFirstName && (
                              <p className="text-xs text-destructive mt-1">
                                {cardErrors.cardHolderFirstName.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Last Name
                            </label>
                            <input
                              {...registerCard("cardHolderLastName")}
                              type="text"
                              placeholder="Doe"
                              className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            {cardErrors.cardHolderLastName && (
                              <p className="text-xs text-destructive mt-1">
                                {cardErrors.cardHolderLastName.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Month (MM)
                            </label>
                            <input
                              {...registerCard("expiredMonth")}
                              type="text"
                              placeholder="01"
                              maxLength={2}
                              className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            {cardErrors.expiredMonth && (
                              <p className="text-xs text-destructive mt-1">
                                {cardErrors.expiredMonth.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Year (YYYY)
                            </label>
                            <input
                              {...registerCard("expiredYear")}
                              type="text"
                              placeholder="2028"
                              maxLength={4}
                              className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            {cardErrors.expiredYear && (
                              <p className="text-xs text-destructive mt-1">
                                {cardErrors.expiredYear.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              CVV
                            </label>
                            <input
                              {...registerCard("cvv")}
                              type="text"
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            {cardErrors.cvv && (
                              <p className="text-xs text-destructive mt-1">
                                {cardErrors.cvv.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Email (optional)
                          </label>
                          <input
                            {...registerCard("cardholderEmail")}
                            type="email"
                            placeholder="john@example.com"
                            className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {/* ShopeePay */}
                    {selectedPaymentMethod === "SHOPEEPAY" && (
                      <div className="text-center py-8 space-y-4">
                        <div className="w-20 h-20 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center">
                          <Wallet className="h-10 w-10 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">
                            Pay with ShopeePay
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You'll be redirected to ShopeePay to complete
                            payment securely
                          </p>
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-xs text-muted-foreground">
                          <Shield className="h-3.5 w-3.5" /> Secured by Shopee
                        </div>
                      </div>
                    )}

                    {/* Bank Transfer */}
                    {selectedPaymentMethod === "BANK_TRANSFER" && (
                      <div className="space-y-4">
                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                          <p className="text-xs font-semibold text-primary mb-3 flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" /> Transfer
                            Details
                          </p>
                          <div className="space-y-2.5 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Bank
                              </span>
                              <span className="font-semibold">{BANK.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Account Number
                              </span>
                              <span className="font-mono font-semibold">
                                {BANK.number}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Account Holder
                              </span>
                              <span className="font-semibold">
                                {BANK.holder}
                              </span>
                            </div>
                            <hr className="border-border" />
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Amount to Transfer
                              </span>
                              <span className="font-bold text-primary text-lg">
                                {nights > 0
                                  ? `Rp ${total.toLocaleString("id-ID")}`
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3.5 bg-yellow-50 rounded-2xl border border-yellow-200">
                          <p className="text-xs text-yellow-700 font-medium flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            After booking, upload your payment proof within 24
                            hours
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 mt-5 p-3.5 bg-muted/50 rounded-2xl border border-border">
                      <Lock className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        256-bit SSL encryption protects your payment info
                      </span>
                    </div>
                  </div>

                  {/* Trip Summary on payment step */}
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <h3 className="font-semibold mb-4">Trip Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dates</span>
                        <span className="font-medium">
                          {formatDate(checkIn, "dd MM yyyy")} →{" "}
                          {formatDate(checkOut, "dd MM yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Guests</span>
                        <span className="font-medium">
                          {totalGuests} guest{totalGuests > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Units</span>
                        <span className="font-medium">{bookedUnits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">
                          {nights} night{nights > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ─── STEP: processing_payment (Xendit redirect) ─── */}
              {step === "processing_payment" && (
                <div className="bg-card rounded-3xl border border-border p-10 shadow-sm text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <Shield className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-2">
                      Redirecting to Xendit
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      You're being securely redirected to Xendit to complete
                      your{" "}
                      {selectedPaymentMethod === "CREDIT_CARD"
                        ? "card"
                        : "ShopeePay"}{" "}
                      payment…
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" /> Secured by Xendit Payment
                    Gateway
                  </div>
                </div>
              )}

              {/* ─── STEP: upload_proof ─── */}
              {step === "upload_proof" && (
                <>
                  <div className="bg-linear-to-br from-green-50 via-card to-primary/5 rounded-3xl border border-green-200 p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
                        <CheckCircle className="h-7 w-7 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          Booking created! 🎉
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          One step closer — secure it by uploading your payment
                          proof.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank info reminder */}
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Transfer Details</h3>
                        <p className="text-xs text-muted-foreground">
                          Transfer to the account below, then upload your proof
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bank</span>
                        <span className="font-semibold">{BANK.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Account Number
                        </span>
                        <span className="font-mono font-semibold">
                          {BANK.number}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Account Holder
                        </span>
                        <span className="font-semibold">{BANK.holder}</span>
                      </div>
                      <hr className="border-border" />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-bold text-primary text-lg">
                          Rp {total.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Upload */}
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-primary" /> Upload Payment
                      Proof
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      Upload a screenshot or photo of your bank transfer receipt
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleProofUpload}
                      className="hidden"
                    />

                    {!proofFile ? (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
                      >
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                          <FileImage className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="font-semibold text-sm mb-1">
                          Click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, or PDF (max 1 MB)
                        </p>
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary">
                          {proofPreview ? (
                            <img
                              src={proofPreview}
                              alt="Payment proof"
                              className="w-full max-h-64 object-contain"
                            />
                          ) : (
                            <div className="flex items-center gap-3 p-4">
                              <FileImage className="h-8 w-8 text-primary" />
                              <div>
                                <p className="text-sm font-semibold">
                                  {proofFile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(proofFile.size / 1024).toFixed(0)} KB
                                </p>
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setProofFile(null);
                              setProofPreview(null);
                            }}
                            className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-2xl border border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                          <span className="text-xs text-green-700 font-medium">
                            File ready to upload
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSubmitProof}
                      disabled={!proofFile || isUploadingProof}
                      className="w-full mt-6 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      {isUploadingProof ? (
                        <>
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" /> Submit Payment Proof
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setStep("confirmation");
                        toast.info(
                          "You can upload your payment proof later from My Bookings.",
                        );
                      }}
                      className="w-full mt-3 text-sm text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                    >
                      Skip for now — upload later from My Bookings
                    </button>
                  </div>
                </>
              )}

              {/* ─── STEP: confirmation ─── */}
              {step === "confirmation" && (
                <div className="space-y-6">
                  <div className="bg-linear-to-br from-primary/5 via-card to-primary/5 rounded-3xl border border-primary/20 p-8 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Check className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">You're all set!</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your reservation at <strong>{property.title}</strong> has
                      been{" "}
                      {selectedPaymentMethod === "BANK_TRANSFER"
                        ? "submitted for verification"
                        : "confirmed"}
                      .
                    </p>
                    {selectedPaymentMethod === "BANK_TRANSFER" && (
                      <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-xs font-medium">
                        <Clock className="h-3 w-3" /> Pending verification (1–2
                        hours)
                      </span>
                    )}
                  </div>

                  <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                    <div className="p-6 bg-muted/30 border-b border-border flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Booking ID
                      </span>
                      <span className="font-mono text-sm font-semibold px-3 py-1 border border-border rounded-lg bg-background">
                        {confirmationNumber ||
                          transactionId?.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex gap-4">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0"
                        />
                        <div>
                          <h3 className="font-bold">{property.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5" />{" "}
                            {property.location}
                          </p>
                        </div>
                      </div>
                      <hr className="border-border" />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">
                            Check-in
                          </p>
                          <p className="font-semibold">
                            {formatDate(checkIn, "dd MMM yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">
                            Check-out
                          </p>
                          <p className="font-semibold">
                            {formatDate(checkOut, "dd MMM yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">
                            Guests
                          </p>
                          <p className="font-semibold">{totalGuests}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">
                            Payment
                          </p>
                          <p className="font-semibold">
                            {
                              paymentMethods.find(
                                (m) => m.key === selectedPaymentMethod,
                              )?.label
                            }
                          </p>
                        </div>
                      </div>
                      <hr className="border-border" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-2xl text-primary">
                          Rp {total.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href="/" className="flex-1">
                      <button className="w-full py-3.5 border border-border rounded-2xl text-sm font-semibold hover:bg-secondary transition-colors">
                        Back to Home
                      </button>
                    </Link>
                    <Link href="/profile/user/transactions" className="flex-1">
                      <button className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                        View My Bookings
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Price Summary (sticky) ── */}
            {(step === "details" || step === "payment") && (
              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-6">
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {property.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />{" "}
                          {property.rating} ({property.reviews})
                        </div>
                      </div>
                    </div>

                    <hr className="border-border mb-5" />

                    <h4 className="font-bold mb-4">Price Breakdown</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {formatCurrency(property.price)} × {bookedUnits} unit
                          {bookedUnits > 1 ? "s" : ""} × {nights || "—"} nights
                        </span>
                        <span className="font-medium">
                          {nights > 0 ? `${formatCurrency(subtotal)}` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Service fee (10%)
                        </span>
                        <span className="font-medium">
                          {nights > 0 ? `${formatCurrency(serviceFee)}` : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Taxes (11%)
                        </span>
                        <span className="font-medium">
                          {nights > 0 ? `${formatCurrency(taxes)}` : "—"}
                        </span>
                      </div>
                      <hr className="border-border" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">
                          {nights > 0
                            ? `Rp ${total.toLocaleString("id-ID")}`
                            : "—"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleContinue}
                      disabled={isProcessing || nights === 0}
                      className="w-full mt-6 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Processing…
                        </>
                      ) : step === "details" ? (
                        "Continue to Payment"
                      ) : selectedPaymentMethod === "BANK_TRANSFER" ? (
                        "Create Booking"
                      ) : (
                        `Pay Rp ${total.toLocaleString("id-ID")}`
                      )}
                    </button>
                  </div>

                  {/* Trust Badges */}
                  <div className="bg-card rounded-3xl border border-border p-5 shadow-sm">
                    <div className="space-y-3">
                      {[
                        {
                          icon: Shield,
                          text: "Secure checkout with SSL encryption",
                        },
                        {
                          icon: Check,
                          text: "Free cancellation up to 24h before",
                        },
                        { icon: Clock, text: "Instant booking confirmation" },
                      ].map(({ icon: Icon, text }, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTransaction;
