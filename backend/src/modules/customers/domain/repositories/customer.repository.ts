import type { Customer } from "../entities/customer.entity.js";

export interface CreateCustomerData {
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
}

export interface UpdateCustomerData {
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
}

export interface CustomerRepository {
  create(data: CreateCustomerData): Promise<Customer>;
  update(id: number, data: UpdateCustomerData): Promise<Customer | null>;
  findById(id: number): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
delete(id: number): Promise<boolean>;
}
