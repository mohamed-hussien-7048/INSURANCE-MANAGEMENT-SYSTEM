import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { CreateCustomerUseCase } from "../src/modules/customers/application/use-cases/create-customer.use-case.js";
import { GetCustomersUseCase } from "../src/modules/customers/application/use-cases/get-customers.use-case.js";
import { GetCustomerByIdUseCase } from "../src/modules/customers/application/use-cases/get-customer-by-id.use-case.js";
import { UpdateCustomerUseCase } from "../src/modules/customers/application/use-cases/update-customer.use-case.js";
import { DeleteCustomerUseCase } from "../src/modules/customers/application/use-cases/delete-customer.use-case.js";

import { Customer } from "../src/modules/customers/domain/entities/customer.entity.js";
import type {
  CustomerRepository,
  CreateCustomerData,
  UpdateCustomerData,
} from "../src/modules/customers/domain/repositories/customer.repository.js";

function createTestCustomer(
  id = 1,
  firstName = "Mohamed",
  lastName = "Hussein",
): Customer {
  return Customer.create({
    id,
    firstName,
    lastName,
    email: null,
    phoneNumber: null,
    dateOfBirth: null,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: null,
  });
}

class FakeCustomerRepository implements CustomerRepository {
  customers: Customer[] = [createTestCustomer()];
  nextId = 2;

  async create(data: CreateCustomerData): Promise<Customer> {
    const customer = createTestCustomer(
      this.nextId++,
      data.firstName,
      data.lastName,
    );

    this.customers.push(customer);
    return customer;
  }

  async update(
    id: number,
    data: UpdateCustomerData,
  ): Promise<Customer | null> {
    const index = this.customers.findIndex((customer) => customer.id === id);

    if (index === -1) {
      return null;
    }

    const existing = this.customers[index];

    if (!existing) {
      return null;
    }

    const updated = Customer.create({
      id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
      isActive: existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    this.customers[index] = updated;
    return updated;
  }

  async findById(id: number): Promise<Customer | null> {
    return this.customers.find((customer) => customer.id === id) ?? null;
  }

  async findAll(): Promise<Customer[]> {
    return [...this.customers];
  }

  async delete(id: number): Promise<boolean> {
    const index = this.customers.findIndex((customer) => customer.id === id);

    if (index === -1) {
      return false;
    }

    this.customers.splice(index, 1);
    return true;
  }
}

describe("Customer Use Cases", () => {
  it("creates a customer and trims the names", async () => {
    const repository = new FakeCustomerRepository();
    const useCase = new CreateCustomerUseCase(repository);

    const customer = await useCase.execute({
      firstName: "  Ali  ",
      lastName: "  Hassan  ",
      email: null,
      phoneNumber: null,
      dateOfBirth: null,
    });

    assert.equal(customer.firstName, "Ali");
    assert.equal(customer.lastName, "Hassan");
  });

  it("rejects an empty first name", async () => {
    const useCase = new CreateCustomerUseCase(
      new FakeCustomerRepository(),
    );

    await assert.rejects(
      () =>
        useCase.execute({
          firstName: "   ",
          lastName: "Hassan",
          email: null,
          phoneNumber: null,
          dateOfBirth: null,
        }),
      /first name is required/i,
    );
  });

  it("returns all customers", async () => {
    const repository = new FakeCustomerRepository();
    const useCase = new GetCustomersUseCase(repository);

    const customers = await useCase.execute();

    assert.equal(customers.length, 1);
    assert.equal(customers[0]?.fullName, "Mohamed Hussein");
  });

  it("returns a customer by ID", async () => {
    const useCase = new GetCustomerByIdUseCase(
      new FakeCustomerRepository(),
    );

    const customer = await useCase.execute(1);

    assert.equal(customer?.id, 1);
  });

  it("rejects an invalid customer ID", async () => {
    const useCase = new GetCustomerByIdUseCase(
      new FakeCustomerRepository(),
    );

    await assert.rejects(
      () => useCase.execute(0),
      /positive safe integer/i,
    );
  });

  it("updates an existing customer", async () => {
    const repository = new FakeCustomerRepository();
    const useCase = new UpdateCustomerUseCase(repository);

    const customer = await useCase.execute(1, {
      firstName: "Ali",
      lastName: "Hassan",
      email: null,
      phoneNumber: null,
      dateOfBirth: null,
    });

    assert.equal(customer?.fullName, "Ali Hassan");
  });

  it("deletes an existing customer", async () => {
    const repository = new FakeCustomerRepository();
    const useCase = new DeleteCustomerUseCase(repository);

    const deleted = await useCase.execute(1);
    const remaining = await repository.findAll();

    assert.equal(deleted, true);
    assert.equal(remaining.length, 0);
  });
});