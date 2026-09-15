import { useState } from "react";
import { exportClients } from "../services/clientsService";

export function useExportClients() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async ({ filters, poolSource }) => {
    setIsExporting(true);
    try {
      const blob = await exportClients({
        searchTerm: filters.searchTerm || undefined,
        platformType:
          filters.platformType === "" ? undefined : Number(filters.platformType),
        isMale: filters.isMale === "" ? undefined : filters.isMale === "true",
        hasCard: filters.hasCard === "" ? undefined : filters.hasCard === "true",
        id: poolSource?.id,
        sourceType: poolSource?.sourceType,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `clients-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToExcel, isExporting };
}
