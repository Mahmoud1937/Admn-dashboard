import { useId, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import FormActions from "../../../shared/components/FormActions";
import CategorySelect from "../../services-admin/components/CategorySelect";
import ServiceSelect from "../../providerServices/components/ServiceSelect";
import PrescriptionProviderDropdown from "./PrescriptionProviderDropdown";
import PharmaciesProcessForm from "./PharmaciesProcessForm";
import PrescriptionProcessFeedback from "./PrescriptionProcessFeedback";

const optionalNumber = (value) => value.trim() === "" ? null : Number(value);

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500";

function ServicesProcessForm({ prescription, onClose, onProcess, isSaving, error }) {
  const [items, setItems] = useState([{
    key: 1, categoryId: "", serviceId: "", providerId: "",
    quantity: "",
  }]);
  const [validationError, setValidationError] = useState("");
  const nextKey = useRef(2);

  const updateItem = (key, changes) => {
    setItems((current) => current.map((item) => item.key === key ? { ...item, ...changes } : item));
    setValidationError("");
  };

  const submit = (event) => {
    event.preventDefault();
    if (isSaving) return;
    if (items.some((item) => !item.categoryId || !item.serviceId)) {
      setValidationError("Select a category and service for each item.");
      return;
    }

    const payloadItems = items.map((item) => ({
      serviceId: Number(item.serviceId),
      providerId: item.providerId ? Number(item.providerId) : null,
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
    if (payloadItems.some((item) => item.quantity !== null &&
      (!Number.isFinite(item.quantity) || item.quantity < 0))) {
      setValidationError("Quantity must be 0 or greater.");
      return;
    }
    setValidationError("");
    onProcess({ manualPrescriptionId: prescription.id, items: payloadItems });
  };

  return (
    <form
      aria-label="Process prescription"
      aria-busy={isSaving || undefined}
      className="space-y-5"
      onSubmit={submit}
    >
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
                quantity: "",
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

            <div className="grid gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <CategorySelect
                  className="w-full"
                  value={item.categoryId}
                  onChange={(value) => updateItem(item.key, {
                    categoryId: value, serviceId: "", providerId: "",
                    quantity: "",
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
                    quantity: "",
                  })}
                  disabled={isSaving || !item.categoryId}
                  placeholder={item.categoryId ? "Select service" : "Select a category first"}
                />
              </div>
            </div>

            {Boolean(item.serviceId) && (
              <div className="mt-4">
                <label className={labelClass}>Provider <span className="font-normal text-slate-400">(optional)</span></label>
                <PrescriptionProviderDropdown
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
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div>
                  <label htmlFor={`prescription-quantity-${item.key}`} className={labelClass}>
                    Quantity
                  </label>
                  <input
                    id={`prescription-quantity-${item.key}`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="any"
                    value={item.quantity}
                    onChange={(event) => updateItem(item.key, { quantity: event.target.value })}
                    onInvalid={(event) => {
                      event.preventDefault();
                      setValidationError("Quantity must be 0 or greater.");
                    }}
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

      <PrescriptionProcessFeedback error={error} validationError={validationError} />
      <FormActions
        onCancel={onClose}
        showCancel={!isSaving}
        isSaving={isSaving}
        submitLabel="Process prescription"
        savingLabel="Processing..."
      />
    </form>
  );
}

const processingTabs = [
  { id: "services", label: "Services" },
  { id: "pharmacies", label: "Pharmacies" },
];

export default function ProcessPrescriptionForm(props) {
  const [activeTab, setActiveTab] = useState("services");
  const tabGroupId = useId();
  const tabRefs = useRef([]);

  const changeTab = (nextTab) => {
    if (props.isSaving || nextTab === activeTab) return;
    props.onClearErrors?.();
    setActiveTab(nextTab);
  };

  const handleTabKeyDown = (event, index) => {
    if (props.isSaving) return;
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % processingTabs.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + processingTabs.length) % processingTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = processingTabs.length - 1;
    else return;
    event.preventDefault();
    changeTab(processingTabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Prescription type" className="flex rounded-xl bg-slate-100 p-1">
        {processingTabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => { tabRefs.current[index] = element; }}
            type="button"
            role="tab"
            id={`${tabGroupId}-${tab.id}-tab`}
            aria-controls={`${tabGroupId}-${tab.id}-panel`}
            aria-selected={activeTab === tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            disabled={props.isSaving}
            onClick={() => changeTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 ${activeTab === tab.id ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section role="tabpanel" id={`${tabGroupId}-services-panel`} aria-labelledby={`${tabGroupId}-services-tab`} hidden={activeTab !== "services"}>
        <ServicesProcessForm {...props} error={activeTab === "services" ? props.error : null} />
      </section>
      <section role="tabpanel" id={`${tabGroupId}-pharmacies-panel`} aria-labelledby={`${tabGroupId}-pharmacies-tab`} hidden={activeTab !== "pharmacies"}>
        <PharmaciesProcessForm
          prescription={props.prescription}
          onCancel={props.onClose}
          onProcess={props.onProcess}
          disabled={props.isSaving}
          active={activeTab === "pharmacies"}
          error={activeTab === "pharmacies" ? props.error : null}
        />
      </section>
    </div>
  );
}
