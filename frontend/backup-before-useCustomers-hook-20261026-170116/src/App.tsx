import { useCallback, useEffect, useState } from "react";
import { customerApi, type Customer, type CustomerInput } from "./services/customer-api";
import { CustomerForm } from "./components/customers/CustomerForm";
import { CustomerMessages } from "./components/customers/CustomerMessages";
import { CustomerTable } from "./components/customers/CustomerTable";
import "./App.css";

const emptyForm: CustomerInput = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
};

function normalizeForm(data: CustomerInput): CustomerInput {
  return {
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email?.trim() || null,
    phoneNumber: data.phoneNumber?.trim() || null,
    dateOfBirth: data.dateOfBirth || null,
  };
}

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CustomerInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      const data = await customerApi.getAll();
      setCustomers(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل العملاء.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialCustomers() {
      try {
        const data = await customerApi.getAll();

        if (!cancelled) {
          setCustomers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "تعذر تحميل العملاء.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field: keyof CustomerInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  function startEditing(customer: Customer) {
    setEditingId(customer.id);
    setForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email ?? "",
      phoneNumber: customer.phoneNumber ?? "",
      dateOfBirth: customer.dateOfBirth?.slice(0, 10) ?? "",
    });
    setNotice("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(data: CustomerInput) {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const normalizedData = normalizeForm(data);

      if (editingId !== null) {
        await customerApi.update(editingId, normalizedData);
        setNotice("تم تحديث بيانات العميل بنجاح.");
      } else {
        await customerApi.create(normalizedData);
        setNotice("تمت إضافة العميل بنجاح.");
      }

      resetForm();
      setLoading(true);
      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "تعذر حفظ بيانات العميل.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف العميل ${customer.fullName}؟`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await customerApi.delete(customer.id);
      setCustomers((current) =>
        current.filter((item) => item.id !== customer.id),
      );

      if (editingId === customer.id) {
        resetForm();
      }

      setNotice("تم حذف العميل بنجاح.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف العميل.");
    }
  }

  const query = search.trim().toLowerCase();

  const filteredCustomers = customers.filter((customer) =>
    [
      customer.id,
      customer.fullName,
      customer.email ?? "",
      customer.phoneNumber ?? "",
    ].some((value) => value.toLowerCase().includes(query)),
  );

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
        onRefresh={() => {
          setError("");
          setLoading(true);
          void loadCustomers();
        }}
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