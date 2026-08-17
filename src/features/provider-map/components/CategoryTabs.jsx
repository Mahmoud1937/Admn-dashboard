import {
  faPrescriptionBottleMedical,
  faFlask,
  faXRay,
  faHospital,
  faDumbbell,
  faPersonWalking,
  faTooth,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// key must match provider.type from the API (lowercase, e.g. "pharmacy")
export const CATEGORIES = [
  { key: "All", label: "All", icon: null, color: "#1d4ed8" },
  { key: "pharmacy", label: "Pharmacy", icon: faPrescriptionBottleMedical, color: "#dc2626" },
  { key: "lab", label: "Lab", icon: faFlask, color: "#16a34a" },
  { key: "radiology", label: "Radiology", icon: faXRay, color: "#7c3aed" },
  { key: "hospital", label: "Hospital", icon: faHospital, color: "#2563eb" },
  { key: "dental", label: "Dental", icon: faTooth, color: "#db2777" },
];

export default function CategoryTabs({ activeCategory, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORIES.map(({ key, label, icon }) => {
        const isActive = activeCategory === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-700 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {icon && <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />}
            {label}
          </button>
        );
      })}
    </div>
  );
}