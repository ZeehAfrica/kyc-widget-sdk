import { StepCard } from "../shared/StepCard";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useKycStore } from "@/store/kycStore";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface RegionProps {
  title: string;
  description: string;
  value: string;
}

// Define the schema for region selection
const RegionSchema = z.object({
  country: z.enum(["NG", "Others"], {
    required_error: "Please select a region",
  }),
});

type RegionFormData = z.infer<typeof RegionSchema>;

export default function SelectRegion() {
  const { nextStep, setUserData, user, loading } = useKycStore();

  const regionOption: RegionProps[] = [
    {
      title: "Nigeria",
      description:
        "I'm currently residing in Nigeria and have valid Nigerian identification.",
      value: "NG",
    },
    {
      title: "Other Countries",
      description:
        "I'm verifying from outside Nigeria and will provide an international ID.",
      value: "Others",
    },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<RegionFormData>({
    resolver: zodResolver(RegionSchema),
    defaultValues: {
      country: (user.country as "NG" | "Others") || "NG",
    },
    mode: "onChange",
  });

  const selectedCountry = watch("country");

  const onSubmit = async (data: RegionFormData) => {
    setUserData({ country: data.country });
    nextStep();
  };

  return (
    <StepCard
      title="Where are you verifying from?"
      description="To tailor your verification process, let us know your country of residence."
      onContinue={handleSubmit(onSubmit)}
      disabled={!isValid || loading}
      loading={loading}
    >
      <RadioGroup
        value={selectedCountry}
        onValueChange={(value: "NG" | "Others") =>
          setValue("country", value, { shouldValidate: true })
        }
        {...register("country")}
      >
        {regionOption.map((item, index) => (
          <div
            key={index.toString()}
            className="flex items-center gap-4 border py-2 px-4 rounded-xl hover:bg-accent"
          >
            <RadioGroupItem value={item.value} id={index.toString()} />
            <Label
              htmlFor={index.toString()}
              className="flex flex-1 flex-col items-start text-md gap-0"
            >
              <p className="text-md mb-2">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </Label>
          </div>
        ))}
      </RadioGroup>
      {errors.country && (
        <p className="text-sm text-red-500 mt-2">{errors.country.message}</p>
      )}
    </StepCard>
  );
}
