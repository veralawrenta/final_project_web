"use client";
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/validator/dashboard.images.schema";
import { CheckCircle, FileImage, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface UploadBoxProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

const UploadBox = ({ file, onFileSelect }: UploadBoxProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 1MB");
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      toast.error("Invalid file type");
      return;
    }
    onFileSelect(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleRemove = () => {
    onFileSelect(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!file ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
            <FileImage className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="font-semibold text-sm mb-1">Click to upload</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, or PDF · max 5 MB</p>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-border bg-secondary">
            {previewUrl ? (
              <img src={previewUrl} alt="Payment proof" className="w-full max-h-64 object-contain" />
            ) : (
              <div className="flex items-center gap-3 p-4">
                <FileImage className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemove}
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
    </>
  );
};

export default UploadBox;