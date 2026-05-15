import {
  FileArchive,
  MailCheck,
  ScanFace,
  ShieldQuestionIcon,
  CreditCard,
} from "lucide-react";
import { StepCard } from "../shared/StepCard";
import { useKycStore } from "@/store/kycStore";

interface OptionProps {
  title: string;
  icon: React.ReactElement;
}

export default function VerificationSteps() {
  const { nextStep, user } = useKycStore();
  const isNigeria = user.country === "NG";

  const options: OptionProps[] = [
    {
      title: "Email verification",
      icon: <MailCheck />,
    },
    {
      title: "We will ask you some questions",
      icon: <ShieldQuestionIcon />,
    },
    {
      title: isNigeria ? "Provide NIN and BVN" : "Provide identity document",
      icon: isNigeria ? <CreditCard /> : <FileArchive />,
    },
    {
      title: "Perform liveness check",
      icon: <ScanFace />,
    },
  ];

  return (
    <StepCard
      title="Let's get you verified"
      description="Follow the simple steps below"
      onContinue={nextStep}
    >
      <div className="space-y-4 mt-8">
        {options.map((item, index) => (
          <div key={index.toString()} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex justify-center items-center bg-accent">
              {item.icon}
            </div>
            <div>
              {index > 0 ? (
                <div className="text-sm text-muted-foreground">
                  Step {index + 1}
                </div>
              ) : (
                <span className="bg-accent/80 text-green-600 p-0.5 px-2 text-sm font-bold">
                  Accepted
                </span>
              )}
              <p className="text-md">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </StepCard>
  );
}
