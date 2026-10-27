import type { IResult } from "mssql";
import { databasePool } from "../../../../config/database.js";
import { Customer } from "../../domain/entities/customer.entity.js";
import type {
  CreateCustomerData,
  CustomerRepository,
  UpdateCustomerData,
} from "../../domain/repositories/customer.repository.js";

interface CustomerRow {
  CustomerId: number;
  FirstName: string;
  LastName: string;
  Email: string | null;
  PhoneNumber: string | null;
  DateOfBirth: Date | string | null;
  IsActive: boolean;
  CreatedAt: Date;
  UpdatedAt: Date | null;
}

export class SqlServerCustomerRepository implements CustomerRepository {
  async create(data: CreateCustomerData): Promise<Customer> {
    const result: IResult<CustomerRow> = await databasePool
      .request()
      .input("firstName", data.firstName)
      .input("lastName", data.lastName)
      .input("email", data.email)
      .input("phoneNumber", data.phoneNumber)
      .input("dateOfBirth", data.dateOfBirth)
      .query<CustomerRow>(`
        INSERT INTO dbo.Customers (
          FirstName,
          LastName,
          Email,
          PhoneNumber,
          DateOfBirth
        )
        OUTPUT
          INSERTED.CustomerId,
          INSERTED.FirstName,
          INSERTED.LastName,
          INSERTED.Email,
          INSERTED.PhoneNumber,
          INSERTED.DateOfBirth,
          INSERTED.IsActive,
          INSERTED.CreatedAt,
          INSERTED.UpdatedAt
        VALUES (
          @firstName,
          @lastName,
          @email,
          @phoneNumber,
          @dateOfBirth
        );
      `);

    const row = result.recordset[0];

    if (!row) {
      throw new Error("Failed to create customer.");
    }

    return this.mapToEntity(row);
  }

  async update(
    id: number,
    data: UpdateCustomerData,
  ): Promise<Customer | null> {
    const result: IResult<CustomerRow> = await databasePool
      .request()
      .input("id", id)
      .input("firstName", data.firstName)
      .input("lastName", data.lastName)
      .input("email", data.email)
      .input("phoneNumber", data.phoneNumber)
      .input("dateOfBirth", data.dateOfBirth)
      .query<CustomerRow>(`
        UPDATE dbo.Customers
        SET
          FirstName = @firstName,
          LastName = @lastName,
          Email = @email,
          PhoneNumber = @phoneNumber,
          DateOfBirth = @dateOfBirth,
          UpdatedAt = SYSUTCDATETIME()
        OUTPUT
          INSERTED.CustomerId,
          INSERTED.FirstName,
          INSERTED.LastName,
          INSERTED.Email,
          INSERTED.PhoneNumber,
          INSERTED.DateOfBirth,
          INSERTED.IsActive,
          INSERTED.CreatedAt,
          INSERTED.UpdatedAt
        WHERE CustomerId = @id;
      `);

    const row = result.recordset[0];

    return row ? this.mapToEntity(row) : null;
  }

  async findById(id: number): Promise<Customer | null> {
    const result: IResult<CustomerRow> = await databasePool
      .request()
      .input("id", id)
      .query<CustomerRow>(`
        SELECT
          CustomerId,
          FirstName,
          LastName,
          Email,
          PhoneNumber,
          DateOfBirth,
          IsActive,
          CreatedAt,
          UpdatedAt
        FROM dbo.Customers
        WHERE CustomerId = @id;
      `);

    const row = result.recordset[0];

    return row ? this.mapToEntity(row) : null;
  }

  async findAll(): Promise<Customer[]> {
    const result: IResult<CustomerRow> = await databasePool
      .request()
      .query<CustomerRow>(`
        SELECT
          CustomerId,
          FirstName,
          LastName,
          Email,
          PhoneNumber,
          DateOfBirth,
          IsActive,
          CreatedAt,
          UpdatedAt
        FROM dbo.Customers
        ORDER BY CustomerId DESC;
      `);

    return result.recordset.map((row) => this.mapToEntity(row));
  }
  async delete(id: number): Promise<boolean> {
    const result = await databasePool
      .request()
      .input("id", id)
      .query(`
        DELETE FROM dbo.Customers
        WHERE CustomerId = @id;
      `);

    return result.rowsAffected[0] > 0;
  }

  private mapToEntity(row: CustomerRow): Customer {
    return Customer.create({
      id: row.CustomerId,
      firstName: row.FirstName,
      lastName: row.LastName,
      email: row.Email,
      phoneNumber: row.PhoneNumber,
      dateOfBirth: row.DateOfBirth
        ? new Date(row.DateOfBirth).toISOString().slice(0, 10)
        : null,
      isActive: row.IsActive,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
    });
  }
}
