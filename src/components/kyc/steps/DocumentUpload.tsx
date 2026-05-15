import {
  useState,
  useCallback,
  useEffect,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, AlertCircle, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useKycStore } from "@/store/kycStore";
import { useZeehClient } from "@/contexts/ZeehClientContext";
import axios from "axios";

interface DocumentUploadProps {
  documentType: "passport" | "utility";
  /** Used with default KYC multipart upload when `customUpload` is not set. */
  uploadEndpoint?: string;
  /** When set (e.g. utility bill → Services API), runs instead of `uploadDocument`. */
  customUpload?: (file: File) => Promise<void>;
  onComplete: () => void;
}

interface DocumentConfig {
  allowedTypes: string[];
  maxSize: number;
  maxSizeLabel: string;
  label: string;
}

const documentConfigs: Record<"passport" | "utility", DocumentConfig> = {
  passport: {
    allowedTypes: ["image/jpeg", "image/png"],
    maxSize: 5 * 1024 * 1024, // 5MB
    maxSizeLabel: "5MB",
    label: "Passport",
  },
  utility: {
    allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
    maxSize: 5 * 1024 * 1024, // matches Services API image upload limit
    maxSizeLabel: "5MB",
    label: "Utility Bill",
  },
};

export function DocumentUpload({
  documentType,
  uploadEndpoint,
  customUpload,
  onComplete,
}: DocumentUploadProps) {
  const client = useZeehClient();
  const { setLoading } = useKycStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "verifying" | "uploaded" | "failed"
  >("idle");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const config = documentConfigs[documentType];

  const handleFile = useCallback(
    (selectedFile: File) => {
      if (!config.allowedTypes.includes(selectedFile.type)) {
        setError(
          `Please upload a ${config.allowedTypes
            .map((type) => type.split("/")[1].toUpperCase())
            .join(" or ")} file.`
        );
        return;
      }

      if (selectedFile.size > config.maxSize) {
        setError(`File size must be less than ${config.maxSizeLabel}.`);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setStatus("verifying");
      setLoading(true);

      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === "application/pdf") {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    },
    [config, setLoading]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const verifyDocument = useCallback(async () => {
    if (!file) {
      setError(`Please upload a ${config.label.toLowerCase()}.`);
      setStatus("failed");
      setLoading(false);
      return;
    }

    try {
      if (customUpload) {
        await customUpload(file);
      } else {
        if (!uploadEndpoint) {
          throw new Error("Upload is not configured");
        }
        await client.uploadDocument(file, uploadEndpoint);
      }
      // If we reach here, it means the request was successful
      setStatus("uploaded");
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiMessage =
          err.response?.data?.message ?? err.response?.data?.errors;
        if (typeof apiMessage === "string" && apiMessage.trim()) {
          setError(apiMessage);
        } else {
          setError(`Upload failed. Please try again.`);
        }
      } else {
        setError(`Upload failed. Please try again.`);
      }
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  }, [file, config, uploadEndpoint, customUpload, setLoading, client]);

  useEffect(() => {
    if (status === "verifying") {
      verifyDocument();
    }
  }, [status, verifyDocument]);

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setStatus("idle");
    setIsPreviewOpen(false);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {(status === "idle" ||
        status === "verifying" ||
        status === "uploaded") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300",
            isDragging
              ? "border-blue-500 bg-blue-500/10 shadow-lg"
              : "border-slate-300 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-800/50",
            "hover:border-blue-400 hover:bg-blue-400/10"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-gray-400 dark:text-gray-300 mb-3" />
          <p className="text-base font-medium dark:text-white text-center">
            {isDragging
              ? `Drop your ${config.label.toLowerCase()} here`
              : `Drag & drop or click to upload your ${config.label.toLowerCase()}`}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Supported formats:{" "}
            {config.allowedTypes
              .map((type) => type.split("/")[1].toUpperCase())
              .join(", ")}{" "}
            (Max {config.maxSizeLabel})
          </p>
          <Input
            id={`${documentType}-file-input`}
            type="file"
            accept={config.allowedTypes.join(",")}
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
            style={{ zIndex: 10 }}
          />
        </motion.div>
      )}

      {preview && status === "idle" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative group"
        >
          <img
            src={preview}
            alt={`${config.label} preview`}
            className="w-full h-auto rounded-lg border border-slate-600 shadow-md transition-transform duration-300 group-hover:scale-[1.01]"
            style={{ maxHeight: "200px", objectFit: "contain" }}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 transition-opacity duration-200"
            onClick={resetUpload}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {status === "uploaded" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              className=" hover:bg-blue-400/10"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500/80 hover:bg-red-600"
              onClick={resetUpload}
            >
              <X className="h-4 w-4 mr-2" />
              Replace
            </Button>
          </div>
          <Button
            className="w-full transition-colors duration-200"
            onClick={onComplete}
          >
            Continue
          </Button>
        </motion.div>
      )}

      {status === "failed" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-4"
        >
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="text-lg font-semibold text-white">
            {config.label} Upload Failed
          </p>
          <p className="text-sm text-gray-300">
            {error || "Something went wrong. Please try again."}
          </p>
          <Button className="w-full" onClick={resetUpload}>
            Try Again
          </Button>
        </motion.div>
      )}

      {error && status !== "failed" && (
        <Alert
          variant="destructive"
          className="animate-in fade-in border-red-400 bg-red-950/50 text-red-200"
        >
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-auto bg-accent-foreground">
          <DialogHeader>
            <DialogTitle className="text-white">
              {config.label} Preview
            </DialogTitle>
          </DialogHeader>
          {preview ? (
            file?.type === "application/pdf" ? (
              <iframe
                src={preview}
                className="w-full h-[60vh] rounded-md"
                title={`${config.label} preview`}
              />
            ) : (
              <img
                src={preview}
                alt={`${config.label} preview`}
                className="w-full h-auto max-h-[60vh] object-contain rounded-md"
              />
            )
          ) : (
            <p className="text-gray-400">No preview available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
