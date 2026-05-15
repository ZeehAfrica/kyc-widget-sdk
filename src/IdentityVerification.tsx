"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createZeehClient,
  type IdentitySessionData,
  type ZeehEnvironment,
} from "@/client/createZeehClient";
import { DesktopMobileGateStep } from "@/components/kyc/steps/DesktopMobileGateStep";
import { ThemeProvider } from "@/components/kyc/theme-provider";
import { IdentityLivenessStep } from "@/components/identity/IdentityLivenessStep";
import { ZeehClientProvider, useZeehClient } from "@/contexts/ZeehClientContext";
import { useIdentityStore } from "@/store/identityStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const COUNTRY_LABELS: Record<string, string> = {
  NG: "Nigeria",
  KE: "Kenya",
  GH: "Ghana",
  UG: "Uganda",
  ZA: "South Africa",
};

export type IdentityVerificationProps = {
  sessionToken: string;
  environment?: ZeehEnvironment;
  mainApiBaseUrl?: string;
  servicesApiOrigin?: string;
  defaultTheme?: "dark" | "light" | "system";
  themeStorageKey?: string;
};

function IdentityVerificationInner({
  sessionToken,
  defaultTheme = "dark",
  themeStorageKey = "zeeh-kyc-identity-theme",
}: IdentityVerificationProps) {
  const client = useZeehClient();
  const {
    step,
    setStep,
    setSessionToken,
    setCountryCode,
    setIdCode,
    countryCode,
    idCode,
    idNumber,
    setIdNumber,
    imageUrl,
    setError,
    setVerified,
    error: storeError,
    verified: storeVerified,
  } = useIdentityStore();

  const [session, setSession] = useState<IdentitySessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canContinueDesktop, setCanContinueDesktop] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileUaPattern =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/;
    setIsMobile(mobileUaPattern.test(userAgent));
  }, []);

  useEffect(() => {
    if (!sessionToken) {
      setStep("error");
      setError("Invalid session");
      setLoading(false);
      return;
    }

    setSessionToken(sessionToken);

    void client
      .getIdentityLivenessSession(sessionToken)
      .then((data) => {
        setSession(data);
        if (data.countryCode) setCountryCode(data.countryCode);
        if (data.idCode) setIdCode(data.idCode);

        if (data.countryCode && data.idCode) {
          setStep("enter-id");
        } else if (data.countryCode) {
          setStep("select-id");
        } else {
          setStep("select-country");
        }
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Session not found or expired";
        setError(msg);
        setStep("error");
      })
      .finally(() => setLoading(false));
  }, [
    sessionToken,
    client,
    setSessionToken,
    setCountryCode,
    setIdCode,
    setStep,
    setError,
  ]);

  const handleCountrySelect = (value: string) => {
    setCountryCode(value);
    setStep("select-id");
    setIdCode(null);
  };

  const handleIdSelect = (value: string) => {
    setIdCode(value);
    setStep("enter-id");
  };

  const handleProceedToLiveness = () => {
    if (!idNumber.trim()) return;
    setStep("liveness");
  };

  const handleLivenessComplete = () => {
    setStep("done");
  };

  const handleSubmitVerification = async () => {
    if (!sessionToken || !countryCode || !idCode || !idNumber || !imageUrl) {
      setError("Missing required data");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await client.submitIdentityVerification(sessionToken, {
        countryCode,
        idCode,
        idNumber: idNumber.trim(),
        imageUrl,
      });

      setVerified(result.verified);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Verification failed. Please try again.";
      setError(msg);
      setVerified(false);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (
      step === "done" &&
      imageUrl &&
      !submitting &&
      !submittedRef.current
    ) {
      submittedRef.current = true;
      void handleSubmitVerification();
    }
  }, [step, imageUrl, submitting]);

  const shouldShowDesktopGate = !isMobile && !canContinueDesktop;

  if (loading) {
    return (
      <ThemeProvider defaultTheme={defaultTheme} storageKey={themeStorageKey}>
        <div className="flex flex-col items-center justify-center min-h-svh bg-gray-200 dark:bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading verification session...
          </p>
        </div>
      </ThemeProvider>
    );
  }

  if (step === "error") {
    return (
      <ThemeProvider defaultTheme={defaultTheme} storageKey={themeStorageKey}>
        <div className="flex flex-col items-center justify-center min-h-svh bg-gray-200 dark:bg-background p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <XCircle className="h-6 w-6" />
                Session Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">{storeError}</p>
              <p className="mt-2 text-sm text-gray-500">
                The verification link may have expired or is invalid.
              </p>
            </CardContent>
          </Card>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme={defaultTheme} storageKey={themeStorageKey}>
      {shouldShowDesktopGate ? (
        <div className="flex flex-col items-center justify-center min-h-svh bg-gray-200 dark:bg-background p-4">
          <DesktopMobileGateStep
            onContinueDesktop={() => setCanContinueDesktop(true)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-svh bg-gray-200 dark:bg-background p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === "select-country" && session && (
                <div className="space-y-4">
                  <Label>Select your country</Label>
                  <Select onValueChange={handleCountrySelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose country" />
                    </SelectTrigger>
                    <SelectContent>
                      {session.idCodesByCountry &&
                        Object.keys(session.idCodesByCountry).map((code) => (
                          <SelectItem key={code} value={code}>
                            {COUNTRY_LABELS[code] ?? code}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === "select-id" && session && countryCode && (
                <div className="space-y-4">
                  <Label>Select ID type</Label>
                  <Select onValueChange={handleIdSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {session.idCodesByCountry?.[countryCode]?.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === "enter-id" && (
                <div className="space-y-4">
                  <Label htmlFor="idNumber">
                    Enter your{" "}
                    {idCode === "nin"
                      ? "NIN"
                      : idCode === "bvn"
                        ? "BVN"
                        : idCode}
                  </Label>
                  <Input
                    id="idNumber"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder={
                      idCode === "nin"
                        ? "11 digits"
                        : idCode === "bvn"
                          ? "11 digits"
                          : "Enter ID number"
                    }
                    maxLength={idCode === "bvn" ? 11 : undefined}
                  />
                  <Button
                    onClick={handleProceedToLiveness}
                    disabled={!idNumber.trim()}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {step === "liveness" && sessionToken && (
                <IdentityLivenessStep
                  sessionToken={sessionToken}
                  onComplete={handleLivenessComplete}
                />
              )}

              {step === "done" && (
                <div className="space-y-4 text-center">
                  {submitting ? (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                      <p>Verifying your identity...</p>
                    </>
                  ) : storeVerified === true ? (
                    <>
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                      <p className="text-lg font-semibold text-green-600">
                        Verification successful!
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Your details have been sent to the merchant.
                      </p>
                    </>
                  ) : storeVerified === false ? (
                    <>
                      <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                      <p className="text-lg font-semibold text-red-600">
                        Verification failed
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {storeError}
                      </p>
                    </>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </ThemeProvider>
  );
}

export function IdentityVerification(props: IdentityVerificationProps) {
  const client = useMemo(
    () =>
      createZeehClient({
        environment: props.environment ?? "auto",
        mainApiBaseUrl: props.mainApiBaseUrl,
        servicesApiOrigin: props.servicesApiOrigin,
        getAccessToken: () => null,
      }),
    [
      props.environment,
      props.mainApiBaseUrl,
      props.servicesApiOrigin,
    ],
  );

  return (
    <ZeehClientProvider client={client}>
      <IdentityVerificationInner {...props} />
    </ZeehClientProvider>
  );
}
