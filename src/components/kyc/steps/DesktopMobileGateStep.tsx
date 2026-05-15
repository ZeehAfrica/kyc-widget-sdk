import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { ExternalLink, Copy, Check } from "lucide-react";
import { StepCard } from "../shared/StepCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKycStore } from "@/store/kycStore";

interface DesktopMobileGateStepProps {
  onContinueDesktop: () => void;
}

export const DesktopMobileGateStep = ({
  onContinueDesktop,
}: DesktopMobileGateStepProps) => {
  const { businessInfo } = useKycStore();
  const [copied, setCopied] = useState(false);
  const currentUrl = useMemo(() => window.location.href, []);

  const openOnPhone = () => {
    window.open(currentUrl, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <StepCard centerContent showBackButton={false}>
      <div className="w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-bold">
            {businessInfo.name
              ? `${businessInfo.name} Verification`
              : "For Verification"}
          </h2>
          <p className="text-muted-foreground text-sm">
            Use your mobile phone for a smoother verification experience.
          </p>
        </div>

        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Scan to Continue</h3>
          <div className="mx-auto rounded-2xl border bg-white p-4 w-fit">
            <QRCode value={currentUrl} size={220} />
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>1. Open your phone camera</p>
          <p>2. Scan the QR code above</p>
          <p>3. Tap the prompt to continue</p>
        </div>

        <div className="border-t pt-5 space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            You can also copy this link and open it on your mobile device
          </p>
          <div className="flex gap-2">
            <Input readOnly value={currentUrl} className="font-mono text-sm" />
            <Button
              type="button"
              variant="outline"
              onClick={copyLink}
              className="min-w-[96px]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={openOnPhone}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4" />
            Open Link
          </Button>
        </div>

        <div className="border-t pt-4">
          <Button type="button" variant="ghost" className="w-full" onClick={onContinueDesktop}>
            Continue on Desktop
          </Button>
        </div>
      </div>
    </StepCard>
  );
};
