import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const BasicInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[A-Za-z]+$/, "First name must contain only letters")
    .nonempty("First name is required"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[A-Za-z]+$/, "Last name must contain only letters")
    .nonempty("Last name is required"),
  phoneNumber: z.string().refine((value) => isValidPhoneNumber(value), {
    message: "Please enter a valid phone number",
  }),
  dob: z.string().nonempty("Date of birth is required"),
  // .refine(
  //   (value) => {
  //     const date = new Date(value);
  //     const today = new Date();
  //     const minAgeDate = new Date(
  //       today.getFullYear() - 18,
  //       today.getMonth(),
  //       today.getDate()
  //     );
  //     return date <= minAgeDate;
  //   },
  //   { message: "You must be at least 18 years old" }
  // ),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .nonempty("Address is required"),
  country: z.string(),
});

export type BasicInfoSchemaType = z.infer<typeof BasicInfoSchema>;
