import { z } from "zod";

export const updateAdminUserSchema = z
  .object({
    role: z.enum(["Admin", "Employee", "ReadOnly"]).optional(),
    status: z.enum(["Pending", "Active", "Disabled"]).optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.role !== undefined ||
      value.status !== undefined,
    {
      message: "At least one field must be provided.",
    },
  );
