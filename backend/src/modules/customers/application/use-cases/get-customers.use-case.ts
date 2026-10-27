import type { Customer } from "../../domain/entities/customer.entity.js";
import type { CustomerRepository } from "../../domain/repositories/customer.repository.js";

export class GetCustomersUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(): Promise<Customer[]> {
    return this.customerRepository.findAll();
  }
}
