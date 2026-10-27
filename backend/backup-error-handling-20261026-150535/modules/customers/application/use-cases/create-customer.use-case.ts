import type {
  CreateCustomerData,
  CustomerRepository,
} from "../../domain/repositories/customer.repository.js";
import type { Customer } from "../../domain/entities/customer.entity.js";

export class CreateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(data: CreateCustomerData): Promise<Customer> {
    const firstName = data.firstName.trim();
    const lastName = data.lastName.trim();

    if (!firstName) {
      throw new Error("Customer first name is required.");
    }

    if (!lastName) {
      throw new Error("Customer last name is required.");
    }

    return this.customerRepository.create({
      ...data,
      firstName,
      lastName,
    });
  }
}
