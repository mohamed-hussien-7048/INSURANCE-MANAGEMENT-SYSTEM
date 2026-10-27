import type { Request, Response, NextFunction } from "express";
import { toCustomerResponseDto } from "../../application/dtos/customer-response.dto.js";
import { CreateCustomerUseCase } from "../../application/use-cases/create-customer.use-case.js";
import { GetCustomersUseCase } from "../../application/use-cases/get-customers.use-case.js";
import { GetCustomerByIdUseCase } from "../../application/use-cases/get-customer-by-id.use-case.js";
import { UpdateCustomerUseCase } from "../../application/use-cases/update-customer.use-case.js";
import { DeleteCustomerUseCase } from "../../application/use-cases/delete-customer.use-case.js";
import { AppError } from "../../../../shared/errors/app-error.js";
import type { UpdateCustomerRequest } from "../validators/customer.validator.js";

export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomersUseCase: GetCustomersUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
  ) {}

  async create(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const customer = await this.createCustomerUseCase.execute(request.body);

      response.status(201).json({
        success: true,
        data: toCustomerResponseDto(customer),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(
    _request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const customers = await this.getCustomersUseCase.execute();

      response.status(200).json({
        success: true,
        data: customers.map(toCustomerResponseDto),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = this.getCustomerId(request.params.id);
      const customer = await this.getCustomerByIdUseCase.execute(id);

      if (!customer) {
        throw new AppError("Customer not found.", 404);
      }

      response.status(200).json({
        success: true,
        data: toCustomerResponseDto(customer),
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = this.getCustomerId(request.params.id);
      const data = request.body as UpdateCustomerRequest;

      const customer = await this.updateCustomerUseCase.execute(id, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email ?? null,
        phoneNumber: data.phoneNumber ?? null,
        dateOfBirth: data.dateOfBirth ?? null,
      });

      if (!customer) {
        throw new AppError("Customer not found.", 404);
      }

      response.status(200).json({
        success: true,
        data: toCustomerResponseDto(customer),
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = this.getCustomerId(request.params.id);
      const deleted = await this.deleteCustomerUseCase.execute(id);

      if (!deleted) {
        throw new AppError("Customer not found.", 404);
      }

      response.status(200).json({
        success: true,
        message: "Customer deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  private getCustomerId(value: string | string[] | undefined): number {
    const id = typeof value === "string" ? Number(value) : Number.NaN;

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("Customer ID must be a positive integer.", 400);
    }

    return id;
  }
}