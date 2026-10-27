export interface Customer {
  id: string;
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

export interface CustomerInput {
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
}

const API_URL = `${import.meta.env.VITE_API_URL ?? "http://localhost:3001/api"}/customers`;

async function request<T>(path = "", options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message ?? `Request failed (${response.status})`);
  }

  return result as T;
}

export const customerApi = {
  async getAll(): Promise<Customer[]> {
    const result = await request<{ success: boolean; data: Customer[] }>();
    return result.data;
  },

  async create(data: CustomerInput): Promise<Customer> {
    const result = await request<{ success: boolean; data: Customer }>("", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return result.data;
  },

  async update(id: string, data: CustomerInput): Promise<Customer> {
    const result = await request<{ success: boolean; data: Customer }>(`/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return result.data;
  },

  async delete(id: string): Promise<void> {
    await request<{ success: boolean; message: string }>(`/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
