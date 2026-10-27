export interface CustomerProperties {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export class Customer {
  private constructor(
    private readonly properties: CustomerProperties,
  ) {}

  static create(properties: CustomerProperties): Customer {
    const firstName = properties.firstName.trim();
    const lastName = properties.lastName.trim();

    if (firstName.length === 0) {
      throw new Error("Customer first name is required.");
    }

    if (lastName.length === 0) {
      throw new Error("Customer last name is required.");
    }

    return new Customer({
      ...properties,
      firstName,
      lastName,
    });
  }

  get id(): number {
    return this.properties.id;
  }

  get firstName(): string {
    return this.properties.firstName;
  }

  get lastName(): string {
    return this.properties.lastName;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get email(): string | null {
    return this.properties.email;
  }

  get phoneNumber(): string | null {
    return this.properties.phoneNumber;
  }

  get dateOfBirth(): string | null {
    return this.properties.dateOfBirth;
  }

  get isActive(): boolean {
    return this.properties.isActive;
  }

  get createdAt(): Date {
    return this.properties.createdAt;
  }

  get updatedAt(): Date | null {
    return this.properties.updatedAt;
  }
}
