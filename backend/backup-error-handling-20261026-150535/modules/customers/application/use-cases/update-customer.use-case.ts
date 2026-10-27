
import type { Customer } from "../../domain/entities/customer.entity.js";
import type {
  UpdateCustomerData,
  CustomerRepository,
} from "../../domain/repositories/customer.repository.js";

export class UpdateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(
    id: number,
    data: UpdateCustomerData,
  ): Promise<Customer | null> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Customer ID must be a positive safe integer.");
    }

    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();

    if (!firstName) {
      throw new Error("Customer first name is required.");
    }

    if (!lastName) {
      throw new Error("Customer last name is required.");
    }

    return this.customerRepository.update(id, {
      ...data,
      firstName,
      lastName,
    });
  }
}
