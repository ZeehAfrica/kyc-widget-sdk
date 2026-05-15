import { useKycStore } from "@/store/kycStore";
import { useZeehClient } from "@/contexts/ZeehClientContext";
import { StepCard } from "../shared/StepCard";
import { DocumentUpload } from "./DocumentUpload";
import { useEffect, useRef } from "react";

export default function UtilityBillUploadStep() {
  const client = useZeehClient();
  const { nextStep, user, setUtilityBillImageUrl } = useKycStore();
  const isNigeria = user.country === "NG" || user.country === "Nigeria";
  const hasSkipped = useRef(false);

  useEffect(() => {
    if (!isNigeria && !hasSkipped.current) {
      hasSkipped.current = true;
      nextStep();
    }
  }, [isNigeria, nextStep]);

  // Don't render anything for non-Nigeria users
  if (!isNigeria) {
    return null;
  }

  return (
    <StepCard
      title="Upload Utility Bill"
      description="Please upload your most recent utility bill."
    >
      <DocumentUpload
        documentType="utility"
        customUpload={async (file) => {
          const url = await client.uploadUtilityBillToServicesApi(file);
          setUtilityBillImageUrl(url);
        }}
        onComplete={() => nextStep()}
      />
    </StepCard>
  );
}
