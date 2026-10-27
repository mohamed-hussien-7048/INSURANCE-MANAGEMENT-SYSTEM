
import type { Customer } from "../../domain/entities/customer.entity.js";
import type {
  UpdateCustomerData,
  CustomerRepository,
} from "../../domain/repositories/customer.repository.js";
import { AppError } from "../../../../shared/errors/app-error.js";

export class UpdateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(
    id: number,
    data: UpdateCustomerData,
  ): Promise<Customer | null> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError("Customer ID must be a positive safe integer.", 400);
    }

    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();

    if (!firstName) {
      throw new AppError("Customer first name is required.", 400);
    }

    if (!lastName) {
      throw new AppError("Customer last name is required.", 400);
    }

    return this.customerRepository.update(id, {
      ...data,
      firstName,
      lastName,
    });
  }
}
