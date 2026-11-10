import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import AvatarImage from "../../../shared/components/AvatarImage";
import FormActions from "../../../shared/components/FormActions";
import PrescriptionProviderDropdown from "./PrescriptionProviderDropdown";
import PrescriptionMedicineSelect from "./PrescriptionMedicineSelect";
import PrescriptionProcessFeedback from "./PrescriptionProcessFeedback";

const formatDiscount = (discount) => discount == null ? "—" : `${discount}%`;
const QUANTITY_ERROR_MESSAGE = "Quantity must be greater than 0.";

export default function PharmaciesProcessForm({ prescription, onCancel, onProcess, disabled, active = true, error }) {
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [medicines, setMedicines] = useState([{ key: 1, medicineId: "", medicine: null, quantity: "1" }]);
  const [validationError, setValidationError] = useState("");
  const nextMedicineKey = useRef(2);

  const updateMedicine = (key, changes) => {
    setMedicines((current) => current.map((item) => item.key === key ? { ...item, ...changes } : item));
    setValidationError("");
  };

  const submit = (event) => {
    event.preventDefault();
    if (disabled || !active) return;
    const providerId = selectedPharmacy?.providerId == null ? null : Number(selectedPharmacy.providerId);
    if (providerId !== null && (!Number.isSafeInteger(providerId) || providerId <= 0)) {
      setValidationError("Select a valid pharmacy or clear the selection.");
      return;
    }
    if (medicines.some((item) => !item.medicineId || !Number.isSafeInteger(Number(item.medicineId)) || Number(item.medicineId) <= 0)) {
      setValidationError("Select a medicine for each item.");
      return;
    }
    if (medicines.some((item) => item.quantity.trim() === "")) {
      setValidationError("Enter a quantity for each medicine.");
      return;
    }

    const items = medicines.map((item) => ({
      serviceId: Number(item.medicineId),
      providerId,
      quantity: Number(item.quantity),
    }));
    if (items.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      setValidationError(QUANTITY_ERROR_MESSAGE);
      return;
    }

    setValidationError("");
    onProcess({ manualPrescriptionId: prescription.id, items });
  };

  return (
    <form aria-label="Process pharmacy prescription" aria-busy={disabled || undefined} onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Pharmacy <span className="font-normal text-slate-400">(optional)</span></label>
        <PrescriptionProviderDropdown
          pharmacy
          active={active}
          value={selectedPharmacy?.providerId ?? ""}
          onChange={(_, pharmacy) => { setSelectedPharmacy(pharmacy || null); setValidationError(""); }}
          disabled={disabled}
        />
      </div>

      {selectedPharmacy && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-3">
            <AvatarImage src={selectedPharmacy.imageUrl} alt={selectedPharmacy.enName || selectedPharmacy.arName} loading="lazy" />
            <p className="min-w-0 break-words text-sm font-semibold text-slate-800" dir="auto">{selectedPharmacy.enName || selectedPharmacy.arName}</p>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div><dt className="text-slate-500">Local medicine discount</dt><dd className="mt-1 font-semibold text-emerald-700">{formatDiscount(selectedPharmacy.localMedicineDiscount)}</dd></div>
            <div><dt className="text-slate-500">Imported medicine discount</dt><dd className="mt-1 font-semibold text-blue-800">{formatDiscount(selectedPharmacy.importedMedicineDiscount)}</dd></div>
          </dl>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Medicines</h3>
          <button
            type="button"
            onClick={() => {
              const key = nextMedicineKey.current++;
              setMedicines((current) => [...current, { key, medicineId: "", medicine: null, quantity: "1" }]);
              setValidationError("");
            }}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} /> Add medicine
          </button>
        </div>
        {medicines.map((item, index) => {
          const quantity = Number(item.quantity);
          const invalidQuantity = item.quantity.trim() !== "" && (!Number.isFinite(quantity) || quantity <= 0);
          const quantityErrorId = `pharmacy-medicine-quantity-error-${item.key}`;

          return (
            <div key={item.key} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">Medicine {index + 1}</h4>
                {medicines.length > 1 && (
                  <button type="button" onClick={() => { setMedicines((current) => current.filter((entry) => entry.key !== item.key)); setValidationError(""); }} disabled={disabled} aria-label={`Remove medicine ${index + 1}`} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              </div>
              <PrescriptionMedicineSelect
                value={item.medicineId}
                onChange={(value, medicine) => updateMedicine(item.key, { medicineId: value, medicine, quantity: "1" })}
                disabled={disabled}
              />
              {item.medicine && (
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <AvatarImage src={item.medicine.medicineImageUrl} alt={item.medicine.enName || item.medicine.arName} loading="lazy" />
                  <p className="min-w-0 text-xs text-slate-500">{[item.medicine.medicineForm, item.medicine.unit].filter(Boolean).join(" · ")}</p>
                </div>
              )}
              <label className="block text-sm font-medium text-slate-700">
                Quantity <span className="text-red-600">*</span>
                <input
                  id={`pharmacy-medicine-quantity-${item.key}`}
                  type="number"
                  required
                  min="0"
                  step="any"
                  inputMode="numeric"
                  aria-invalid={invalidQuantity}
                  aria-describedby={invalidQuantity ? quantityErrorId : undefined}
                  value={item.quantity}
                  onChange={(event) => updateMedicine(item.key, { quantity: event.target.value })}
                  onInvalid={(event) => {
                    event.preventDefault();
                    setValidationError(event.target.validity.valueMissing
                      ? "Enter a quantity for each medicine."
                      : QUANTITY_ERROR_MESSAGE);
                  }}
                  disabled={disabled}
                  placeholder="Enter quantity"
                  className={`mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-4 disabled:bg-slate-50 ${invalidQuantity ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`}
                />
              </label>
              {invalidQuantity && <p id={quantityErrorId} role="alert" className="text-sm text-red-600">{QUANTITY_ERROR_MESSAGE}</p>}
            </div>
          );
        })}
      </section>
      <PrescriptionProcessFeedback error={error} validationError={validationError} active={active} />
      <FormActions onCancel={onCancel} showCancel={!disabled} isSaving={disabled} submitLabel="Process prescription" savingLabel="Processing..." />
    </form>
  );
}
