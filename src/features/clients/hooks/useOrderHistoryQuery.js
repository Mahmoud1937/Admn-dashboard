import { useCallback, useEffect, useState } from "react";
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
  enabled = true
) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrderHistory = useCallback(async () => {
    if (!enabled || !userId) return;

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

      setData(response.data);
    } catch (err) {
      setIsError(true);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, providerId, status, fromDate, toDate, pageNumber, pageSize, enabled]);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  return { data, isLoading, isError, error, refetch: fetchOrderHistory };
}