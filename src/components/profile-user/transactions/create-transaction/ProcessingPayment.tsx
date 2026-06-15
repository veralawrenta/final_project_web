import { Lock, Shield } from "lucide-react";
import { useEffect } from "react";
import { TransactionPaymentMethod } from "@/types/transaction";

interface ProcessingPaymentProps {
  selectedPaymentMethod: TransactionPaymentMethod;
  paymentUrl: string | null;
  onComplete: () => void;
}

const ProcessingPayment = ({
  selectedPaymentMethod,
  paymentUrl,
  onComplete,
}: ProcessingPaymentProps) => {
  useEffect(() => {
    if (!paymentUrl) {
      // No redirect URL — auto-advance after 3s as fallback
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
    // Real Xendit URL — redirect immediately
    window.location.href = paymentUrl;
  }, [paymentUrl, onComplete]);

  const methodLabel =
    selectedPaymentMethod === "CREDIT_CARD" ? "card" : "ShopeePay";

  return (
    <div className="bg-card rounded-3xl border border-border p-10 shadow-sm text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
        <Shield className="h-10 w-10 text-primary" />
      </div>

      <div>
        <h3 className="font-bold text-xl mb-2">Redirecting to Xendit</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          You're being securely redirected to complete your {methodLabel}{" "}
          payment...
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> Secured by Xendit Payment Gateway
      </div>
    </div>
  );
};

export default ProcessingPayment;