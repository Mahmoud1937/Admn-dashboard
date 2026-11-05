import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import FormActions from "../../../shared/components/FormActions";
import PrescriptionSidebarShell from "./PrescriptionSidebarShell";
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

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500";

export default function ProcessPrescriptionModal({ prescription, onClose, onProcess, isSaving, error }) {
  const [items, setItems] = useState([{
    key: 1, categoryId: "", serviceId: "", providerId: "",
    price: "", quantity: "",
  }]);
  const [validationError, setValidationError] = useState("");
  const nextKey = useRef(2);
  const feedbackRef = useRef(null);

  useEffect(() => {
    if (error || validationError) feedbackRef.current?.scrollIntoView({ block: "nearest" });
  }, [error, validationError]);

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
    <PrescriptionSidebarShell
      titleId="process-prescription-title"
      title={`Process prescription #${prescription.id}`}
      description={[prescription.customerFullName || `Customer #${prescription.customerId}`, prescription.phoneNumber].filter(Boolean).join(" · ")}
      closeLabel="Close process prescription form"
      className="max-w-2xl"
      isSaving={isSaving}
      onClose={onClose}
      onSubmit={submit}
      footer={(
        <FormActions
          className="flex items-center justify-end gap-3"
          onCancel={onClose}
          showCancel={!isSaving}
          isSaving={isSaving}
          submitLabel="Process prescription"
          savingLabel="Processing..."
        />
      )}
    >
      {(prescription.text || prescription.imageUrl) && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Submitted prescription</p>
          {prescription.text && (
            <p className="whitespace-pre-wrap rounded-lg bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200" dir="auto">
              {prescription.text}
            </p>
          )}
          {prescription.imageUrl && (
            <a
              href={prescription.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-lg bg-white p-2 ring-1 ring-slate-200 transition hover:ring-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label={`Open prescription #${prescription.id} image in a new tab`}
            >
              <img
                src={prescription.imageUrl}
                alt={`Prescription #${prescription.id}`}
                className="mx-auto max-h-64 max-w-full object-contain"
              />
              <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <FontAwesomeIcon icon={faExternalLinkAlt} aria-hidden="true" /> Open
              </span>
            </a>
          )}
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Services</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600">
              {items.length}
            </span>
          </div>
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} aria-hidden="true" /> Add service
          </button>
        </div>

        {items.map((item, index) => (
          <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900 text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold text-slate-800">Item {index + 1}</p>
              </div>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setItems((current) => current.filter((entry) => entry.key !== item.key));
                    setValidationError("");
                  }}
                  disabled={isSaving}
                  aria-label={`Remove item ${index + 1}`}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category</label>
                <CategorySelect
                  className="w-full"
                  value={item.categoryId}
                  onChange={(value) => updateItem(item.key, {
                    categoryId: value, serviceId: "", providerId: "",
                    price: "", quantity: "",
                  })}
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className={labelClass}>Service</label>
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
              <div className="mt-4">
                <label className={labelClass}>Provider</label>
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
              <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div>
                  <label htmlFor={`prescription-price-${item.key}`} className={labelClass}>
                    Price
                  </label>
                  <div className="relative">
                    <input
                      id={`prescription-price-${item.key}`}
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={item.price}
                      onChange={(event) => updateItem(item.key, { price: event.target.value })}
                      disabled={isSaving}
                      placeholder="Optional"
                      className={`${inputClass} pr-14`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
                      EGP
                    </span>
                  </div>
                </div>
                <div>
                  <label htmlFor={`prescription-quantity-${item.key}`} className={labelClass}>
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
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {(validationError || error) && (
        <div ref={feedbackRef} className="space-y-3">
          {validationError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {validationError}
            </p>
          )}
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              <ul className="list-disc space-y-1 pl-5">
                {getProcessErrorMessages(error).map((message, index) => (
                  <li key={`${index}-${message}`}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </PrescriptionSidebarShell>
  );
}
