import type {
  Request,
  Response,
  NextFunction,
} from "express";
import type {
  AdminUsersUseCases,
} from "../application/admin-users.use-cases.js";

export class AdminUsersController {
  constructor(
    private readonly useCases: AdminUsersUseCases,
  ) {}

  list = async (
    _request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const users = await this.useCases.listUsers();

      response.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const actorId = response.locals.authUser.userId;
      const paramId = request.params.id;
      const targetId = Array.isArray(paramId)
        ? paramId[0]
        : paramId;

      if (!targetId) {
        response.status(400).json({
          success: false,
          message: "User ID is required.",
        });
        return;
      }

      const user = await this.useCases.updateUser(
        actorId,
        targetId,
        request.body,
      );

      response.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
