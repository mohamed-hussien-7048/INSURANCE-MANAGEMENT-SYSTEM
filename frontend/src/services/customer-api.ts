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

const API_URL = `${
  import.meta.env.VITE_API_URL ?? "http://localhost:3001/api"
}/customers`;

function getCsrfToken(): string {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("ts_csrf="));

  if (!cookie) {
    return "";
  }

  return decodeURIComponent(cookie.slice("ts_csrf=".length));
}

async function request<T>(
  path = "",
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = getCsrfToken();

    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.message ?? `Request failed (${response.status})`,
    );
  }

  return result as T;
}

export const customerApi = {
  async getAll(): Promise<Customer[]> {
    const result = await request<{
      success: boolean;
      data: Customer[];
    }>();

    return result.data;
  },

  async create(data: CustomerInput): Promise<Customer> {
    const result = await request<{
      success: boolean;
      data: Customer;
    }>("", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return result.data;
  },

  async update(id: string, data: CustomerInput): Promise<Customer> {
    const result = await request<{
      success: boolean;
      data: Customer;
    }>(`/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return result.data;
  },

  async delete(id: string): Promise<void> {
    await request<{
      success: boolean;
      message: string;
    }>(`/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
