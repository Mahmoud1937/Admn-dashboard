import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import FormActions from "../../../shared/components/FormActions";
import FormModalShell from "../../../shared/components/FormModalShell";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import CategorySelect from "../../services-admin/components/CategorySelect";
import ServiceSelect from "../../providerServices/components/ServiceSelect";
import PrescriptionProviderSelect from "./PrescriptionProviderSelect";

function getProcessErrorMessages(error) {
  if (!error?.response) return [getApiErrorMessage(error)];

  const body = error.response.data;
  const errors = body?.errors;
  const details = Array.isArray(errors)
    ? errors.filter((message) => typeof message === "string")
    : errors && typeof errors === "object"
      ? Object.entries(errors).flatMap(([field, messages]) =>
          (Array.isArray(messages) ? messages : [messages])
            .filter((message) => typeof message === "string")
            .map((message) => `${field}: ${message}`)
        )
      : [];

  return details.length ? details : [getApiErrorMessage(error, {
    details: true,
    fallback: "Failed to process prescription.",
  })];
}

const optionalNumber = (value) => value.trim() === "" ? null : Number(value);

export default function ProcessPrescriptionModal({ prescription, onClose, onProcess, isSaving, error }) {
  const [items, setItems] = useState([{
    key: 1, categoryId: "", serviceId: "", providerId: "",
    price: "", quantity: "",
  }]);
  const [validationError, setValidationError] = useState("");
  const nextKey = useRef(2);

  const updateItem = (key, changes) => {
    setItems((current) => current.map((item) => item.key === key ? { ...item, ...changes } : item));
    setValidationError("");
  };

  const submit = (event) => {
    event.preventDefault();
    if (items.some((item) => !item.categoryId || !item.serviceId)) {
      setValidationError("Select a category and service for each item.");
      return;
    }

    const payloadItems = items.map((item) => ({
      serviceId: Number(item.serviceId),
      providerId: item.providerId ? Number(item.providerId) : null,
      price: optionalNumber(item.price),
      quantity: optionalNumber(item.quantity),
    }));
    if (payloadItems.some((item) => !Number.isInteger(item.serviceId) || item.serviceId <= 0)) {
      setValidationError("Select a valid service for each item.");
      return;
    }
    if (payloadItems.some((item) => item.providerId !== null &&
      (!Number.isInteger(item.providerId) || item.providerId <= 0))) {
      setValidationError("Select a valid provider for each item.");
      return;
    }
    setValidationError("");
    onProcess({ manualPrescriptionId: prescription.id, items: payloadItems });
  };

  return (
    <FormModalShell
      native
      titleId="process-prescription-title"
      title={`Process prescription #${prescription.id}`}
      description={prescription.customerFullName || `Customer #${prescription.customerId}`}
      closeLabel="Close process prescription form"
      className="max-w-2xl"
      isSaving={isSaving}
      onClose={onClose}
      onSubmit={submit}
    >
      {(prescription.text || prescription.imageUrl) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          {prescription.text && (
            <p className="whitespace-pre-wrap text-sm text-slate-700" dir="auto">{prescription.text}</p>
          )}
          {prescription.imageUrl && (
            <a
              href={prescription.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-lg bg-white p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              aria-label={`Open prescription #${prescription.id} image in a new tab`}
            >
              <img
                src={prescription.imageUrl}
                alt={`Prescription #${prescription.id}`}
                className="mx-auto max-h-64 max-w-full object-contain"
              />
            </a>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Services</h3>
          <button
            type="button"
            onClick={() => {
              setItems((current) => [...current, {
                key: nextKey.current++, categoryId: "", serviceId: "", providerId: "",
                price: "", quantity: "",
              }]);
              setValidationError("");
            }}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-blue-800 hover:bg-blue-50 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} /> Add service
          </button>
        </div>
        {items.map((item, index) => (
          <div key={item.key} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Item {index + 1}</p>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setItems((current) => current.filter((entry) => entry.key !== item.key));
                    setValidationError("");
                  }}
                  disabled={isSaving}
                  aria-label={`Remove item ${index + 1}`}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                <CategorySelect
                  value={item.categoryId}
                  onChange={(value) => updateItem(item.key, {
                    categoryId: value, serviceId: "", providerId: "",
                    price: "", quantity: "",
                  })}
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Service</label>
                <ServiceSelect
                  key={`${item.key}-${item.categoryId}`}
                  categoryId={item.categoryId || undefined}
                  value={item.serviceId}
                  onChange={(value) => updateItem(item.key, {
                    serviceId: value, providerId: "",
                    price: "", quantity: "",
                  })}
                  disabled={isSaving || !item.categoryId}
                  placeholder={item.categoryId ? "Select service" : "Select a category first"}
                />
              </div>
            </div>
            {Boolean(item.serviceId) && (
              <div className="mt-3">
                <label className="mb-1 block text-sm font-medium text-slate-700">Provider</label>
                <PrescriptionProviderSelect
                  key={`${item.key}-${item.serviceId}`}
                  serviceId={item.serviceId}
                  value={item.providerId}
                  onChange={(value) => updateItem(item.key, {
                    providerId: value || "",
                  })}
                  disabled={isSaving}
                />
              </div>
            )}
            {item.serviceId && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`prescription-price-${item.key}`} className="mb-1 block text-sm font-medium text-slate-700">
                    Price (EGP)
                  </label>
                  <input
                    id={`prescription-price-${item.key}`}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={item.price}
                    onChange={(event) => updateItem(item.key, { price: event.target.value })}
                    disabled={isSaving}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label htmlFor={`prescription-quantity-${item.key}`} className="mb-1 block text-sm font-medium text-slate-700">
                    Quantity
                  </label>
                  <input
                    id={`prescription-quantity-${item.key}`}
                    type="number"
                    inputMode="numeric"
                    step="any"
                    value={item.quantity}
                    onChange={(event) => updateItem(item.key, { quantity: event.target.value })}
                    disabled={isSaving}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {validationError && <p role="alert" className="text-sm text-red-600">{validationError}</p>}
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <ul className="list-disc space-y-1 pl-5">
            {getProcessErrorMessages(error).map((message, index) => (
              <li key={`${index}-${message}`}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      <FormActions
        onCancel={onClose}
        showCancel={!isSaving}
        isSaving={isSaving}
        submitLabel="Process prescription"
        savingLabel="Processing..."
      />
    </FormModalShell>
  );
}
