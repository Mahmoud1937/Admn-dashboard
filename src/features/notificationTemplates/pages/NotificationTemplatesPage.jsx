import LocalizedPage from "../../../localization/LocalizedPage";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useServerPagination } from "../../../shared/hooks/useServerPagination";
import useAutoDismissSuccess from "../../../shared/hooks/useAutoDismissSuccess";
import Pagination from "../../../shared/components/Pagination";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import NotificationTemplatesTable from "../components/NotificationTemplatesTable";
import { useNotificationTemplatesQuery } from "../hooks/useNotificationTemplatesQuery";
import { useNotificationTemplateCreateMutation, useNotificationTemplateUpdateMutation, useNotificationTemplateToggleActiveMutation } from "../hooks/useNotificationTemplateCreateMutation";
import NotificationTemplateFormModal from "../components/NotificationTemplateFormModal";
import usePermission from "../../auth/hooks/usePermission";
import { PERMISSION_CODES } from "../../auth/constants/permissionCodes";
import Skeleton from "../../../shared/components/Skeleton";

export default function NotificationTemplatesPage() {
  const { t } = useTranslation("adminPages");
  const canCreate = usePermission(PERMISSION_CODES.NOTIFICATION_TEMPLATES_CREATE);
  const canUpdate = usePermission(PERMISSION_CODES.NOTIFICATION_TEMPLATES_UPDATE);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const createMutation = useNotificationTemplateCreateMutation();
  const updateMutation = useNotificationTemplateUpdateMutation();
  const toggleMutation = useNotificationTemplateToggleActiveMutation();
  useAutoDismissSuccess(createMutation);
  useAutoDismissSuccess(updateMutation);
  useAutoDismissSuccess(toggleMutation);
  const isMutating = createMutation.isPending || updateMutation.isPending || toggleMutation.isPending;
  const actionsDisabled = isCreateOpen || Boolean(editTarget) || isMutating;
  const { pageNumber, pageSize, goToPage, handlePageSizeChange, getPageNumbers } =
    useServerPagination({ initialPageSize: 15 });
  const { templates, totalCount, totalPages, isLoading, isError, error, refetch } =
    useNotificationTemplatesQuery({ pageNumber, pageSize });

  const handleCreate = (values) => {
    if (!canCreate || isMutating) return;
    createMutation.mutate(values, { onSuccess: () => setIsCreateOpen(false) });
  };

  const handleEdit = (template) => {
    if (!canUpdate || actionsDisabled) return;
    createMutation.reset();
    updateMutation.reset();
    toggleMutation.reset();
    setEditTarget(template);
  };

  const handleUpdate = (values) => {
    if (!canUpdate || !editTarget || isMutating) return;
    updateMutation.mutate({ templateId: editTarget.id, ...values }, { onSuccess: () => setEditTarget(null) });
  };

  const handleToggleActive = (template) => {
    if (!canUpdate || actionsDisabled) return;
    createMutation.reset();
    updateMutation.reset();
    toggleMutation.mutate(template.id);
  };

  return (
    <LocalizedPage><div className="min-w-0 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("Notification Templates")}</h1>
          <p className="text-sm text-gray-500">
            {t("View notification templates and their Arabic and English messages.")}
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={() => {
              createMutation.reset();
              updateMutation.reset();
              toggleMutation.reset();
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-950 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} />
            {t("Add template")}
          </button>
        )}
      </header>
      {createMutation.isSuccess && <p role="status" className="text-sm text-emerald-700">{t("Notification template created successfully.")}</p>}
      {updateMutation.isSuccess && <p role="status" className="text-sm text-emerald-700">{t("Notification template updated successfully.")}</p>}
      {toggleMutation.isSuccess && <p role="status" className="text-sm text-emerald-700">{t("Notification template status updated successfully.")}</p>}
      {toggleMutation.isError && (
        <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {getApiErrorMessage(toggleMutation.error, { details: true, fallback: t("Unable to update notification template status. Please try again.") })}
        </p>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div role="status" className="space-y-4 p-6">
            <span className="sr-only">{t("Loading notification templates...")}</span>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} aria-hidden="true" className="h-20 rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : isError ? (
          <QueryErrorState title={t("Unable to load notification templates")} error={error} onRetry={refetch} />
        ) : (
          <>
            <NotificationTemplatesTable
              templates={templates}
              canEdit={canUpdate}
              onEdit={handleEdit}
              editDisabled={actionsDisabled}
              canToggle={canUpdate}
              onToggleActive={handleToggleActive}
              toggleDisabled={actionsDisabled}
              isToggling={toggleMutation.isPending}
              togglingId={toggleMutation.variables}
            />
            <Pagination
              pageNumber={pageNumber}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              itemLabel={t("templates")}
              getPageNumbers={getPageNumbers}
              onGoToPage={(page) => goToPage(page, totalPages)}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </div>
      {isCreateOpen && canCreate && (
        <NotificationTemplateFormModal
          mutation={createMutation}
          onSave={handleCreate}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
      {editTarget && canUpdate && (
        <NotificationTemplateFormModal
          key={editTarget.id}
          template={editTarget}
          mutation={updateMutation}
          onSave={handleUpdate}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div></LocalizedPage>
  );
}
