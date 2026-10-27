import type { Customer } from "../../domain/entities/customer.entity.js";
import type { CustomerRepository } from "../../domain/repositories/customer.repository.js";
import { AppError } from "../../../../shared/errors/app-error.js";

export class GetCustomerByIdUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(id: number): Promise<Customer | null> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("Customer ID must be a positive safe integer.", 400);
    }

    return this.customerRepository.findById(id);
  }
}
