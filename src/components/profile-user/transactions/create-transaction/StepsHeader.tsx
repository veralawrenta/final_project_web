import { TransactionSteps } from "@/types/transaction";
import { Calendar, Check, CreditCard, Upload } from "lucide-react";

const steps = [
  { key: "details" as TransactionSteps, label: "Details", icon: Calendar },
  { key: "payment" as TransactionSteps, label: "Payment", icon: CreditCard },
  {
    key: "upload_proof" as TransactionSteps,
    label: "Upload Proof",
    icon: Upload,
  },
];

const StepsHeader = ({ step }: { step: TransactionSteps }) => {
  const currentIndex = steps.findIndex((x) => x.key === step);

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = step === s.key;
        const isComplete = currentIndex > i;
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
                className={`w-16 sm:w-20 h-0.5 mx-2 sm:mx-4 mb-6 rounded-full transition-colors ${isComplete ? "bg-primary" : "bg-border"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepsHeader;
