import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNotificationsMenu from "../../../navbar/AdminNotificationsMenu";
import useAdminNotificationsQuery from "../hooks/useAdminNotificationsQuery";
import useAdminNotificationReadMutation from "../hooks/useAdminNotificationReadMutation";
import useAdminNotificationsReadAllMutation from "../hooks/useAdminNotificationsReadAllMutation";

function prescriptionPath(notification) {
  return notification.type === "ManualPrescriptionCreated" && notification.referenceId != null
    ? `/prescriptions/${encodeURIComponent(notification.referenceId)}`
    : null;
}

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const query = useAdminNotificationsQuery({
    isRead: filter === "unread" ? false : undefined,
  });
  const markAsRead = useAdminNotificationReadMutation();
  const markAllAsRead = useAdminNotificationsReadAllMutation();

  return (
    <AdminNotificationsMenu
      notifications={query.notifications}
      unreadCount={query.unreadCount}
      filter={filter}
      onFilterChange={setFilter}
      isLoading={query.isPending}
      isRefreshing={query.isFetching && !query.isPending && !query.isFetchingNextPage}
      error={query.isError && !query.data ? query.error : null}
      onRetry={() => void query.refetch()}
      onMarkAsRead={markAsRead.mutateAsync}
      onMarkAllAsRead={markAllAsRead.mutateAsync}
      canSelect={(notification) => Boolean(prescriptionPath(notification))}
      onSelect={(notification) => navigate(prescriptionPath(notification))}
      hasMore={query.hasNextPage}
      isLoadingMore={query.isFetchingNextPage}
      loadMoreError={query.isFetchNextPageError}
      onLoadMore={() => {
        if (query.hasNextPage && !query.isFetching) {
          void query.fetchNextPage({ cancelRefetch: false });
        }
      }}
    />
  );
}
