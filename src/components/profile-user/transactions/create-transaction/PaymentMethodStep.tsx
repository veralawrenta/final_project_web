import { cardDetailsSchema, PaymentMethodEnum } from "@/lib/validator/profile.transaction.schema";
import { BANK, TransactionPaymentMethod } from "@/types/transaction";
import { formatDate } from "date-fns";
import { Building2, Clock, CreditCard, Lock, Shield, Wallet } from "lucide-react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import z from "zod";

type CardFormValues = z.infer<typeof cardDetailsSchema>;

interface PaymentMethodStepProps {
    selectedPaymentMethod: TransactionPaymentMethod;
    onSelectMethod: (m: TransactionPaymentMethod) => void;
    registerCard: UseFormRegister<CardFormValues>;
    cardErrors: FieldErrors<CardFormValues>;
    checkIn: string;
    checkOut: string;
    totalGuests: number;
    bookedUnits: number;
    nights: number;
    total: number;
};

const paymentMethods : {
    key: TransactionPaymentMethod;
    label: string;
    icon: React.ElementType;
    description: string;
}[] = [
    { key: PaymentMethodEnum.BANK_TRANSFER, label: "Bank Transfer", icon: Building2, description: "Manual transfer and upload proof of payment." },
    { key: PaymentMethodEnum.CREDIT_CARD, label: "Credit Card", icon: CreditCard, description: "Visa, MasterCard, and JCB." },
    { key: PaymentMethodEnum.SHOPEEPAY, label: "ShopeePay", icon: Wallet, description: "Use your ShopeePay balance for a quick checkout." },
];

const PaymentMethodStep = ({
  selectedPaymentMethod,
  onSelectMethod,
  registerCard,
  cardErrors,
  checkIn,
  checkOut,
  totalGuests,
  bookedUnits,
  nights,
  total
}: PaymentMethodStepProps) => (
<>
    <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
      <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" /> Payment Method
      </h3>

      {/* Method selector */}
      <div className="space-y-3 mb-6">
        {paymentMethods.map(({ key, label, icon: Icon, description }) => (
          <button key={key} onClick={() => onSelectMethod(key)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
              selectedPaymentMethod === key ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedPaymentMethod === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${selectedPaymentMethod === key ? "text-primary" : "text-foreground"}`}>{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPaymentMethod === key ? "border-primary" : "border-muted-foreground/30"}`}>
              {selectedPaymentMethod === key && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
          </button>
        ))}
      </div>

      {/* Credit Card Form */}
      {selectedPaymentMethod === "CREDIT_CARD" && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Card Number</label>
            <input {...registerCard("cardNumber")} type="text" placeholder="1234 5678 9012 3456"
              className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            {cardErrors.cardNumber && <p className="text-xs text-destructive mt-1">{cardErrors.cardNumber?.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">First Name</label>
              <input {...registerCard("cardHolderFirstName")} type="text" placeholder="John"
                className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {cardErrors.cardHolderFirstName && <p className="text-xs text-destructive mt-1">{cardErrors.cardHolderFirstName?.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Last Name</label>
              <input {...registerCard("cardHolderLastName")} type="text" placeholder="Doe"
                className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {cardErrors.cardHolderLastName && <p className="text-xs text-destructive mt-1">{cardErrors.cardHolderLastName?.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Month (MM)</label>
              <input {...registerCard("expiredMonth")} type="text" placeholder="01" maxLength={2}
                className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {cardErrors.expiredMonth && <p className="text-xs text-destructive mt-1">{cardErrors.expiredMonth?.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Year (YYYY)</label>
              <input {...registerCard("expiredYear")} type="text" placeholder="2028" maxLength={4}
                className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {cardErrors.expiredYear && <p className="text-xs text-destructive mt-1">{cardErrors.expiredYear?.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">CVV</label>
              <input {...registerCard("cvv")} type="text" placeholder="123" maxLength={4}
                className="w-full px-4 py-3.5 bg-secondary border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              {cardErrors.cvv && <p className="text-xs text-destructive mt-1">{cardErrors.cvv.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Email (optional)</label>
            <input {...registerCard("cardholderEmail")} type="email" placeholder="john@example.com"
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
            <p className="font-semibold text-sm">Pay with ShopeePay</p>
            <p className="text-xs text-muted-foreground mt-1">You'll be redirected to ShopeePay to complete payment securely</p>
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
              <Building2 className="h-3.5 w-3.5" /> Transfer Details
            </p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="font-semibold">{BANK.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Account Number</span><span className="font-mono font-semibold">{BANK.number}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Account Holder</span><span className="font-semibold">{BANK.holder}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount to Transfer</span>
                <span className="font-bold text-primary text-lg">{nights > 0 ? `Rp ${total.toLocaleString("id-ID")}` : "—"}</span>
              </div>
            </div>
          </div>
          <div className="p-3.5 bg-yellow-50 rounded-2xl border border-yellow-200">
            <p className="text-xs text-yellow-700 font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> After booking, upload your payment proof within 24 hours
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 mt-5 p-3.5 bg-muted/50 rounded-2xl border border-border">
        <Lock className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs text-muted-foreground">256-bit SSL encryption protects your payment info</span>
      </div>
    </div>

    {/* Trip Summary */}
    <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
      <h3 className="font-semibold mb-4">Trip Summary</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dates</span>
          <span className="font-medium">{formatDate(checkIn, "dd MM yyyy")} → {formatDate(checkOut, "dd MM yyyy")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Guests</span>
          <span className="font-medium">{totalGuests} guest{totalGuests > 1 ? "s" : ""}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Units</span>
          <span className="font-medium">{bookedUnits}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-medium">{nights} night{nights > 1 ? "s" : ""}</span>
        </div>
      </div>
    </div>
  </>
  )

export default PaymentMethodStep