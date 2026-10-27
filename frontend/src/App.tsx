import { useEffect, useState } from "react";
import { CustomerForm } from "./components/customers/CustomerForm";
import { CustomerMessages } from "./components/customers/CustomerMessages";
import { CustomerTable } from "./components/customers/CustomerTable";
import { AdminUsersPanel } from "./components/admin/AdminUsersPanel";
import { getCurrentUser, type UserRole } from "./services/admin-users-api";
import { useCustomers } from "./hooks/useCustomers";
import "./App.css";

function App() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((user) => {
        if (!active) return;
        setRole(user.role);
        setCurrentUserId(user.userId);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAuthError(
          error instanceof Error
            ? error.message
            : "تعذر قراءة صلاحيات المستخدم.",
        );
      });

    return () => {
      active = false;
    };
  }, []);

  const {
    customers,
    form,
    editingId,
    search,
    loading,
    saving,
    error,
    notice,
    filteredCustomers,
    setSearch,
    setError,
    setNotice,
    updateField,
    resetForm,
    startEditing,
    handleSubmit,
    handleDelete,
    refreshCustomers,
  } = useCustomers();

  const canWrite = role === "Admin" || role === "Employee";
  const canDelete = role === "Admin";

  return (
    <main className="app-shell" dir="rtl">
      <header className="topbar">
        <div className="brand-mark">IF</div>
        <div className="brand-copy">
          <span className="eyebrow">INSURANCE MANAGEMENT SYSTEM</span>
          <h1>نظام إدارة التأمين</h1>
        </div>
        <div className="api-status">
          <span className="status-dot" />
          {role ? `الدور: ${role}` : "جارٍ التحقق من الصلاحيات"}
        </div>
      </header>

      <section className="welcome">
        <div>
          <span className="eyebrow">لوحة التحكم / العملاء</span>
          <h2>إدارة العملاء</h2>
          <p>إضافة بيانات العملاء وتحديثها والبحث عنها وإدارتها.</p>
        </div>
        <div className="total-card">
          <span>إجمالي العملاء</span>
          <strong>{customers.length}</strong>
          <small>عميل مسجل في النظام</small>
        </div>
      </section>

      {authError && (
        <div className="alert alert-error" role="alert">
          تعذر تحميل صلاحيات الحساب: {authError}
        </div>
      )}

      <CustomerMessages
        error={error}
        notice={notice}
        onClearError={() => setError("")}
        onClearNotice={() => setNotice("")}
      />

      {canWrite && (
        <CustomerForm
          form={form}
          editingId={editingId}
          saving={saving}
          onFieldChange={updateField}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      )}

      {!canWrite && role === "ReadOnly" && (
        <div className="alert" role="status">
          حسابك للعرض فقط. لا تملك صلاحية إضافة العملاء أو تعديلهم.
        </div>
      )}

      <CustomerTable
        customers={filteredCustomers}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onRefresh={refreshCustomers}
        onEdit={startEditing}
        onDelete={handleDelete}
        canEdit={canWrite}
        canDelete={canDelete}
      />

      {role === "Admin" && currentUserId && (
        <AdminUsersPanel currentUserId={currentUserId} />
      )}

      <footer className="footer">
        <span>Insurance Management System</span>
        <span>React · TypeScript · Node.js · SQL Server</span>
      </footer>
    </main>
  );
}

export default App;
