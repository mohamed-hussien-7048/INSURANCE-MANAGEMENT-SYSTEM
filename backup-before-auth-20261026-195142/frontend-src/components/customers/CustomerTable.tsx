import type { Customer } from "../../services/customer-api";

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => Promise<void>;
}

export function CustomerTable({
  customers,
  loading,
  search,
  onSearchChange,
  onRefresh,
  onEdit,
  onDelete,
}: CustomerTableProps) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading list-heading">
        <div>
          <span className="section-index">02 / DIRECTORY</span>
          <h3>سجل العملاء</h3>
          <p>بيانات العملاء المسجلة في قاعدة البيانات.</p>
        </div>

        <button
          className="button button-ghost"
          type="button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "جارٍ التحميل..." : "تحديث البيانات"}
        </button>
      </div>

      <div className="table-toolbar">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ابحث بالاسم أو البريد أو رقم الهاتف أو ID..."
          />
        </label>
        <span className="result-count">{customers.length} نتيجة</span>
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
              <tr>
                <td colSpan={6} className="empty-state">
                  جارٍ تحميل بيانات العملاء...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state">
                  لا توجد بيانات مطابقة للبحث.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <span className="id-chip">#{customer.id}</span>
                  </td>
                  <td className="customer-name">{customer.fullName}</td>
                  <td dir="ltr" className="ltr-cell">
                    {customer.email || "—"}
                  </td>
                  <td dir="ltr" className="ltr-cell">
                    {customer.phoneNumber || "—"}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        customer.isActive ? "active" : "inactive"
                      }`}
                    >
                      {customer.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="button button-small button-edit"
                        type="button"
                        onClick={() => onEdit(customer)}
                      >
                        تعديل
                      </button>
                      <button
                        className="button button-small button-delete"
                        type="button"
                        onClick={() => void onDelete(customer)}
                      >
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
  );
}