import { StepCard } from "../shared/StepCard";
import { useKycStore } from "@/store/kycStore";
import { NigeriaVerification } from "./NigeriaVerification";
import { DocumentUpload } from "./DocumentUpload";

export default function DocumentUploadStep() {
  const { nextStep, loading, user } = useKycStore();
  const isNigeria = user.country === "NG" || user.country === "Nigeria";

  return (
    <StepCard
      title={
        isNigeria
          ? "Verify Your Identity"
          : "Upload your government issued ID card"
      }
      description={
        isNigeria
          ? "Provide your NIN and BVN to verify your identity securely. Your data is protected and encrypted."
          : "Drop or upload a clear JPEG/PNG image of your government issued document (max 5MB)."
      }
      onContinue={undefined}
      disabled={true}
      continueText="Continue"
      loading={loading}
    >
      {isNigeria ? (
        <NigeriaVerification onComplete={nextStep} />
      ) : (
        <DocumentUpload
          documentType="passport"
          uploadEndpoint="upload-passport"
          onComplete={() => nextStep()}
        />
      )}
    </StepCard>
  );
}
