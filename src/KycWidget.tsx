import { useLayoutEffect } from "react";
import { Toaster } from "sonner";
import { KycProvider } from "@/KycProvider";
import { VerificationPage } from "@/VerificationPage";
import { WidgetRuntimeConfigProvider } from "@/contexts/WidgetRuntimeConfigContext";
import { useKycStore } from "@/store/kycStore";
import type { ZeehEnvironment } from "@/client/createZeehClient";

export type KycWidgetProps = {
  businessId: string;
  environment?: ZeehEnvironment;
  mainApiBaseUrl?: string;
  servicesApiOrigin?: string;
  showModeToggle?: boolean;
  defaultTheme?: "dark" | "light" | "system";
  themeStorageKey?: string;
  onComplete?: (payload: { sessionId: string }) => void;
  onError?: (message: string) => void;
  onStepChange?: (step: string) => void;
};

export function KycWidget({
  businessId,
  environment = "auto",
  mainApiBaseUrl,
  servicesApiOrigin,
  showModeToggle = true,
  defaultTheme = "dark",
  themeStorageKey = "zeeh-kyc-widget-theme",
  onComplete,
  onError,
  onStepChange,
}: KycWidgetProps) {
  useLayoutEffect(() => {
    useKycStore.getState().setBusinessCode(businessId);
  }, [businessId]);

  return (
    <WidgetRuntimeConfigProvider value={{ businessId }}>
      <KycProvider
        environment={environment}
        mainApiBaseUrl={mainApiBaseUrl}
        servicesApiOrigin={servicesApiOrigin}
        getAccessToken={() => useKycStore.getState().token}
      >
        <Toaster richColors theme="system" toastOptions={{}} />
        <VerificationPage
          showModeToggle={showModeToggle}
          defaultTheme={defaultTheme}
          themeStorageKey={themeStorageKey}
          onComplete={onComplete}
          onError={onError}
          onStepChange={onStepChange}
        />
      </KycProvider>
    </WidgetRuntimeConfigProvider>
  );
}
