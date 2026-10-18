import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTriangleExclamation,
  faCircleCheck,
  faCircleXmark,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../auth/context/Authcontext";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import useNotificationsQuery from "../hooks/useNotificationsQuery";
import useNotificationMutations from "../hooks/useNotificationMutations";
import NotificationsTable from "../components/NotificationsTable";
import NotificationFormModal from "../components/NotificationFormModal";
import NotificationEditModal from "../components/NotificationEditModal";

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;
  const isSuccess = toast.type === "success";

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      <FontAwesomeIcon icon={isSuccess ? faCircleCheck : faCircleXmark} className="mt-0.5" />
      <p className="text-sm">{toast.message}</p>
    </div>
  );
}

function ConfirmDelete({ target, onCancel, onConfirm, isDeleting }) {
  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) =>
        event.target === event.currentTarget && !isDeleting && onCancel()
      }
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete notification?</h3>
            <p className="mt-1 text-sm text-gray-600">
              <span dir="auto" className="font-medium">
                &ldquo;{target.title}&rdquo;
              </span>{" "}
              will be permanently removed. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting && <FontAwesomeIcon icon={faSpinner} spin />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSION_CODES.NOTIFICATION_MARKETING_CREATE);
  const canDelete = hasPermission(PERMISSION_CODES.NOTIFICATION_MARKETING_DELETE);
  const { data = [], isLoading, isError, refetch } = useNotificationsQuery();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const { create, remove, update, toggleActive } = useNotificationMutations({
    onSuccess: (message) => setToast({ type: "success", message }),
    onError: (message) => setToast({ type: "error", message }),
  });

  const handleCreate = (payload) =>
    create.mutate(payload, { onSuccess: () => setFormOpen(false) });

  const handleUpdate = (payload) =>
    update.mutate(payload, { onSuccess: () => setEditTarget(null) });

  const handleToggleActive = (notification) => toggleActive.mutate(notification);

  const handleDelete = () =>
    remove.mutate(deleteTarget.notificationId, {
      onSettled: () => setDeleteTarget(null),
    });

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            Create and manage marketing push notifications sent to app users.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-950"
          >
            <FontAwesomeIcon icon={faPlus} />
            New notification
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isError ? (
          <div className="px-4 py-16 text-center">
            <p className="font-medium text-gray-800">Could not load notifications</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-sm font-medium text-blue-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <NotificationsTable
            items={data}
            isLoading={isLoading}
            onDelete={setDeleteTarget}
            onEdit={setEditTarget}
            onToggleActive={handleToggleActive}
            canEdit={canCreate}
            canToggle={canCreate}
            isToggling={toggleActive.isPending}
            canDelete={canDelete}
          />
        )}
      </div>

      <NotificationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        isSaving={create.isPending}
      />
      <NotificationEditModal
        notification={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        isSaving={update.isPending}
      />
      <ConfirmDelete
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={remove.isPending}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
