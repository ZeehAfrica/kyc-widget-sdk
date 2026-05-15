import { useEffect, useCallback } from "react";
import { StepCard } from "../shared/StepCard";
import { useKycStore } from "@/store/kycStore";
import { PhoneInput } from "../shared/PhoneInput";
import { Input } from "../../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Country } from "react-phone-number-input";
import { CountryDropdown } from "../shared/ContryDropdown";
import { useZeehClient } from "@/contexts/ZeehClientContext";
import { toast } from "sonner";

// Define the schema for basic info
const BasicInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
});

type BasicInfoSchemaType = z.infer<typeof BasicInfoSchema>;

export const BasicInfoStep = () => {
  const client = useZeehClient();
  const {
    basicInfo,
    setBasicInfo,
    nextStep,
    setLoading,
    loading,
    user,
    setUserData,
  } = useKycStore();
  const isNigeria = user.country === "NG";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<BasicInfoSchemaType>({
    resolver: zodResolver(BasicInfoSchema),
    mode: "onChange",
    defaultValues: {
      firstName: basicInfo.firstName,
      lastName: basicInfo.lastName,
      phoneNumber: basicInfo.phoneNumber,
      country:
        basicInfo.country || isNigeria
          ? "NG"
          : user.country === "Others"
            ? "US"
            : user.country || "US", // Default to "US" if not Nigeria and no user country
    },
  });

  const countryValue = watch("country");
  const phoneNumberValue = watch("phoneNumber");

  // Update country value when isNigeria changes
  useEffect(() => {
    if (isNigeria) {
      setValue("country", "NG", { shouldValidate: true });
    }
  }, [isNigeria, setValue]);

  // Use useCallback to stabilize onChange handler
  const handlePhoneChange = useCallback(
    (value: string) => {
      setValue("phoneNumber", value, { shouldValidate: true });
    },
    [setValue],
  );

  const handleCountryChange = useCallback(
    (value: Country) => {
      setValue("country", value, { shouldValidate: true });
    },
    [setValue],
  );

  const onSubmit = async (data: BasicInfoSchemaType) => {
    setLoading(true);
    try {
      setBasicInfo({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });
      setUserData({
        phoneNumber: data.phoneNumber,
        country: isNigeria ? "NG" : data.country,
      });
      const res = await client.submitBasicInfo(data);
      setUserData(res.data.user);
      nextStep();
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast.error("Submission failed", {
        description: `${error.response.data.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <StepCard
      title="Enter Your Basic Information"
      description="Please enter your details exactly as they appear on your official identification documents"
      onContinue={handleSubmit(onSubmit)}
      disabled={!isValid || loading}
      loading={loading}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Input
            className="w-full px-3 py-5 border rounded-lg dark:bg-input/30"
            placeholder="First name"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            className="w-full px-3 py-5 border rounded-lg dark:bg-input/30"
            placeholder="Last name"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      {!isNigeria && (
        <div className="space-y-2">
          <CountryDropdown
            value={countryValue as Country} // Use form's country value
            onChange={handleCountryChange}
            disabled={loading}
          />
          {errors.country && (
            <p className="text-sm text-red-500">{errors.country.message}</p>
          )}
        </div>
      )}
      <div className="space-y-2">
        <PhoneInput value={phoneNumberValue} onChange={handlePhoneChange} />
        {errors.phoneNumber && (
          <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>
    </StepCard>
  );
};
