import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { KycWidget } from "@zeehdev/zeeh-kyc-react-sdk";

const params = new URLSearchParams(window.location.search);
const businessId = params.get("businessId") ?? "your-business-id";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <KycWidget
      businessId={businessId}
      environment="sandbox"
      onStepChange={(s) => console.debug("[kyc] step", s)}
      onComplete={(p) => console.debug("[kyc] complete", p)}
    />
  </StrictMode>,
);
