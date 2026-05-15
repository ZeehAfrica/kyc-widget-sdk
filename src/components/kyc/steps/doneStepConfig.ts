import type { ZeehClient } from "@/client/createZeehClient";
import { useKycStore } from "@/store/kycStore";

export type VerificationStepStatus =
  | "pending"
  | "loading"
  | "passed"
  | "failed";

export interface VerificationStep {
  id: string;
  title: string;
  description: string;
  details: string;
  status: VerificationStepStatus;
  apiCall: (sessionId: string) => Promise<unknown>;
  errorMessage?: string;
}

export function buildVerificationSteps(
  client: ZeehClient,
  country: string | null,
): VerificationStep[] {
  const isNigeria = country === "Nigeria" || country === "NG";

  const nigeriaSteps: VerificationStep[] = [
    {
      id: "nin",
      title: "NIN Verification",
      description: "Verifying your National Identification Number",
      details:
        "We are validating your NIN against the National Identity Management Commission (NIMC) database to confirm your identity and personal information.",
      status: "pending",
      apiCall: (sid) => client.verifyNIN(sid),
    },
    {
      id: "bvn",
      title: "BVN Verification",
      description: "Validating your Bank Verification Number",
      details:
        "Checking your BVN with banking records to verify your financial identity and ensure compliance with banking regulations.",
      status: "pending",
      apiCall: (sid) => client.verifyBVN(sid),
    },
    {
      id: "basic_info",
      title: "Basic Info Verification",
      description: "Confirming your personal information",
      details:
        "Cross-referencing your provided personal details with official records and ensuring all information is accurate and up-to-date.",
      status: "pending",
      apiCall: (sid) => client.verifyBasicInfo(sid),
    },
    {
      id: "utility_bill",
      title: "Utility Bill Verification",
      description: "Verifying your utility bill",
      details:
        "Validating your uploaded utility bill to confirm your residential address and ensure it meets our verification requirements.",
      status: "pending",
      apiCall: (sid) =>
        client.verifyUtilityBill(
          sid,
          useKycStore.getState().utilityBillImageUrl ?? "",
        ),
    },
  ];

  const nonNigeriaSteps: VerificationStep[] = [
    {
      id: "passport",
      title: "Passport Verification",
      description: "Verifying your uploaded passport",
      details:
        "We are validating your uploaded passport document to confirm it is readable, authentic, and matches the details provided during verification.",
      status: "pending",
      apiCall: (sid) => client.verifyPassport(sid),
    },
    {
      id: "basic_info",
      title: "Basic Info Verification",
      description: "Confirming your personal information",
      details:
        "Cross-referencing your provided personal details with official records and ensuring all information is accurate and up-to-date.",
      status: "pending",
      apiCall: (sid) => client.verifyBasicInfo(sid),
    },
  ];

  return isNigeria ? nigeriaSteps : nonNigeriaSteps;
}
