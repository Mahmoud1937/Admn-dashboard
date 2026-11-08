import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getPrescriptionMedicines } from "../services/prescriptionsService";

export default function PrescriptionMedicineSelect({ value, onChange, disabled }) {
  return (
    <div onKeyDown={(event) => {
      if (event.key === "Enter" && event.target.tagName === "INPUT") event.preventDefault();
    }}>
      <SearchableAsyncSelect
        queryKey={["prescription-medicines"]}
        fetchItems={(pageNumber, pageSize, search) => getPrescriptionMedicines({ pageNumber, pageSize, search })}
        value={value}
        onChange={onChange}
        getOptionValue={(medicine) => medicine.id}
        getOptionLabel={(medicine) => [medicine.enName, medicine.arName].filter(Boolean).join(" - ") || `Medicine #${medicine.id}`}
        placeholder="Select medicine"
        searchPlaceholder="Search medicines..."
        disabled={disabled}
      />
    </div>
  );
}
