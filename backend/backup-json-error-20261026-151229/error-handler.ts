
import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  console.error("Internal server error:", error);

  response.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
};
