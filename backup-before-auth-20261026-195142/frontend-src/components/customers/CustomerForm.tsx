import type { FormEvent } from "react";
import type { CustomerInput } from "../../services/customer-api";

interface CustomerFormProps {
  form: CustomerInput;
  editingId: string | null;
  saving: boolean;
  onFieldChange: (field: keyof CustomerInput, value: string) => void;
  onSubmit: (data: CustomerInput) => Promise<void>;
  onReset: () => void;
}

export function CustomerForm({
  form,
  editingId,
  saving,
  onFieldChange,
  onSubmit,
  onReset,
}: CustomerFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSubmit(form);
  }

  return (
    <section className="panel form-panel">
      <div className="panel-heading">
        <div>
          <span className="section-index">
            {editingId ? "01 / EDIT" : "01 / NEW"}
          </span>
          <h3>{editingId ? "تعديل بيانات العميل" : "إضافة عميل جديد"}</h3>
        </div>

        {editingId && (
          <button
            className="button button-ghost"
            type="button"
            onClick={onReset}
          >
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
              onChange={(event) =>
                onFieldChange("firstName", event.target.value)
              }
              placeholder="الاسم الأول"
            />
          </label>

          <label>
            اسم العائلة <span>*</span>
            <input
              required
              maxLength={100}
              value={form.lastName}
              onChange={(event) =>
                onFieldChange("lastName", event.target.value)
              }
              placeholder="اسم العائلة"
            />
          </label>

          <label>
            البريد الإلكتروني
            <input
              type="email"
              maxLength={254}
              value={form.email ?? ""}
              onChange={(event) =>
                onFieldChange("email", event.target.value)
              }
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
              onChange={(event) =>
                onFieldChange("phoneNumber", event.target.value)
              }
              placeholder="رقم الهاتف"
              dir="ltr"
            />
          </label>

          <label>
            تاريخ الميلاد
            <input
              type="date"
              value={form.dateOfBirth ?? ""}
              onChange={(event) =>
                onFieldChange("dateOfBirth", event.target.value)
              }
            />
          </label>
        </div>

        <div className="form-actions">
          <button
            className="button button-primary"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "جارٍ الحفظ..."
              : editingId
                ? "حفظ التعديلات"
                : "إضافة العميل"}
          </button>

          <button
            className="button button-ghost"
            type="button"
            onClick={onReset}
          >
            مسح الحقول
          </button>
        </div>
      </form>
    </section>
  );
}