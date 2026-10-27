import { useCallback, useEffect, useState, type FormEvent } from "react";
import { customerApi, type Customer, type CustomerInput } from "./services/customer-api";
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
    setLoading(true);
    setError("");

    try {
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل العملاء.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  function updateField(field: keyof CustomerInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = normalizeForm(form);

      if (editingId !== null) {
        await customerApi.update(editingId, data);
        setNotice("تم تحديث بيانات العميل بنجاح.");
      } else {
        await customerApi.create(data);
        setNotice("تمت إضافة العميل بنجاح.");
      }

      resetForm();
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ بيانات العميل.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف العميل ${customer.fullName}؟`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await customerApi.delete(customer.id);
      setCustomers((current) => current.filter((item) => item.id !== customer.id));

      if (editingId === customer.id) resetForm();

      setNotice("تم حذف العميل بنجاح.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف العميل.");
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase();

    return [
      customer.id,
      customer.fullName,
      customer.email ?? "",
      customer.phoneNumber ?? "",
    ].some((value) => value.toLowerCase().includes(query));
  });

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

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error}</span>
          <button className="alert-action" onClick={() => setError("")}>إغلاق</button>
        </div>
      )}

      {notice && (
        <div className="alert alert-success" role="status">
          <span>{notice}</span>
          <button className="alert-action" onClick={() => setNotice("")}>إغلاق</button>
        </div>
      )}

      <section className="panel form-panel">
        <div className="panel-heading">
          <div>
            <span className="section-index">{editingId ? "01 / EDIT" : "01 / NEW"}</span>
            <h3>{editingId ? "تعديل بيانات العميل" : "إضافة عميل جديد"}</h3>
          </div>
          {editingId && (
            <button className="button button-ghost" type="button" onClick={resetForm}>
              إلغاء التعديل
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              الاسم الأول <span>*</span>
              <input
                required
                maxLength={100}
                value={form.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
                placeholder="الاسم الأول"
              />
            </label>

            <label>
              اسم العائلة <span>*</span>
              <input
                required
                maxLength={100}
                value={form.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
                placeholder="اسم العائلة"
              />
            </label>

            <label>
              البريد الإلكتروني
              <input
                type="email"
                maxLength={254}
                value={form.email ?? ""}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="name@example.com"
                dir="ltr"
              />
            </label>

            <label>
              رقم الهاتف
              <input
                type="tel"
                maxLength={30}
                value={form.phoneNumber ?? ""}
                onChange={(event) => updateField("phoneNumber", event.target.value)}
                placeholder="رقم الهاتف"
                dir="ltr"
              />
            </label>

            <label>
              تاريخ الميلاد
              <input
                type="date"
                value={form.dateOfBirth ?? ""}
                onChange={(event) => updateField("dateOfBirth", event.target.value)}
              />
            </label>
          </div>

          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? "جارٍ الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة العميل"}
            </button>
            <button className="button button-ghost" type="button" onClick={resetForm}>
              مسح الحقول
            </button>
          </div>
        </form>
      </section>

      <section className="panel table-panel">
        <div className="panel-heading list-heading">
          <div>
            <span className="section-index">02 / DIRECTORY</span>
            <h3>سجل العملاء</h3>
            <p>بيانات العملاء المسجلة في قاعدة البيانات.</p>
          </div>

          <button className="button button-ghost" onClick={() => void loadCustomers()} disabled={loading}>
            {loading ? "جارٍ التحميل..." : "تحديث البيانات"}
          </button>
        </div>

        <div className="table-toolbar">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ابحث بالاسم أو البريد أو رقم الهاتف أو ID..."
            />
          </label>
          <span className="result-count">{filteredCustomers.length} نتيجة</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>رقم العميل</th>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>رقم الهاتف</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="empty-state">جارٍ تحميل بيانات العملاء...</td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan={6} className="empty-state">لا توجد بيانات مطابقة للبحث.</td></tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td><span className="id-chip">#{customer.id}</span></td>
                    <td className="customer-name">{customer.fullName}</td>
                    <td dir="ltr" className="ltr-cell">{customer.email || "—"}</td>
                    <td dir="ltr" className="ltr-cell">{customer.phoneNumber || "—"}</td>
                    <td>
                      <span className={`status-pill ${customer.isActive ? "active" : "inactive"}`}>
                        {customer.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="button button-small button-edit" onClick={() => startEditing(customer)}>
                          تعديل
                        </button>
                        <button className="button button-small button-delete" onClick={() => void handleDelete(customer)}>
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="footer">
        <span>Insurance Management System</span>
        <span>React · TypeScript · Node.js · SQL Server</span>
      </footer>
    </main>
  );
}

export default App;
