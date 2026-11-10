import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getPrescriptionMedicines } from "../services/prescriptionsService";
import useLanguage from "../../../localization/useLanguage";
import usePrescriptionsText from "../../../localization/usePrescriptionsText";

export default function PrescriptionMedicineSelect({ value, onChange, disabled }) {
  const t = usePrescriptionsText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  return (
    <div onKeyDown={(event) => {
      if (event.key === "Enter" && event.target.tagName === "INPUT") event.preventDefault();
    }}>
      <SearchableAsyncSelect
        queryKey={["prescription-medicines", language]}
        fetchItems={(pageNumber, pageSize, search) => getPrescriptionMedicines({ pageNumber, pageSize, search })}
        value={value}
        onChange={onChange}
        getOptionValue={(medicine) => medicine.id}
        getOptionLabel={(medicine) => (rtl ? [medicine.arName, medicine.enName] : [medicine.enName, medicine.arName]).filter(Boolean).join(" - ") || t("Medicine #{{id}}", { id: medicine.id })}
        placeholder={t("Select medicine")}
        searchPlaceholder={t("Search medicines...")}
        labels={{
          loading: t("Loading..."), loadingMore: t("Loading more..."),
          unableToLoadOptions: t("Unable to load options."), tryAgain: t("Try again"),
          noResults: t("No results found."), clearSelection: t("Clear selection"),
          openOptions: t("Open options"), closeOptions: t("Close options"),
        }}
        rtl={rtl}
        disabled={disabled}
      />
    </div>
  );
}
