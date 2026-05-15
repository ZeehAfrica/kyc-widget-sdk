import { useEffect, useState } from "react";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { StepCard } from "../shared/StepCard";
import { useKycStore } from "@/store/kycStore";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useZeehClient } from "@/contexts/ZeehClientContext";
import { toast } from "sonner";

const RESEND_INTERVAL = 30; // seconds

export const VerifyCodeStep = () => {
  const client = useZeehClient();
  const { setUserData, nextStep, businessCode, email } = useKycStore();
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(RESEND_INTERVAL);

  // Auto-verify when code is 6 digits
  useEffect(() => {
    const tryVerify = async () => {
      setVerifying(true);

      try {
        const data = await client.verifyEmail(businessCode, email, code);
        setUserData(data.data.user, data.data.token);
        nextStep();
      } catch (error: unknown) {
        const msg =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Please enter a valid otp";
        setError(msg);
        toast.error("OTP verification failed", {
          description: msg,
        });
      } finally {
        setVerifying(false);
      }
    };

    if (code.length === 6) {
      tryVerify();
    }
  }, [code, nextStep, businessCode, email, setUserData, client]);

  const handleResend = async () => {
    setResending(true);
    setCode("");
    await client.resendOtp(businessCode, email);
    setTimer(RESEND_INTERVAL);
    setResending(false);
  };

  // Countdown timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <StepCard
      title="Enter Verification Code"
      description="Check your email for the 6-digit code."
      onContinue={undefined}
      continueText=""
      disabled
      loading={verifying} // Show loader during verification
    >
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          value={code}
          onChange={(val) => {
            setError("");
            setCode(val);
          }}
        >
          <InputOTPGroup className="gap-3">
            {[...Array(6)].map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="w-12 h-12 text-2xl border-2 border-gray-200 dark:border-muted rounded-lg bg-gray-100"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && (
        <div className="mt-4 mx-auto max-w-md">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-red-600 dark:text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="text-center mt-4">
        {timer > 0 ? (
          <p className="text-sm text-muted-foreground">
            Resend code in <span className="font-medium">{timer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-primary hover:underline font-medium"
          >
            {resending ? "Resending..." : "Resend Code"}
          </button>
        )}
      </div>
    </StepCard>
  );
};
