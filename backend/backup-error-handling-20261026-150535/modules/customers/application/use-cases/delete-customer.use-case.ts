import type { CustomerRepository } from "../../domain/repositories/customer.repository.js";

export class DeleteCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(id: number): Promise<boolean> {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new Error("Customer ID must be a positive safe integer.");
    }

    return this.customerRepository.delete(id);
  }
}
