"use client";
import {
  useCreateTransaction,
  useUploadPaymentProof,
} from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/price/currency";
import {
  cardDetailsSchema,
  PaymentMethodEnum,
  type CreateTransactionFormValues,
} from "@/lib/validator/profile.transaction.schema";
import { PropertyInfo } from "@/types/property";
import {
  Transaction_Steps,
  type TransactionPaymentMethod,
} from "@/types/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "date-fns";
import {
  ArrowLeft,
  Check,
  Clock,
  Lock,
  MapPin,
  Shield,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  parseAsInteger,
  parseAsStringEnum,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import StepsHeader from "./StepsHeader";
import PaymentMethodStep from "./PaymentMethodStep";
import UploadPaymentProof from "../upload-payment/UploadPaymentProof";
import CreateTransactionStep from "./CreateTransactionStep";
interface BookingPageProps {
  property: PropertyInfo;
}

function calcNights(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(
    0,
    Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000,
    ),
  );
}

const CreateTransaction = ({ property }: BookingPageProps) => {
  const router = useRouter();
  const [step, setStep] = useQueryState(
    "step",
    parseAsStringLiteral(Transaction_Steps).withDefault("details"),
  );
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [totalGuests, setTotalGuests] = useQueryState(
    "guests",
    parseAsInteger.withDefault(1),
  );
  const [bookedUnits, setBookedUnits] = useQueryState(
    "units",
    parseAsInteger.withDefault(1),
  );
  const [specialRequest, setSpecialRequest] = useQueryState("request", {
    defaultValue: "",
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useQueryState(
    "payment",
    parseAsStringEnum<TransactionPaymentMethod>(
      Object.values(PaymentMethodEnum),
    ).withDefault("BANK_TRANSFER"),
  );
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState("");

  const {
    register: registerCard,
    handleSubmit: handleCardSubmit,
    formState: { errors: cardErrors },
  } = useForm<z.infer<typeof cardDetailsSchema>>({
    resolver: zodResolver(cardDetailsSchema),
  });

  const { mutate: createTransaction, isPending: isCreating } =
    useCreateTransaction();
  const { mutate: uploadProof, isPending: isUploading } =
    useUploadPaymentProof();

  const nights = calcNights(checkIn, checkOut);
  const subtotal = property.basePrice * bookedUnits * nights;
  const taxes = Math.round(subtotal * 0.11);
  const total = subtotal + taxes;

  const paymentMethods = [
    {
      key: "CREDIT_CARD" as TransactionPaymentMethod,
      label: "Credit / Debit Card",
    },
    { key: "SHOPEEPAY" as TransactionPaymentMethod, label: "ShopeePay" },
    {
      key: "BANK_TRANSFER" as TransactionPaymentMethod,
      label: "Bank Transfer",
    },
  ];

  async function handleContinue() {
    if (step === "details") {
      setStep("payment");
      return;
    }
    if (step === "payment") {
      const base = {
        roomId: property.roomName,
        checkIn,
        checkOut,
        totalGuests,
        bookedUnits,
        paymentMethod: selectedPaymentMethod,
      };
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
            data.paymentUrl
              ? (setPaymentUrl(data.paymentUrl), setStep("processing_payment"))
              : setStep("confirmation");
          }
        },
      });
    }
  }

  useEffect(() => {
    if (step !== "processing_payment" || !paymentUrl) return;
    const t = setTimeout(() => {
      window.location.href = paymentUrl;
    }, 3000);
    return () => clearTimeout(t);
  }, [step, paymentUrl]);

  const headerTitle =
    {
      details: "Complete Your Booking",
      payment: "Complete Your Booking",
      confirmation: "🎉 Booking Confirmed",
      upload_proof: "Upload Payment Proof",
      processing_payment: "Processing Payment",
    }[step];

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
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />{" "}
              Back
            </button>
          ) : (
            <div className="w-16" />
          )}
          <h1 className="font-semibold text-lg flex-1 text-center">
            {headerTitle}
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="container py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {step !== "confirmation" && step !== "processing_payment" && (
            <StepsHeader step={step} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {step === "details" && (
                <CreateTransactionStep
                  property={property}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  totalGuests={totalGuests}
                  bookedUnits={bookedUnits}
                  specialRequest={specialRequest}
                  nights={nights}
                  onCheckInChange={setCheckIn}
                  onCheckOutChange={setCheckOut}
                  onTotalGuestsChange={setTotalGuests}
                  onBookedUnitsChange={setBookedUnits}
                  onSpecialRequestChange={setSpecialRequest}
                />
              )}

              {step === "payment" && (
                <PaymentMethodStep
                  selectedPaymentMethod={selectedPaymentMethod}
                  onSelectMethod={setSelectedPaymentMethod}
                  registerCard={registerCard}
                  cardErrors={cardErrors}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  totalGuests={totalGuests}
                  bookedUnits={bookedUnits}
                  nights={nights}
                  total={total}
                />
              )}

              {/* ✅ Reusing your existing component */}
              {step === "upload_proof" && transactionId && (
                <UploadPaymentProof
                  checkIn={checkIn}
                  checkOut={checkOut}
                  bookedUnits={bookedUnits}
                  basePrice={property.basePrice}
                  onSubmitted={() => setStep("confirmation")}
                  onSkip={() => {
                    setStep("confirmation");
                    toast.info(
                      "You can upload your payment proof later from My Bookings.",
                    );
                  }}
                />
              )}

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

              {step === "confirmation" && (
                <div className="space-y-6">
                  <div className="bg-linear-to-br from-primary/5 via-card to-primary/5 rounded-3xl border border-primary/20 p-8 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                      <Check className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">You're all set!</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your reservation at <strong>{property.name}</strong> has
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
                          src={property.propertyImage}
                          alt={property.name}
                          className="w-20 h-20 rounded-2xl object-cover shrink-0"
                        />
                        <div>
                          <h3 className="font-bold">{property.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3.5 w-3.5" />{" "}
                            {property.address}
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

            {/* Right Column: Price Summary */}
            {(step === "details" || step === "payment") && (
              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-6">
                  <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <img
                        src={property.propertyImage}
                        alt={property.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {property.name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-current text-yellow-400" />{" "}
                          {property.ratings} ({property.reviews})
                        </div>
                      </div>
                    </div>
                    <hr className="border-border mb-5" />
                    <h4 className="font-bold mb-4">Price Breakdown</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {formatCurrency(property.basePrice)} × {bookedUnits}{" "}
                          unit
                          {bookedUnits > 1 ? "s" : ""} × {nights || "—"} nights
                        </span>
                        <span className="font-medium">
                          {nights > 0 ? formatCurrency(subtotal) : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Taxes (11%)
                        </span>
                        <span className="font-medium">
                          {nights > 0 ? formatCurrency(taxes) : "—"}
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
                      disabled={isCreating || nights === 0}
                      className="w-full mt-6 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{" "}
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
