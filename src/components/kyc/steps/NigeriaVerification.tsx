"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKycStore } from "@/store/kycStore";
import { useZeehClient } from "@/contexts/ZeehClientContext";
import { toast } from "sonner";

interface NigeriaVerificationProps {
  onComplete: () => void;
}

export function NigeriaVerification({ onComplete }: NigeriaVerificationProps) {
  const client = useZeehClient();
  const [nin, setNin] = useState("");
  const [bvn, setBvn] = useState("");
  const [ninVerified, setNinVerified] = useState(false);
  const [bvnVerified, setBvnVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState<"nin" | "bvn" | "complete">(
    "nin"
  );
  const [error, setError] = useState<string | null>(null);
  const { loading, setLoading, setUserData, user } = useKycStore();

  const steps = [
    {
      name: "NIN Verification",
      status:
        currentStep === "nin" ? "active" : ninVerified ? "complete" : "pending",
    },
    {
      name: "BVN Verification",
      status:
        currentStep === "bvn" ? "active" : bvnVerified ? "complete" : "pending",
    },
  ];

  useEffect(() => {
    setNin(user.ninId ?? "");
    setBvn(user.bvnId ?? "");
  }, [user]);

  const validateInput = (value: string): boolean => {
    return value.match(/^\d{11}$/) !== null;
  };

  const handleNinSubmit = () => {
    if (!validateInput(nin)) {
      setError("Please enter a valid 11-digit NIN.");
      return;
    }
    setError(null);
    setNinVerified(true);
    setCurrentStep("bvn");
  };

  const handleBvnSubmit = () => {
    if (!validateInput(bvn)) {
      setError("Please enter a valid 11-digit BVN.");
      return;
    }
    setError(null);
    setBvnVerified(true);
    setCurrentStep("complete");
  };

  const verifyNinAndBvn = async () => {
    setLoading(true);
    try {
      const res = await client.submitUseNIN_BVN(nin, bvn);
      setUserData(res.data.user);

      onComplete();
      } catch (error: unknown) {
        toast.error("Failed to verify");
        console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === "complete" && ninVerified && bvnVerified) {
      verifyNinAndBvn();
    }
  }, [currentStep, ninVerified, bvnVerified]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex justify-center mb-4"
      >
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full",
                  step.status === "complete"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                    : step.status === "active"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                    : "bg-slate-600 text-gray-300"
                )}
              >
                {step.status === "complete" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "ml-2 text-sm font-medium",
                  step.status === "complete" || step.status === "active"
                    ? "dark:text-white"
                    : "dark:text-gray-400"
                )}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-1 bg-slate-600 mx-2" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <Card className="border-0">
        <CardContent className="p-4 sm:p-6">
          {currentStep === "nin" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="h-5 w-5 text-blue-400" />
                <label
                  htmlFor="nin"
                  className="text-sm font-medium dark:text-white"
                >
                  Enter Your NIN
                </label>
              </div>
              <Input
                id="nin"
                type="text"
                value={nin}
                onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 11-digit NIN"
                className="w-full px-3 py-5 border rounded-lg dark:bg-input/30"
                maxLength={11}
                disabled={loading}
              />
              <button
                onClick={handleNinSubmit}
                disabled={loading || nin.length !== 11}
                className={cn(
                  "mt-4 w-full py-2 px-4 rounded-lg",
                  loading || nin.length !== 11
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                Continue
              </button>
            </motion.div>
          )}
          {currentStep === "bvn" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-2 mb-3">
                <Shield className="h-5 w-5 text-blue-400" />
                <label
                  htmlFor="bvn"
                  className="text-sm font-medium dark:text-white"
                >
                  Enter Your BVN
                </label>
              </div>
              <Input
                id="bvn"
                type="text"
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 11-digit BVN"
                className="w-full px-3 py-5 border rounded-lg dark:bg-input/30"
                maxLength={11}
                disabled={loading}
              />
              <button
                onClick={handleBvnSubmit}
                disabled={loading || bvn.length !== 11}
                className={cn(
                  "mt-4 w-full py-2 px-4 rounded-lg",
                  loading || bvn.length !== 11
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                Continue
              </button>
            </motion.div>
          )}
          {currentStep === "complete" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="dark:text-white font-medium text-lg">
                Ready to Verify NIN and BVN
              </p>
              <p className="text-sm dark:text-gray-300 mt-2">
                Click Continue to verify your identity.
              </p>
              <button
                onClick={verifyNinAndBvn}
                disabled={loading}
                className={cn(
                  "mt-4 w-full py-2 px-4 rounded-lg",
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert
          variant="destructive"
          className="animate-in fade-in border-red-400 bg-red-950/50 text-red-200"
        >
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
