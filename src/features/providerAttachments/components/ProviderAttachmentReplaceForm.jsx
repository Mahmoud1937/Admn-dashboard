import { useState } from "react";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import FormActions from "../../../shared/components/FormActions";
import ProviderAttachmentFileInput from "./ProviderAttachmentFileInput";
import { getApiErrorMessage } from "../../../shared/helpers/apiErrorHandler";
import { ATTACHMENT_FILE_ACCEPT, getAttachmentFileError } from "../utils/attachmentUpload";

export default function ProviderAttachmentReplaceForm({ attachmentId, mutation, onCancel, onSuccess }) {
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const helpId = `replacement-file-help-${attachmentId}`;
  const errorMessage = validationError || (mutation.isError
    ? getApiErrorMessage(mutation.error, { details: true, fallback: "Unable to replace this file. Please try again." }) : null);

  const handleFileChange = (event) => {
    if (mutation.isPending) return;
    const selectedFile = event.target.files?.[0];
    event.target.value = "";
    if (!selectedFile) return;
    mutation.reset();
    const error = getAttachmentFileError(selectedFile);
    setValidationError(error);
    setFile(error ? null : selectedFile);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mutation.isPending) return;
    const error = getAttachmentFileError(file);
    setValidationError(error);
    if (error) return;
    mutation.mutate({ attachmentId, file }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={mutation.isPending} className="w-full space-y-3 border-t border-slate-100 pt-4">
      <fieldset disabled={mutation.isPending} className="min-w-0 space-y-3">
        <div>
          <label htmlFor={`replacement-file-${attachmentId}`} className="mb-2 block text-sm font-medium text-slate-700">
            Replacement file
          </label>
          <ProviderAttachmentFileInput
            dimDisabled={false}
            id={`replacement-file-${attachmentId}`}
            accept={ATTACHMENT_FILE_ACCEPT}
            onChange={handleFileChange}
            aria-describedby={helpId}
          />
          <p id={helpId} className="mt-2 text-xs text-slate-500">
            Images, PDF, or Excel (.xls, .xlsx). Maximum 5 MB.
          </p>
          {file && <p className="mt-2 break-words text-sm text-slate-700">Selected: {file.name}</p>}
        </div>
        <FormActions
          onCancel={onCancel}
          isSaving={mutation.isPending}
          submitDisabled={!file}
          submitIcon={faFloppyDisk}
          submitLabel="Save replacement"
          submitFirst
          className="flex flex-wrap gap-2"
          submitClassName="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          cancelClassName="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        />
      </fieldset>
      {errorMessage && <p role="alert" className="text-sm text-red-600">{errorMessage}</p>}
    </form>
  );
}
