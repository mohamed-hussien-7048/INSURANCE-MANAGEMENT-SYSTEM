import { useCallback, useEffect, useState } from "react";
import {
  customerApi,
  type Customer,
  type CustomerInput,
} from "../services/customer-api";

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

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState<CustomerInput>({ ...emptyForm });
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
      setError(getErrorMessage(err, "تعذر تحميل العملاء."));
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
      setError(getErrorMessage(err, "تعذر حفظ بيانات العميل."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف العميل ${customer.fullName}؟`,
    );

    if (!confirmed) {
      return;
    }

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
      setError(getErrorMessage(err, "تعذر حذف العميل."));
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

  function refreshCustomers() {
    setError("");
    setLoading(true);
    void loadCustomers();
  }

  return {
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
  };
}