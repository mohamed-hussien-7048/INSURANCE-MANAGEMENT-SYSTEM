import { CustomerForm } from "./components/customers/CustomerForm";
import { CustomerMessages } from "./components/customers/CustomerMessages";
import { CustomerTable } from "./components/customers/CustomerTable";
import { useCustomers } from "./hooks/useCustomers";
import "./App.css";

function App() {
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
          واجهة إدارة العملاء
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

      <CustomerMessages
        error={error}
        notice={notice}
        onClearError={() => setError("")}
        onClearNotice={() => setNotice("")}
      />

      <CustomerForm
        form={form}
        editingId={editingId}
        saving={saving}
        onFieldChange={updateField}
        onSubmit={handleSubmit}
        onReset={resetForm}
      />

      <CustomerTable
        customers={filteredCustomers}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onRefresh={refreshCustomers}
        onEdit={startEditing}
        onDelete={handleDelete}
      />

      <footer className="footer">
        <span>Insurance Management System</span>
        <span>React · TypeScript · Node.js · SQL Server</span>
      </footer>
    </main>
  );
}

export default App;