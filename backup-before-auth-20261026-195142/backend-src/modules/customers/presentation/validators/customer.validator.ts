
import { z } from "zod";

const customerFields = {
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(100, "First name must not exceed 100 characters."),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(100, "Last name must not exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("A valid email address is required.")
    .max(254, "Email must not exceed 254 characters.")
    .nullable()
    .optional(),

  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number must not be empty.")
    .max(30, "Phone number must not exceed 30 characters.")
    .nullable()
    .optional(),

  dateOfBirth: z
    .iso
    .date()
    .nullable()
    .optional(),
};

export const createCustomerSchema = z
  .object(customerFields)
  .strict();

export const updateCustomerSchema = z
  .object({
    ...customerFields,
    email: customerFields.email,
    phoneNumber: customerFields.phoneNumber,
    dateOfBirth: customerFields.dateOfBirth,
  })
  .strict();

export type CreateCustomerRequest = z.infer<
  typeof createCustomerSchema
>;

export type UpdateCustomerRequest = z.infer<
  typeof updateCustomerSchema
>;
