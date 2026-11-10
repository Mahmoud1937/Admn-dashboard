import { useCallback, useEffect, useRef, useState } from "react";
import { getOrderHistory } from "../services/clientsService";


/**
 * Fetches a client's order history with optional filters + pagination.
 *
 * @param {string|number} userId - required. Maps to the `UserId` query param.
 * @param {object} filters - { providerId, status, fromDate, toDate, pageNumber, pageSize }
 * @param {boolean} enabled - only fetches when true (e.g. when the accordion is open)
 */
export function useOrderHistoryQuery(
  userId,
  { providerId, status, fromDate, toDate, pageNumber = 1, pageSize = 15 } = {},
  enabled = true,
  language,
) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);
  const [resultLanguage, setResultLanguage] = useState(null);
  const requestRef = useRef(0);

  const fetchOrderHistory = useCallback(async () => {
    if (!enabled || !userId) return;
    const requestId = ++requestRef.current;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await getOrderHistory({
        userId,
        providerId,
        status,
        fromDate,
        toDate,
        pageNumber,
        pageSize,
      });

      if (!response.succeeded) {
        throw new Error(response.message || "Failed to load order history");
      }

      if (requestId !== requestRef.current) return;
      setData(response.data);
      setResultLanguage(language);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setIsError(true);
      setError(err);
      setResultLanguage(language);
    } finally {
      if (requestId === requestRef.current) setIsLoading(false);
    }
  }, [userId, providerId, status, fromDate, toDate, pageNumber, pageSize, enabled, language]);

  useEffect(() => {
    // This existing hook manages its loading state while starting the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrderHistory();
    return () => { requestRef.current += 1; };
  }, [fetchOrderHistory]);

  return {
    data: language && resultLanguage !== language ? null : data,
    isLoading: isLoading || (Boolean(language) && resultLanguage !== language),
    isError: isError && (!language || resultLanguage === language),
    error,
    refetch: fetchOrderHistory,
  };
}
