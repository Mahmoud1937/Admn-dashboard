import { useRef, useState } from "react";
import { getApiErrorMessage } from "../helpers/apiErrorHandler";

function getExportFilename(response, fallbackFilename) {
  const disposition = response.headers?.["content-disposition"] || "";
  const encoded = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, "")) || fallbackFilename;
    } catch {
      // Fall back to a regular filename if the encoded filename is malformed.
    }
  }
  const plain = disposition.match(/filename\s*=\s*(?:"([^"]+)"|([^;]+))/i);
  return (plain?.[1] ?? plain?.[2])?.trim() || fallbackFilename;
}

const NETWORK_ERROR_CODES = new Set(["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"]);

export function getExcelExportErrorMessage(error, { errorMessage, networkErrorMessage } = {}) {
  const isNetworkError = !error?.response && NETWORK_ERROR_CODES.has(error?.code);

  if (isNetworkError && networkErrorMessage) return networkErrorMessage;
  return getApiErrorMessage(error, { details: true, fallback: errorMessage });
}

export async function validateExcelExportResponse(response, { invalidFileMessage, emptyFileMessage }) {
  const blob = response.data;
  if (blob instanceof Blob && /json/i.test(blob.type)) {
    const body = JSON.parse(await blob.text());
    const error = new Error(invalidFileMessage);
    if (body?.succeeded === false) error.response = { ...response, data: body };
    throw error;
  }
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error(emptyFileMessage);
  }
  return blob;
}

export function useExcelExport({ request, fallbackFilename, errorMessage, invalidFileMessage = "The server did not return an Excel file.", emptyFileMessage = "No Excel file was returned. Please try again.", networkErrorMessage }) {
  const exportingRef = useRef(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const exportToExcel = async (options) => {
    if (exportingRef.current) return;
    exportingRef.current = true;
    setIsExporting(true);
    setExportError("");

    try {
      const response = await request(options);
      const blob = await validateExcelExportResponse(response, { invalidFileMessage, emptyFileMessage });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      try {
        link.href = url;
        link.download = getExportFilename(response, fallbackFilename);
        document.body.appendChild(link);
        link.click();
      } finally {
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      if (error.response?.data instanceof Blob) {
        try {
          error.response.data = JSON.parse(await error.response.data.text());
        } catch {
          // Keep the original response when the backend error is not JSON.
        }
      }
      setExportError(getExcelExportErrorMessage(error, { errorMessage, networkErrorMessage }));
    } finally {
      exportingRef.current = false;
      setIsExporting(false);
    }
  };

  return { exportToExcel, isExporting, exportError };
}
