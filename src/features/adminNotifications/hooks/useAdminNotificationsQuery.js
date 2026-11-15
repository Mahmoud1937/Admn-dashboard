import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/Authcontext";
import useLanguage from "../../../localization/useLanguage";
import { getAdminNotifications, getAdminNotificationsUnreadCount } from "../services/adminNotificationsService";

export default function useAdminNotificationsQuery({ pageSize = 10, isRead } = {}) {
  const { user, isAuthenticated, isAuthInitializing, mustChangePassword } = useAuth();
  const { language } = useLanguage();
  const queryScope = ["admin-notifications", String(user?.employeeId ?? ""), language];
  const options = {
    enabled: isAuthenticated && !isAuthInitializing && !mustChangePassword,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 1,
  };
  const query = useInfiniteQuery({
    ...options,
    queryKey: [...queryScope, "list", isRead ?? "all", pageSize],
    queryFn: ({ pageParam, signal }) => getAdminNotifications({ pageNumber: pageParam, pageSize, isRead, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      const totalPages = lastPage.totalPages ?? Math.ceil(lastPage.totalCount / pageSize);
      return lastPage.items.length > 0 && lastPageParam < totalPages
        ? lastPageParam + 1
        : undefined;
    },
  });
  const unreadQuery = useQuery({
    ...options,
    queryKey: [...queryScope, "unread-count"],
    queryFn: ({ signal }) => getAdminNotificationsUnreadCount({ signal }),
  });

  // Inserts between page requests can move a notification across a page boundary.
  const notifications = [...new Map(
    (query.data?.pages ?? []).flatMap((page) => page.items).map((item) => [item.id, item]),
  ).values()];

  return {
    ...query,
    notifications,
    unreadCount: unreadQuery.data,
  };
}
