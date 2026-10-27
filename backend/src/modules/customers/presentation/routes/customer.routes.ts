import { Router } from "express";
import type { RequestHandler } from "express";
import type { CustomerController } from "../controllers/customer.controller.js";
import type { UserRole } from "../../../auth/domain/auth.types.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validators/customer.validator.js";
import { validateRequest } from "../../../../shared/middlewares/validate-request.js";

type RoleGuard = (...roles: UserRole[]) => RequestHandler;

export function createCustomerRouter(
  customerController: CustomerController,
  requireRoles: RoleGuard,
): Router {
  const customerRouter = Router();

  customerRouter.get(
    "/",
    requireRoles("Admin", "Employee", "ReadOnly"),
    customerController.getAll.bind(customerController),
  );

  customerRouter.get(
    "/:id",
    requireRoles("Admin", "Employee", "ReadOnly"),
    customerController.getById.bind(customerController),
  );

  customerRouter.post(
    "/",
    requireRoles("Admin", "Employee"),
    validateRequest(createCustomerSchema),
    customerController.create.bind(customerController),
  );

  customerRouter.put(
    "/:id",
    requireRoles("Admin", "Employee"),
    validateRequest(updateCustomerSchema),
    customerController.update.bind(customerController),
  );

  customerRouter.delete(
    "/:id",
    requireRoles("Admin"),
    customerController.delete.bind(customerController),
  );

  return customerRouter;
}