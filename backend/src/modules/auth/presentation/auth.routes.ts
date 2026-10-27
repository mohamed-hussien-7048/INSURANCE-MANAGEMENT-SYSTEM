import { Router } from "express";
import { AdminUsersController } from "./admin-users.controller.js";
import type { AdminUsersUseCases } from "../application/admin-users.use-cases.js";
import { updateAdminUserSchema } from "../validators/admin-users.validator.js";
import rateLimit from "express-rate-limit";
import { validateRequest } from "../../../shared/middlewares/validate-request.js";
import { AuthController } from "./auth.controller.js";
import {
  createAuthenticationMiddleware,
  createCsrfMiddleware,
  requireRoles,
} from "./auth.middleware.js";
import type { AuthUseCases } from "../application/auth.use-cases.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";

export function createAuthRouter(
  authUseCases: AuthUseCases,
  adminUsersUseCases: AdminUsersUseCases,
): Router {
  const router = Router();
  const controller = new AuthController(authUseCases);
  const authenticate = createAuthenticationMiddleware(authUseCases);

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
  });

  router.post(
    "/register",
    registerLimiter,
    validateRequest(registerSchema),
    controller.register,
  );

  router.post(
    "/login",
    loginLimiter,
    validateRequest(loginSchema),
    controller.login,
  );

  router.get("/me", authenticate, controller.me);

  router.post(
    "/logout",
    authenticate,
    createCsrfMiddleware(),
    controller.logout,
  );


  const adminUsersController = new AdminUsersController(
    adminUsersUseCases,
  );

  router.get(
    "/users",
    authenticate,
    requireRoles("Admin"),
    adminUsersController.list,
  );

  router.patch(
    "/users/:id",
    authenticate,
    requireRoles("Admin"),
    createCsrfMiddleware(),
    validateRequest(updateAdminUserSchema),
    adminUsersController.update,
  );
  return router;
}
