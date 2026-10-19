import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";
import FormActions from "../../../shared/components/FormActions";
import ProviderAttachmentFileInput from "./ProviderAttachmentFileInput";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import {
  ATTACHMENT_FILE_ACCEPT,
  ATTACHMENT_TYPES,
  getAttachmentFileError,
  isAttachmentType,
} from "../utils/attachmentUpload";

const createAttachmentRow = (id) => ({ id, attachmentType: "", file: null, errors: {} });

function getRowErrors(attachment) {
  const errors = {};
  if (!isAttachmentType(attachment.attachmentType)) {
    errors.attachmentType = "Select an attachment type.";
  }
  const fileError = attachment.errors.file || getAttachmentFileError(attachment.file);
  if (fileError) errors.file = fileError;
  return errors;
}

export default function ProviderAttachmentUploadForm({ mutation, disabled = false }) {
  const [attachments, setAttachments] = useState(() => [createAttachmentRow(0)]);
  const nextId = useRef(1);
  const isDisabled = disabled || mutation.isPending;

  const handleAddAttachment = () => {
    if (isDisabled) return;
    mutation.reset();
    const row = createAttachmentRow(nextId.current++);
    setAttachments((previous) => [...previous, row]);
  };

  const handleFileChange = (id, event) => {
    if (isDisabled) return;
    const file = event.target.files?.[0];
    if (!file) return;
    mutation.reset();
    const error = getAttachmentFileError(file);
    if (error) event.target.value = "";
    setAttachments((previous) => previous.map((attachment) => attachment.id === id
      ? { ...attachment, file: error ? null : file, errors: { ...attachment.errors, file: error } }
      : attachment));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isDisabled || attachments.length === 0) return;
    const validated = attachments.map((attachment) => ({ ...attachment, errors: getRowErrors(attachment) }));
    setAttachments(validated);
    if (validated.some((attachment) => Object.keys(attachment.errors).length > 0)) return;
    mutation.mutate(attachments.map(({ attachmentType, file }) => ({ attachmentType, file })), {
      onSuccess: () => setAttachments([createAttachmentRow(nextId.current++)]),
    });
  };

  const errorMessage = mutation.isError
    ? getApiErrorMessage(mutation.error, { details: true, fallback: "Unable to upload attachments. Please try again." }) : null;

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={mutation.isPending} className="space-y-4 border-b border-slate-200 pb-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">Upload attachments</h3>
        <p id="attachment-upload-help" className="mt-1 text-xs text-slate-500">
          Add one attachment type and one file per row. Images, PDF, or Excel (.xls, .xlsx). Maximum 5 MB per file.
        </p>
      </div>

      <fieldset disabled={isDisabled} className="min-w-0 space-y-4">
        {attachments.length > 0 && (
          <ul aria-label="Files to upload" className="space-y-3">
            {attachments.map((attachment, index) => (
              <li key={attachment.id} aria-label={`Attachment ${index + 1}`} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]">
                <div className="min-w-0">
                  <label htmlFor={`attachment-type-${attachment.id}`} className="mb-2 block text-sm font-medium text-slate-700">
                    Attachment type <span className="sr-only">for row {index + 1}</span>
                  </label>
                  <select
                    id={`attachment-type-${attachment.id}`}
                    name="AttachmentTypes"
                    value={attachment.attachmentType}
                    required
                    aria-invalid={Boolean(attachment.errors.attachmentType)}
                    aria-describedby={attachment.errors.attachmentType ? `attachment-type-error-${attachment.id}` : undefined}
                    onChange={(event) => {
                      if (isDisabled) return;
                      mutation.reset();
                      const attachmentType = event.target.value;
                      setAttachments((previous) => previous.map((item) => item.id === attachment.id
                        ? { ...item, attachmentType, errors: { ...item.errors, attachmentType: null } } : item));
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="" disabled>Select type</option>
                    {ATTACHMENT_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {attachment.errors.attachmentType && (
                    <p id={`attachment-type-error-${attachment.id}`} role="alert" className="mt-2 text-xs text-red-600">
                      {attachment.errors.attachmentType}
                    </p>
                  )}
                </div>
                <div className="min-w-0">
                  <label htmlFor={`attachment-file-${attachment.id}`} className="mb-2 block text-sm font-medium text-slate-700">
                    File <span className="sr-only">for row {index + 1}</span>
                  </label>
                  <ProviderAttachmentFileInput
                    id={`attachment-file-${attachment.id}`}
                    name="Files"
                    required
                    accept={ATTACHMENT_FILE_ACCEPT}
                    onChange={(event) => handleFileChange(attachment.id, event)}
                    aria-invalid={Boolean(attachment.errors.file)}
                    aria-describedby={`attachment-upload-help${attachment.errors.file ? ` attachment-file-error-${attachment.id}` : ""}`}
                  />
                  {attachment.file && (
                    <p className="mt-2 truncate text-xs text-slate-500" title={attachment.file.name}>
                      {attachment.file.name} ({(attachment.file.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                  {attachment.errors.file && (
                    <p id={`attachment-file-error-${attachment.id}`} role="alert" className="mt-2 text-xs text-red-600">
                      {attachment.errors.file}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Remove attachment ${index + 1}`}
                  onClick={() => {
                    if (isDisabled) return;
                    mutation.reset();
                    setAttachments((previous) => previous.filter((item) => item.id !== attachment.id));
                  }}
                  className="inline-flex items-center gap-2 self-start justify-self-start rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:mt-7"
                >
                  <FontAwesomeIcon icon={faXmark} />
                  <span className="sm:sr-only">Remove attachment</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <FormActions
          showCancel={false}
          isSaving={mutation.isPending}
          submitDisabled={attachments.length === 0 || isDisabled}
          submitIcon={faUpload}
          submitLabel="Upload files"
          savingLabel="Uploading..."
          className="flex flex-wrap gap-3"
          submitClassName="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <button
            type="button"
            onClick={handleAddAttachment}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Attachment
          </button>
        </FormActions>
      </fieldset>

      {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}
      {mutation.isSuccess && (
        <p role="status" className="text-sm text-emerald-700">Attachments uploaded successfully.</p>
      )}
    </form>
  );
}
