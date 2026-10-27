import cors from "cors";
import express from "express";
import helmet from "helmet";

import { AuthUseCases } from "./modules/auth/application/auth.use-cases.js";
import { AdminUsersUseCases } from "./modules/auth/application/admin-users.use-cases.js";
import { SqlServerAuthRepository } from "./modules/auth/repositories/sql-server-auth.repository.js";
import { PasswordService } from "./modules/auth/services/password.service.js";
import { SessionTokenService } from "./modules/auth/services/session-token.service.js";
import { createAuthRouter } from "./modules/auth/presentation/auth.routes.js";
import {
  createAuthenticationMiddleware,
  createCsrfMiddleware,
  requireRoles,
} from "./modules/auth/presentation/auth.middleware.js";

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

app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials: true,
  allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Insurance Management API is running",
  });
});

const authUseCases = new AuthUseCases(
  new SqlServerAuthRepository(),
  new PasswordService(),
  new SessionTokenService(),
);

const adminUsersUseCases = new AdminUsersUseCases(
  new SqlServerAuthRepository(),
);

app.use(
  "/api/auth",
  createAuthRouter(authUseCases, adminUsersUseCases),
);

const customerRepository = new SqlServerCustomerRepository();

const customerController = new CustomerController(
  new CreateCustomerUseCase(customerRepository),
  new GetCustomersUseCase(customerRepository),
  new GetCustomerByIdUseCase(customerRepository),
  new UpdateCustomerUseCase(customerRepository),
  new DeleteCustomerUseCase(customerRepository),
);

const authenticate = createAuthenticationMiddleware(authUseCases);

app.use(
  "/api/customers",
  authenticate,
  createCsrfMiddleware(),
  createCustomerRouter(customerController, requireRoles),
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
