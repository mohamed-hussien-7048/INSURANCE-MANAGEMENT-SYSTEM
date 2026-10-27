import { useCallback, useEffect, useState } from "react";
import {
  getAdminUsers,
  updateAdminUser,
  type AdminUser,
  type UserRole,
  type UserStatus,
} from "../../services/admin-users-api";

interface Props {
  currentUserId: string;
}

export function AdminUsersPanel({ currentUserId }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [drafts, setDrafts] = useState<
    Record<string, { role: UserRole; status: UserStatus }>
  >({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminUsers();
      setUsers(result);
      setDrafts(Object.fromEntries(
        result.map((user) => [
          user.userId,
          { role: user.role, status: user.status },
        ]),
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل المستخدمين.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function save(user: AdminUser) {
    const draft = drafts[user.userId];
    if (!draft || user.userId === currentUserId) return;

    const changes: { role?: UserRole; status?: UserStatus } = {};

    if (draft.role !== user.role) changes.role = draft.role;
    if (draft.status !== user.status) changes.status = draft.status;

    if (!changes.role && !changes.status) {
      setNotice("لا توجد تغييرات لحفظها.");
      setError("");
      return;
    }

    setSavingId(user.userId);
    setError("");
    setNotice("");

    try {
      await updateAdminUser(user.userId, changes);
      setNotice(`تم تحديث حساب ${user.displayName || user.email}.`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث الحساب.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="panel table-panel">
      <div className="panel-heading list-heading">
        <div>
          <span className="section-index">03 / ACCESS CONTROL</span>
          <h3>إدارة المستخدمين والصلاحيات</h3>
          <p>تعديل أدوار الحسابات وحالاتها. لا يمكنك تعديل حسابك الحالي.</p>
        </div>
        <button
          type="button"
          className="button button-ghost"
          onClick={() => void loadUsers()}
          disabled={loading}
        >
          {loading ? "جارٍ التحميل..." : "تحديث القائمة"}
        </button>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {notice && <div className="alert alert-success" role="status">{notice}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>البريد الإلكتروني</th>
              <th>الدور</th>
              <th>حالة الحساب</th>
              <th>تاريخ الإنشاء</th>
              <th>الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="empty-state">جارٍ تحميل المستخدمين...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="empty-state">لا توجد حسابات.</td></tr>
            ) : users.map((user) => {
              const draft = drafts[user.userId];
              const isSelf = user.userId === currentUserId;

              return (
                <tr key={user.userId}>
                  <td className="customer-name">
                    {user.displayName || "بدون اسم"}
                    {isSelf && <small> (حسابك)</small>}
                  </td>
                  <td dir="ltr" className="ltr-cell">{user.email}</td>
                  <td>
                    <select
                      aria-label={`دور ${user.email}`}
                      value={draft?.role ?? user.role}
                      disabled={isSelf || savingId === user.userId}
                      onChange={(event) => setDrafts((current) => ({
                        ...current,
                        [user.userId]: {
                          ...current[user.userId],
                          role: event.target.value as UserRole,
                        },
                      }))}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Employee">Employee</option>
                      <option value="ReadOnly">ReadOnly</option>
                    </select>
                  </td>
                  <td>
                    <select
                      aria-label={`حالة ${user.email}`}
                      value={draft?.status ?? user.status}
                      disabled={isSelf || savingId === user.userId}
                      onChange={(event) => setDrafts((current) => ({
                        ...current,
                        [user.userId]: {
                          ...current[user.userId],
                          status: event.target.value as UserStatus,
                        },
                      }))}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </td>
                  <td dir="ltr" className="ltr-cell">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button button-small button-edit"
                      disabled={isSelf || savingId === user.userId}
                      onClick={() => void save(user)}
                    >
                      {savingId === user.userId ? "جارٍ الحفظ..." : "حفظ"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
