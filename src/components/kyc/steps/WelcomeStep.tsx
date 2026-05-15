import { useEffect, useState } from "react";
import type { ZeehClient } from "@/client/createZeehClient";
import { useZeehClient } from "@/contexts/ZeehClientContext";
import { useWidgetRuntimeConfig } from "@/contexts/WidgetRuntimeConfigContext";
import { StepCard } from "../shared/StepCard";
import { useKycStore } from "@/store/kycStore";

const logoUrl = new URL("../../../assets/zeeh-logo.svg", import.meta.url).href;

const fetchBusinessInfo = async (client: ZeehClient, businessCode: string) => {
  const data = await client.getBusiness(businessCode);
  if (!data?.data?.businessName) {
    throw new Error("Business not found");
  }
  return {
    name: data.data.businessName,
  };
};

export const WelcomeStep = () => {
  const client = useZeehClient();
  const { businessId } = useWidgetRuntimeConfig();
  const {
    nextStep,
    businessInfo,
    setBusinessInfo,
    setBusinessCode,
    setLoading,
    loading,
    businessCode,
  } = useKycStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const code =
          businessId.trim() ||
          businessCode.trim() ||
          window.location.href.replace(/\/+$/, "").split("/").pop() ||
          "";

        if (!code) {
          throw new Error("Invalid business code");
        }

        const businessData = await fetchBusinessInfo(client, code);
        setBusinessInfo(businessData);
        setBusinessCode(code);
      } catch (err: unknown) {
        console.error("Failed to fetch business info:", err);
        setError(
          "The link you used is invalid. Please ensure you have the correct verification link or contact the business.",
        );
      } finally {
        setLoading(false);
      }
    };
    void fetchInfo();
  }, [
    setBusinessInfo,
    setBusinessCode,
    setLoading,
    businessCode,
    businessId,
    client,
  ]);

  if (error) {
    return (
      <StepCard centerContent loading={loading}>
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
          <h3 className="text-2xl font-bold">Zeeh Africa</h3>
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">
          Unable to Proceed
        </h2>
        <p className="text-md text-center">{error}</p>
        <p className="text-md text-center mt-4">
          Please contact the business or support@zeeh.africa.
        </p>
      </StepCard>
    );
  }

  return (
    <StepCard onContinue={nextStep} centerContent loading={loading}>
      <div className="flex items-center justify-center gap-3 mb-8">
        <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
        <h3 className="text-2xl font-bold">Zeeh Africa</h3>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-center mb-4">
        {!businessInfo.name
          ? "Loading..."
          : `Identity Verification for ${businessInfo.name}`}
      </h2>
      <p className="text-center">
        You are submitting your information to be verified by{" "}
        {businessInfo.name || "the business"}. If you received this link from an
        untrusted source, please close this page and contact the business
        immediately.
      </p>
    </StepCard>
  );
};
