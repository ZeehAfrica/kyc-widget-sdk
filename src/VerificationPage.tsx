import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/kyc/mode-toggle";
import { BasicInfoStep } from "@/components/kyc/steps/BasicInfoStep";
import { DesktopMobileGateStep } from "@/components/kyc/steps/DesktopMobileGateStep";
import DocumentUploadStep from "@/components/kyc/steps/DocumentUploadStep";
import { DoneStep } from "@/components/kyc/steps/DoneStep";
import { EmailStep } from "@/components/kyc/steps/EmailStep";
import { FaceLivenessStep } from "@/components/kyc/steps/FaceLivenessStep";
import SelectRegion from "@/components/kyc/steps/SelectRegion";
import UtilityBillUploadStep from "@/components/kyc/steps/UtilityBillUploadStep";
import VerificationSteps from "@/components/kyc/steps/VerificationSteps";
import { VerifyCodeStep } from "@/components/kyc/steps/VerifyCodeStep";
import { WelcomeStep } from "@/components/kyc/steps/WelcomeStep";
import { ThemeProvider } from "@/components/kyc/theme-provider";
import { useKycStore } from "@/store/kycStore";

export type VerificationPageProps = {
  showModeToggle?: boolean;
  defaultTheme?: "dark" | "light" | "system";
  themeStorageKey?: string;
  onStepChange?: (step: string) => void;
  onComplete?: (payload: { sessionId: string }) => void;
  onError?: (message: string) => void;
};

export function VerificationPage({
  showModeToggle = true,
  defaultTheme = "dark",
  themeStorageKey = "zeeh-kyc-widget-theme",
  onStepChange,
  onComplete,
  onError,
}: VerificationPageProps) {
  const { step } = useKycStore();
  const [isMobile, setIsMobile] = useState(false);
  const [canContinueDesktop, setCanContinueDesktop] = useState(false);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileUaPattern =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/;
    setIsMobile(mobileUaPattern.test(userAgent));
  }, []);

  useEffect(() => {
    if (step !== "welcome") {
      setCanContinueDesktop(false);
    }
  }, [step]);

  const shouldShowDesktopGate =
    step === "welcome" && !isMobile && !canContinueDesktop;

  return (
    <ThemeProvider defaultTheme={defaultTheme} storageKey={themeStorageKey}>
      {showModeToggle ? <ModeToggle /> : null}
      <div className="flex flex-col items-center justify-center min-h-svh bg-gray-200 dark:bg-background">
        {shouldShowDesktopGate && (
          <DesktopMobileGateStep
            onContinueDesktop={() => setCanContinueDesktop(true)}
          />
        )}
        {step === "welcome" && !shouldShowDesktopGate && <WelcomeStep />}
        {step === "email" && <EmailStep />}
        {step === "verify" && <VerifyCodeStep />}
        {step === "select-region" && <SelectRegion />}
        {step === "verification-steps" && <VerificationSteps />}
        {step === "basicInfo" && <BasicInfoStep />}
        {step === "document" && <DocumentUploadStep />}
        {step === "utility-bill" && <UtilityBillUploadStep />}
        {step === "faceLiveness" && <FaceLivenessStep />}
        {step === "done" && (
          <DoneStep onComplete={onComplete} onError={onError} />
        )}
      </div>
    </ThemeProvider>
  );
}
