import { useEffect, useState } from "react";
import { mapInvoiceToStep } from "../utils/timelineMapper";
import { getInvoiceTimeline } from "../services/invoicesService";


export function useInvoiceTimeline(orderNo) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderNo) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getInvoiceTimeline({ orderNo, signal: controller.signal })
      .then((data) => {
        setSteps(data.map(mapInvoiceToStep));
      })
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") {
          setError(err.response?.data?.message || err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [orderNo]);

  return { steps, loading, error };
}