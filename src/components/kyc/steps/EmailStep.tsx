import { StepCard } from "../shared/StepCard";
import { useKycStore } from "@/store/kycStore";
import { useForm } from "react-hook-form";
import { EmailSchema, type EmailSchemaType } from "@/schemas/emailSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { useZeehClient } from "@/contexts/ZeehClientContext";

export const EmailStep = () => {
  const client = useZeehClient();
  const { setEmail, nextStep, setLoading, loading, businessCode } =
    useKycStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailSchemaType>({
    resolver: zodResolver(EmailSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: EmailSchemaType) => {
    setLoading(true);
    setEmail(data.email); // update Zustand
    await client.registerUserEmail(data.email, businessCode);
    setLoading(false);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <StepCard
        title="Enter your email"
        description="We'll send a 6-digit code to verify it's you."
        onContinue={handleSubmit(onSubmit)}
        continueText="Send verification code"
        disabled={!isValid || loading}
        loading={loading}
      >
        <div className="flex justify-center items-center h-32">
          <img
            src="/icons/email.png"
            alt="Email icon"
            className="h-20 w-auto"
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Email</Label>
            <Input
              id="email"
              placeholder="you@example.com"
              {...register("email")}
            />
          </div>

          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
      </StepCard>
    </form>
  );
};
