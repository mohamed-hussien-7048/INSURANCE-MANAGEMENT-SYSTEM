import { Router } from "express";
import type { CustomerController } from "../controllers/customer.controller.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validators/customer.validator.js";
import { validateRequest } from "../../../../shared/middlewares/validate-request.js";

export function createCustomerRouter(
  customerController: CustomerController,
): Router {
  const customerRouter = Router();

  customerRouter.get(
    "/",
    customerController.getAll.bind(customerController),
  );

  customerRouter.get(
    "/:id",
    customerController.getById.bind(customerController),
  );

  customerRouter.post(
    "/",
    validateRequest(createCustomerSchema),
    customerController.create.bind(customerController),
  );

  customerRouter.put(
    "/:id",
    validateRequest(updateCustomerSchema),
    customerController.update.bind(customerController),
  );

  customerRouter.delete(
    "/:id",
    customerController.delete.bind(customerController),
  );

  return customerRouter;
}