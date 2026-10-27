import type { Customer } from "../../domain/entities/customer.entity.js";
import type { CustomerRepository } from "../../domain/repositories/customer.repository.js";

export class GetCustomerByIdUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(id: number): Promise<Customer | null> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Customer ID must be a positive safe integer.");
    }

    return this.customerRepository.findById(id);
  }
}
