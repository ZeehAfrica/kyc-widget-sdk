import "./styles/widget.css";

export { KycWidget, type KycWidgetProps } from "@/KycWidget";
export { KycProvider, type KycProviderProps } from "@/KycProvider";
export {
  VerificationPage,
  type VerificationPageProps,
} from "@/VerificationPage";
export {
  IdentityVerification,
  type IdentityVerificationProps,
} from "@/IdentityVerification";
export { LoanApplicationWidget } from "@/LoanApplicationWidget";
export { ZeehClientProvider, useZeehClient } from "@/contexts/ZeehClientContext";
export {
  WidgetRuntimeConfigProvider,
  useWidgetRuntimeConfig,
  type WidgetRuntimeConfig,
} from "@/contexts/WidgetRuntimeConfigContext";
export {
  createZeehClient,
  type ZeehClient,
  type ZeehClientConfig,
  type ZeehEnvironment,
  type IdentitySessionData,
} from "@/client/createZeehClient";
export { useKycStore } from "@/store/kycStore";
export { useIdentityStore } from "@/store/identityStore";
export {
  loadFaceApiModels,
  takeMirroredVideoSnapshot,
  isFaceCentered,
  isSmiling,
  isMouthOpen,
  DEFAULT_FACE_API_MODEL_URI,
} from "@/liveness/faceGeometry";
export { useFrameCounter } from "@/liveness/useFrameCounter";
