export type UserRole = "Admin" | "Employee" | "ReadOnly";
export type UserStatus = "Pending" | "Active" | "Disabled";

export interface AdminUser {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

const API_URL = `${
  import.meta.env.VITE_API_URL ?? "http://localhost:3001/api"
}/auth`;

function csrfToken(): string {
  const item = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("ts_csrf="));

  return item ? decodeURIComponent(item.slice("ts_csrf=".length)) : "";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.method && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method)) {
    const token = csrfToken();
    if (!token) throw new Error("رمز الحماية غير موجود. حدّث الصفحة وحاول مرة أخرى.");
    headers.set("X-CSRF-Token", token);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message ?? `Request failed (${response.status})`);
  }

  return result as T;
}

export async function getCurrentUser(): Promise<{
  userId: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}> {
  const result = await request<{
    success: boolean;
    data: {
      user?: {
        userId: string | number;
        displayName: string;
        email: string;
        role: UserRole;
        status: UserStatus;
      };
      userId?: string | number;
      displayName?: string;
      email?: string;
      role?: UserRole;
      status?: UserStatus;
    };
    user?: {
      userId: string | number;
      displayName: string;
      email: string;
      role: UserRole;
      status: UserStatus;
    };
  }>("/me");

  const user = result.data?.user ?? result.user ?? result.data;

  if (!user?.userId || !user.role) {
    throw new Error("تعذر قراءة بيانات المستخدم الحالي من /auth/me.");
  }

  return {
    userId: String(user.userId),
    displayName: user.displayName ?? "",
    email: user.email ?? "",
    role: user.role,
    status: user.status ?? "Active",
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const result = await request<{
    success: boolean;
    data: AdminUser[];
  }>("/users");

  return result.data;
}

export async function updateAdminUser(
  userId: string,
  changes: { role?: UserRole; status?: UserStatus },
): Promise<AdminUser> {
  const result = await request<{
    success: boolean;
    data: AdminUser;
  }>(`/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });

  return result.data;
}
