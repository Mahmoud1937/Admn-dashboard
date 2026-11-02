import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faFile,
  faFileExcel,
  faFilePdf,
  faPaperclip,
  faPenToSquare,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { useProviderAttachmentsQuery } from "../hooks/useProviderAttachmentsQuery";
import { useProviderAttachmentUploadMutation } from "../hooks/useProviderAttachmentUploadMutation";
import { useProviderAttachmentUpdateMutation } from "../hooks/useProviderAttachmentUpdateMutation";
import { useProviderAttachmentDeleteMutation } from "../hooks/useProviderAttachmentDeleteMutation";
import { ATTACHMENT_TYPE_LABELS } from "../utils/attachmentUpload";
import ProviderAttachmentUploadForm from "./ProviderAttachmentUploadForm";
import ProviderAttachmentReplaceForm from "./ProviderAttachmentReplaceForm";
import FormModalShell from "../../../shared/components/FormModalShell";
import ConfirmDeleteModal from "../../../shared/components/ConfirmDeleteModal";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import useAutoDismissSuccess from "../../../shared/hooks/useAutoDismissSuccess";
import Skeleton from "../../../shared/components/Skeleton";

function getAttachmentFile(attachmentUrl) {
  try {
    const url = new URL(attachmentUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const fileName = url.pathname.split("/").pop();
    const extension = fileName.includes(".")
      ? fileName.split(".").pop().toUpperCase()
      : "";
    return { url: url.href, extension };
  } catch {
    return null;
  }
}

function AttachmentItem({ attachment, canReplace, canDelete, disabled, onReplace, onDelete, children }) {
  const label = ATTACHMENT_TYPE_LABELS[attachment.attachmentType]
    || attachment.attachmentTypeName || "Attachment";
  const file = getAttachmentFile(attachment.attachmentUrl);
  const icon = file?.extension === "PDF"
    ? faFilePdf
    : ["XLS", "XLSX"].includes(file?.extension) ? faFileExcel : faFile;

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-900">
        <FontAwesomeIcon icon={icon} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {file ? file.extension || "Document" : "File unavailable"}
        </p>
      </div>
      {file && (
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${label.toLowerCase()} attachment #${attachment.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          Open file
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-xs" />
        </a>
      )}
      {canReplace && (
        <button
          type="button"
          onClick={onReplace}
          disabled={disabled}
          aria-label={`Replace file for ${label.toLowerCase()} attachment #${attachment.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          Replace file
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          aria-label={`Delete ${label.toLowerCase()} attachment #${attachment.id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
          Delete
        </button>
      )}
      {children}
    </li>
  );
}

export default function ProviderAttachmentsModal({ providerRenewalId, canUpload = false, onClose }) {
  const [editingAttachmentId, setEditingAttachmentId] = useState(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);
  const uploadMutation = useProviderAttachmentUploadMutation({ providerRenewalId });
  const updateMutation = useProviderAttachmentUpdateMutation({ providerRenewalId });
  const deleteMutation = useProviderAttachmentDeleteMutation({ providerRenewalId });
  useAutoDismissSuccess(uploadMutation);
  useAutoDismissSuccess(updateMutation);
  useAutoDismissSuccess(deleteMutation);
  const isBusy = uploadMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const hasActiveAction = editingAttachmentId !== null || deletingAttachmentId !== null;
  const canDeleteAttachment = (attachment) =>
    canUpload && Number(attachment.attachmentType) === 6;
  const { attachments, isLoading, isError, error, refetch } =
    useProviderAttachmentsQuery({ providerRenewalId });

  const resetFeedback = () => {
    uploadMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
  };

  return (
    <FormModalShell
      native
      title="Renewal attachments"
      titleId="provider-attachments-title"
      description={`Renewal #${providerRenewalId}`}
      closeLabel="Close renewal attachments"
      isSaving={isBusy}
      onClose={onClose}
      className="max-w-2xl"
    >
      {canUpload && (
        <ProviderAttachmentUploadForm
          mutation={uploadMutation}
          disabled={hasActiveAction || updateMutation.isPending || deleteMutation.isPending}
          onResetFeedback={resetFeedback}
        />
      )}
      {updateMutation.isSuccess && (
        <p role="status" className="text-sm text-emerald-700">Attachment file replaced successfully.</p>
      )}
      {deleteMutation.isSuccess && (
        <p role="status" className="text-sm text-emerald-700">Attachment deleted successfully.</p>
      )}
      {isLoading ? (
        <div role="status" className="space-y-3">
          <span className="sr-only">Loading attachments...</span>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} aria-hidden="true" className="h-20 rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : isError ? (
        <QueryErrorState title="Unable to load attachments" error={error} onRetry={refetch} />
      ) : attachments.length === 0 ? (
        <TableEmptyState
          icon={faPaperclip}
          title="No attachments found"
          emptyMessage="No files have been added to this renewal yet."
        />
      ) : (
        <ul aria-label="Renewal files" className="space-y-3">
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              canReplace={canUpload && editingAttachmentId !== attachment.id}
              canDelete={canDeleteAttachment(attachment) && deletingAttachmentId !== attachment.id}
              disabled={isBusy || hasActiveAction}
              onReplace={() => {
                if (isBusy || hasActiveAction) return;
                resetFeedback();
                setEditingAttachmentId(attachment.id);
              }}
              onDelete={() => {
                if (isBusy || hasActiveAction || !canDeleteAttachment(attachment)) return;
                resetFeedback();
                setDeletingAttachmentId(attachment.id);
              }}
            >
              {canUpload && editingAttachmentId === attachment.id && (
                <ProviderAttachmentReplaceForm
                  attachmentId={attachment.id}
                  mutation={updateMutation}
                  onCancel={() => {
                    updateMutation.reset();
                    setEditingAttachmentId(null);
                  }}
                  onSuccess={() => setEditingAttachmentId(null)}
                />
              )}
              {canDeleteAttachment(attachment) && deletingAttachmentId === attachment.id && (
                <ConfirmDeleteModal
                  inline
                  isOpen
                  titleId={`delete-attachment-title-${attachment.id}`}
                  title={`Delete attachment #${attachment.id}?`}
                  message="Confirm to remove this attachment from the renewal."
                  confirmLabel="Delete attachment"
                  loadingLabel="Deleting..."
                  confirmIcon={faTrashCan}
                  isLoading={deleteMutation.isPending}
                  errorMessage={deleteMutation.isError
                    ? getApiErrorMessage(deleteMutation.error, { details: true, fallback: "Unable to delete this attachment. Please try again." }) : null}
                  onCancel={() => {
                    if (isBusy) return;
                    deleteMutation.reset();
                    setDeletingAttachmentId(null);
                  }}
                  onConfirm={() => {
                    if (isBusy || !canDeleteAttachment(attachment)) return;
                    deleteMutation.mutate(attachment.id, {
                      onSuccess: () => setDeletingAttachmentId(null),
                    });
                  }}
                />
              )}
            </AttachmentItem>
          ))}
        </ul>
      )}
    </FormModalShell>
  );
}
