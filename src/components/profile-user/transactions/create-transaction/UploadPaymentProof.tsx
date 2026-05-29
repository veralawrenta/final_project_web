"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/price/currency";
import { BANK } from "@/types/transaction";
import { differenceInCalendarDays } from "date-fns";
import { Building2, CheckCircle, FileImage, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface UploadPaymentProofProps {
  checkIn: string;
  checkOut: string;
  bookedUnits: number;
  basePrice: number;
  transactionId?: string;
  onSubmitted: () => void;
  onSkip: () => void;
}

const fileTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
const maxFileSize = 1 * 1024 * 1024;

const UploadPaymentProof = ({
  checkIn,
  checkOut,
  bookedUnits,
  basePrice,
  transactionId,
  onSubmitted,
  onSkip,
}: UploadPaymentProofProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const nights = differenceInCalendarDays(
    new Date(checkOut),
    new Date(checkIn),
  );
  const subTotalPrice = nights * Math.max(bookedUnits, 1) * basePrice;
  const total =
    subTotalPrice +
    Math.round(subTotalPrice * 0.1) +
    Math.round(subTotalPrice * 0.05);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > maxFileSize) {
      toast.error("File size exceeds 1MB");
      return;
    }
    if (!fileTypes.includes(file.type)) {
      toast.error("Invalid file type");
      return;
    }
    setProofFile(file);

    if (file.type !== fileTypes.find((type) => type === file.type)) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!proofFile) {
      toast.error("Please upload a payment proof");
      return;
    }
    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success("Payment proof uploaded successfully");
      onSubmitted();
    } catch (error) {
      toast.error("Failed to upload payment proof");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-br from-emerald-500/5 via-card to-primary/5 rounded-3xl border border-emerald-500/20 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle className="h-7 w-7 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Booking created! 🎉</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Secure it by uploading your transfer proof.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Transfer Details</h3>
            <p className="text-xs text-muted-foreground">
              Transfer then upload your receipt
            </p>
          </div>
        </div>
        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2.5 text-sm">
          <Row label="Bank" value={BANK.name} />
          <Row label="Account Number" value={BANK.number} mono />
          <Row label="Account Holder" value={BANK.holder} />
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-primary text-lg">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Payment Proof
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Screenshot or photo of your bank transfer receipt
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {!proofFile ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
              <FileImage className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="font-semibold text-sm mb-1">Click to upload</p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, or PDF · max 5 MB
            </p>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Payment proof"
                  className="w-full max-h-64 object-contain"
                />
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <FileImage className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{proofFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(proofFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setProofFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                File ready to upload
              </span>
            </div>
          </div>
        )}

        <Button
          variant="default"
          size="lg"
          className="w-full mt-6 rounded-2xl"
          onClick={handleSubmit}
          disabled={!proofFile || isUploading}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Uploading…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Submit Payment Proof
            </span>
          )}
        </Button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full mt-3 text-sm text-muted-foreground hover:text-primary transition-colors font-medium py-2"
        >
          Skip for now — upload later from My Bookings
        </button>
      </div>
    </div>
  );
};

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default UploadPaymentProof;
