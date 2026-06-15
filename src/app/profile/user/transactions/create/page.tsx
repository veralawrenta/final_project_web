"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import z from "zod";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { cardDetailsSchema, PaymentMethodEnum } from "@/lib/validator/profile.transaction.schema";
import { TransactionPaymentMethod, TransactionSteps } from "@/types/transaction";
import { PropertyInfo } from "@/types/property";
import { differenceInCalendarDays } from "date-fns";
import StepsHeader from "@/components/profile-user/transactions/create-transaction/StepsHeader";
import CreateTransactionStep from "@/components/profile-user/transactions/create-transaction/CreateTransactionStep";
import PaymentMethodStep from "@/components/profile-user/transactions/create-transaction/PaymentMethodStep";
import ProcessingPayment from "@/components/profile-user/transactions/create-transaction/ProcessingPayment";
import UploadPaymentProof from "@/components/profile-user/transactions/upload-payment/UploadPaymentProof";
import TransactionConfirmation from "@/components/profile-user/transactions/create-transaction/TransactionConfirmation";
import PriceSummary from "@/components/profile-user/transactions/create-transaction/PriceSummary";

type CardFormValues = z.infer<typeof cardDetailsSchema>;

interface CreateTransactionPageProps {
  property: PropertyInfo;
}

const CreateTransactionPage = ({ property }: CreateTransactionPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<TransactionSteps>("details");

  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") ?? "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") ?? "");
  const [totalGuests, setTotalGuests] = useState(
    Number(searchParams.get("guests")) || 1,
  );
  const [bookedUnits, setBookedUnits] = useState(1);
  const [specialRequest, setSpecialRequest] = useState("");

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<TransactionPaymentMethod>(PaymentMethodEnum.BANK_TRANSFER);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmationNumber = useMemo(
    () => `STH-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    [],
  );

  const nights =
    checkIn && checkOut
      ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
      : 0;

  const total = (() => {
    const sub = nights * Math.max(bookedUnits, 1) * property.room.basePrice;
    return sub + Math.round(sub * 0.1) + Math.round(sub * 0.05);
  })();

  const {
    register: registerCard,
    handleSubmit: handleCardSubmit,
    formState: { errors: cardErrors },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardDetailsSchema),
  });

  const createTransaction = useCreateTransaction();

  const goBack = () => {
    if (step === "upload_proof") setStep("payment");
    else if (step === "payment") setStep("details");
    else router.back();
  };

  const handleDetailsContinue = () => {
    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }
    if (nights <= 0) {
      toast.error("Check-out must be after check-in");
      return;
    }
    setStep("payment");
  };

  const handleBankTransferOrShopeePay = async () => {
    setIsProcessing(true);
    try {
      const result = await createTransaction.mutateAsync({
        roomId: property.room.id,
        checkIn,
        checkOut,
        bookedUnits,
        totalGuests,
        paymentMethod: selectedPaymentMethod,
      });
      setTransactionId(result.transactionId);
      if (selectedPaymentMethod === "BANK_TRANSFER") {
        setStep("upload_proof");
      } else {
        setPaymentUrl(result.paymentUrl ?? null);
        setStep("processing_payment" as TransactionSteps);
      }
    } catch {
      // error toast handled in mutation's onError
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreditCardContinue = handleCardSubmit(async (cardValues) => {
    setIsProcessing(true);
    try {
      const result = await createTransaction.mutateAsync({
        roomId: property.room.id,
        checkIn,
        checkOut,
        bookedUnits,
        totalGuests,
        paymentMethod: PaymentMethodEnum.CREDIT_CARD,
        cardHolderFirstName: cardValues.cardHolderFirstName,
        cardHolderLastName: cardValues.cardHolderLastName,
        cardNumber: cardValues.cardNumber,
        expiredMonth: cardValues.expiredMonth,
        expiredYear: cardValues.expiredYear,
        cvv: cardValues.cvv,
        cardholderEmail: cardValues.cardholderEmail,
      });
      setTransactionId(result.transactionId);
      setPaymentUrl(result.paymentUrl ?? null);
      setStep("processing_payment" as TransactionSteps);
    } catch {
      // handled in mutation
    } finally {
      setIsProcessing(false);
    }
  });

  const handleContinue = () => {
    if (step === "details") return handleDetailsContinue();
    if (step === "payment") {
      if (selectedPaymentMethod === "CREDIT_CARD") return handleCreditCardContinue();
      return handleBankTransferOrShopeePay();
    }
  };

  const headerTitle = {
    details: "Complete Your Booking",
    payment: "Complete Your Booking",
    upload_proof: "Upload Payment Proof",
    processing_payment: "Processing Payment",
    confirmation: "🎉 Booking Confirmed",
  }[step];

  const showBack = step !== "confirmation" && step !== "processing_payment";
  const showSidebar = step === "details" || step === "payment";

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container flex items-center h-16 px-4">
          {showBack ? (
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>
          ) : (
            <div className="w-16" />
          )}
          <h1 className="font-bold text-lg flex-1 text-center">{headerTitle}</h1>
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

              {step === ("processing_payment" as TransactionSteps) && (
                <ProcessingPayment
                  selectedPaymentMethod={selectedPaymentMethod}
                  paymentUrl={paymentUrl}
                  onComplete={() => setStep("confirmation")}
                />
              )}

              {step === "upload_proof" && (
                <UploadPaymentProof
                  checkIn={checkIn}
                  checkOut={checkOut}
                  bookedUnits={bookedUnits}
                  basePrice={property.room.basePrice}
                  transactionId={transactionId}
                  onSubmitted={() => setStep("confirmation")}
                  onSkip={() => setStep("confirmation")}
                />
              )}

              {step === "confirmation" && (
                <TransactionConfirmation
                  property={property}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  totalGuests={totalGuests}
                  bookedUnits={bookedUnits}
                  selectedPaymentMethod={selectedPaymentMethod}
                  confirmationNumber={confirmationNumber}
                  basePrice={property.room.basePrice}
                />
              )}
            </div>

            {showSidebar && (
              <div className="lg:col-span-2">
                <PriceSummary
                  property={property}
                  nights={nights}
                  bookedUnits={bookedUnits}
                  step={step}
                  selectedPaymentMethod={selectedPaymentMethod}
                  isProcessing={isProcessing}
                  onContinue={handleContinue}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTransactionPage;