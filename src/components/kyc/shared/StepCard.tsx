import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { useKycStore } from "@/store/kycStore";
import { Loader } from "./Loader";

export const StepCard = ({
  title,
  description,
  children,
  onContinue,
  continueText = "Continue",
  disabled,
  centerContent = false,
  loading = false,
  showBackButton = true,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onContinue?: () => void;
  continueText?: string;
  disabled?: boolean;
  centerContent?: boolean;
  loading?: boolean;
  showBackButton?: boolean;
}) => {
  const { prevStep, step } = useKycStore();
  return (
    <div className="w-full max-w-[520px] mx-auto p-4">
      {showBackButton && step !== "welcome" && (
        <div
          onClick={prevStep}
          className="mb-4 cursor-pointer inline-flex gap-4"
        >
          <MoveLeft />
          <span>Back</span>
        </div>
      )}
      <div className="relative">
        {loading && <Loader />}
        <Card>
          <CardContent
            className={`relative p-6 space-y-4 min-h-[500px] ${
              centerContent
                ? "flex flex-col items-center justify-center text-center"
                : ""
            }`}
          >
            {title && (
              <h2 className="text-2xl font-bold text-center">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground text-center">
                {description}
              </p>
            )}
            {children}
          </CardContent>
        </Card>
      </div>

      {onContinue && continueText && (
        <Button
          className="w-full py-5 mt-5 font-semibold"
          onClick={onContinue}
          disabled={disabled || loading}
        >
          {continueText}
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center font-bold mt-5">
        Powered by Zeeh Africa
      </p>
    </div>
  );
};
