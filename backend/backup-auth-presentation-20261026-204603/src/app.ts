import cors from "cors";
import express from "express";
import helmet from "helmet";

import { CreateCustomerUseCase } from "./modules/customers/application/use-cases/create-customer.use-case.js";
import { GetCustomersUseCase } from "./modules/customers/application/use-cases/get-customers.use-case.js";
import { GetCustomerByIdUseCase } from "./modules/customers/application/use-cases/get-customer-by-id.use-case.js";
import { UpdateCustomerUseCase } from "./modules/customers/application/use-cases/update-customer.use-case.js";
import { DeleteCustomerUseCase } from "./modules/customers/application/use-cases/delete-customer.use-case.js";
import { SqlServerCustomerRepository } from "./modules/customers/infrastructure/repositories/sql-server-customer.repository.js";
import { CustomerController } from "./modules/customers/presentation/controllers/customer.controller.js";
import { createCustomerRouter } from "./modules/customers/presentation/routes/customer.routes.js";
import { errorHandler } from "./shared/middlewares/error-handler.js";
import { notFoundHandler } from "./shared/middlewares/not-found-handler.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Insurance Management API is running",
  });
});

const customerRepository = new SqlServerCustomerRepository();

const customerController = new CustomerController(
  new CreateCustomerUseCase(customerRepository),
  new GetCustomersUseCase(customerRepository),
  new GetCustomerByIdUseCase(customerRepository),
  new UpdateCustomerUseCase(customerRepository),
  new DeleteCustomerUseCase(customerRepository),
);

app.use("/api/customers", createCustomerRouter(customerController));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;