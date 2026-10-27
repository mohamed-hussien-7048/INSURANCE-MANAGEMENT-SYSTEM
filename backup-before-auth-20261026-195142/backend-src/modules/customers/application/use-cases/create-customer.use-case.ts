import type {
  CreateCustomerData,
  CustomerRepository,
} from "../../domain/repositories/customer.repository.js";
import type { Customer } from "../../domain/entities/customer.entity.js";
import { AppError } from "../../../../shared/errors/app-error.js";

export class CreateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(data: CreateCustomerData): Promise<Customer> {
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();

    if (!firstName) {
      throw new AppError("Customer first name is required.", 400);
    }

    if (!lastName) {
      throw new AppError("Customer last name is required.", 400);
    }

    return this.customerRepository.create({
      ...data,
      firstName,
      lastName,
    });
  }
}
