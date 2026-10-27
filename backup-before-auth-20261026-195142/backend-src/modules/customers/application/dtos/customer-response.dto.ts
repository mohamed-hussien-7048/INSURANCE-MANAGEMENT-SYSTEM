import type { Customer } from "../../domain/entities/customer.entity.js";

export interface CustomerResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export function toCustomerResponseDto(
  customer: Customer,
): CustomerResponseDto {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    fullName: customer.fullName,
    email: customer.email,
    phoneNumber: customer.phoneNumber,
    dateOfBirth: customer.dateOfBirth,
    isActive: customer.isActive,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt?.toISOString() ?? null,
  };
}
