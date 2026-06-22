"use client";

import CreateTransactionStep from "@/components/profile-user/transactions/create-transaction/CreateTransactionStep";
import PaymentMethodStep from "@/components/profile-user/transactions/create-transaction/PaymentMethodStep";
import PriceSummary from "@/components/profile-user/transactions/create-transaction/PriceSummary";
import ProcessingPayment from "@/components/profile-user/transactions/create-transaction/ProcessingPayment";
import StepsHeader from "@/components/profile-user/transactions/create-transaction/StepsHeader";
import TransactionConfirmation from "@/components/profile-user/transactions/create-transaction/TransactionConfirmation";
import UploadPaymentProof from "@/components/profile-user/transactions/upload-payment/UploadPaymentProof";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { axiosInstance } from "@/lib/axios";
import {
  cardDetailsSchema,
  PaymentMethodEnum,
} from "@/lib/validator/profile.transaction.schema";
import { PropertyRoomDetail } from "@/types/property";
import {
  TransactionPaymentMethod,
  TransactionSteps,
} from "@/types/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInCalendarDays, format, parse } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type CardFormValues = z.infer<typeof cardDetailsSchema>;
declare const Xendit: any;

interface CreateTransactionComponentProps {
  property: PropertyRoomDetail;
}

function toInputFormat(ddMMYYYY: string): string {
  if (!ddMMYYYY) return "";
  try {
    return format(parse(ddMMYYYY, "dd-MM-yyyy", new Date()), "yyyy-MM-dd");
  } catch {
    return "";
  }
}

function toApiFormat(yyyyMMDD: string): string {
  if (!yyyyMMDD) return "";
  try {
    return format(new Date(yyyyMMDD), "dd-MM-yyyy");
  } catch {
    return "";
  }
}

const CreateTransactionComponent = ({
  property,
}: CreateTransactionComponentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = Number(searchParams.get("roomId"));
  const selectedRoom =
    property.rooms.find((r) => r.id === roomId) ?? property.rooms[0];

  const [step, setStep] = useState<TransactionSteps>("details");
  const [checkIn, setCheckIn] = useState(
    toInputFormat(searchParams.get("checkIn") ?? ""),
  );
  const [checkOut, setCheckOut] = useState(
    toInputFormat(searchParams.get("checkOut") ?? ""),
  );
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

  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user && (!session.user.firstName || !session.user.lastName)) {
      toast.error("Please complete your profile before creating booking");
      router.push("/profile/user/settings");
    }
  }, [session]);

  const nights =
    checkIn && checkOut
      ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
      : 0;
  const total = nights * Math.max(bookedUnits, 1) * (selectedRoom.basePrice ?? 0);
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
        roomId: selectedRoom.id,
        checkIn: toApiFormat(checkIn),
        checkOut: toApiFormat(checkOut),
        bookedUnits,
        totalGuests,
        paymentMethod: selectedPaymentMethod,
      });
      setTransactionId(result.id);
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
      Xendit.setPublishableKey(process.env.NEXT_PUBLIC_XENDIT_PUBLIC_KEY!);
      const tokenId = await new Promise<string>((resolve, reject) => {
        const tokenPayload = {
          amount: String(total),
            card_holder_first_name: cardValues.cardHolderFirstName,
            card_holder_last_name: cardValues.cardHolderLastName,
            card_number: cardValues.cardNumber.replace(/\s/g, ""),
            card_exp_month: cardValues.expiredMonth,
            card_exp_year:
              cardValues.expiredYear.length === 2
                ? `20${cardValues.expiredYear}`
                : cardValues.expiredYear,
            card_cvn: cardValues.cvv,
            card_holder_email: cardValues.cardholderEmail,
            is_multiple_use: false,
        };

          Xendit.card.createToken(tokenPayload, (err: any, token: any) => {
            if (err) return reject(err);

            if (token.status === "VERIFIED") {
              return resolve(token.id);
            }
            if (token.status === "IN_REVIEW") {
              // 3DS required — open the authentication URL in a popup
              const authWindow = window.open(
                token.payer_authentication_url,
                "xendit-3ds",
                "width=500,height=600",
              );
              const pollInterval = setInterval(async () => {
                try {
                  const { data } = await axiosInstance.get(
                    `/xendit/token-status/${token.id}`,
                  );

                  if (data.status === "VALID" || data.status === "VERIFIED") {
                    clearInterval(pollInterval);
                    clearInterval(closeCheckInterval);
                    authWindow?.close();
                    resolve(token.id);
                  } else if (
                    data.status === "FAILED" ||
                    (data.status === "IN_REVIEW" && data.failure_reason)
                  ) {
                    clearInterval(pollInterval);
                    clearInterval(closeCheckInterval);
                    authWindow?.close();
                    reject(new Error("3DS authentication failed"));
                  }
                } catch (err) {
                }
              }, 2000);

              const closeCheckInterval = setInterval(() => {
                if (authWindow?.closed) {
                  clearInterval(pollInterval);
                  clearInterval(closeCheckInterval);
                  reject(new Error("Authentication window was closed"));
                }
              }, 500);

              return;
            }

            reject(
              new Error(`Card verification failed - status: ${token.status}`),
            );
          },
        );
      });
      const result = await createTransaction.mutateAsync({
        roomId: selectedRoom.id,
        checkIn: toApiFormat(checkIn),
        checkOut: toApiFormat(checkOut),
        bookedUnits,
        totalGuests,
        paymentMethod: PaymentMethodEnum.CREDIT_CARD,
        tokenId,
      });
      setTransactionId(result.id);
      setPaymentUrl(result.paymentUrl ?? null);
      setStep("processing_payment" as TransactionSteps);
    } catch (err: any) {
      toast.error(err?.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  });

  const handleContinue = () => {
    if (step === "details") return handleDetailsContinue();
    if (step === "payment") {
      if (selectedPaymentMethod === "CREDIT_CARD")
        return handleCreditCardContinue();
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
          <h1 className="font-bold text-lg flex-1 text-center">
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
                  selectedRoom={selectedRoom}
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
                  transactionId={transactionId}
                  onComplete={() => setStep("confirmation")}
                />
              )}

              {step === "upload_proof" && (
                <UploadPaymentProof
                  checkIn={checkIn}
                  checkOut={checkOut}
                  bookedUnits={bookedUnits}
                  basePrice={selectedRoom.basePrice}
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
                  confirmationNumber={transactionId}
                  basePrice={selectedRoom.basePrice}
                />
              )}
            </div>

            {showSidebar && (
              <div className="lg:col-span-2">
                <PriceSummary
                  property={property}
                  selectedRoom={selectedRoom}
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

export default CreateTransactionComponent;
