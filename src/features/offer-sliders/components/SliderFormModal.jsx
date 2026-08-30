import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildSliderSchema, validateImages } from "../schema/sliderSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";
import ProviderSelectDropdown from "./ProviderSelectDropdown";
import ImageUploadField from "../../../shared/components/ImageUploadField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const SliderFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSaving,
  serverErrors,
  clearServerErrors,
  sliderToEdit = null,
}) => {
  const isEditMode = !!sliderToEdit;

  const [enImageFile, setEnImageFile] = useState(null);
  const [arImageFile, setArImageFile] = useState(null);
  const [imageErrors, setImageErrors] = useState(null);

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buildSliderSchema(isEditMode)),
    mode: "onChange",
    defaultValues: {
      providerId: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnImageFile(null);
    setArImageFile(null);
    setImageErrors(null);

    reset(
      isEditMode
        ? {
            providerId: String(sliderToEdit.providerId),
          }
        : {
            providerId: "",
          }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEditMode, sliderToEdit]);

  useEffect(() => {
    if (serverErrors) {
      applyServerErrors(serverErrors, setError);
    }
  }, [serverErrors, setError]);

  if (!isOpen) return null;

  const handleClose = () => {
    setEnImageFile(null);
    setArImageFile(null);
    setImageErrors(null);
    reset();
    clearServerErrors();
    onClose();
  };

  const handleFormSubmit = (values) => {
    const imgErrors = validateImages(
      enImageFile,
      arImageFile,
      isEditMode
    );

    if (imgErrors) {
      setImageErrors(imgErrors);
      return;
    }

    setImageErrors(null);

    if (isEditMode) {
      onSubmit({
        id: sliderToEdit.id,
        providerId: values.providerId,
        isUpdatedImageEn: !!enImageFile,
        isUpdatedImageAr: !!arImageFile,
        enImageFile,
        arImageFile,
      });
    } else {
      onSubmit({
        providerId: values.providerId,
        enImageFile,
        arImageFile,
      });
    }
  };

  const providerLabel =
    sliderToEdit?.providerArName && sliderToEdit?.providerEnName
      ? `${sliderToEdit.providerArName} - ${sliderToEdit.providerEnName}`
      : sliderToEdit?.providerArName ||
        sliderToEdit?.providerEnName ||
        "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl scroll-form sm:max-w-2xl sm:max-h-[85vh]">
<div className="mb-4 flex items-center justify-between">
  <h2 className="text-lg font-semibold text-gray-900">
    {isEditMode ? "Edit Slider" : "Add Slider"}
  </h2>

  <button
    type="button"
    onClick={handleClose}
    disabled={isSaving}
    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
    aria-label="Close"
  >
    <FontAwesomeIcon icon={faXmark} />
  </button>
</div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          {/* Provider */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Provider
            </label>

          <Controller
  name="providerId"
  control={control}
  render={({ field }) => (
    <ProviderSelectDropdown
      value={field.value}
      onChange={(val) => field.onChange(val != null ? String(val) : "")}
      initialLabel={providerLabel}
      error={errors.providerId?.message}
      disabled={isSaving}
    />
  )}
/>

  
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* English Image */}
            <div>
              <ImageUploadField
                label="English Image"
                preview={
                  enImageFile
                    ? URL.createObjectURL(enImageFile)
                    : isEditMode
                      ? sliderToEdit.enImageUrl
                      : null
                }
                onImageChange={(e) => {
                  setEnImageFile(e.target.files?.[0] || null);
                  setImageErrors((prev) =>
                    prev
                      ? {
                          ...prev,
                          enImageFile: undefined,
                        }
                      : null
                  );
                }}
                disabled={isSaving}
              />

              {imageErrors?.enImageFile && (
                <p className="text-xs text-red-500 text-center">
                  {imageErrors.enImageFile}
                </p>
              )}
            </div>

            {/* Arabic Image */}
            <div>
              <ImageUploadField
                label="Arabic Image"
                preview={
                  arImageFile
                    ? URL.createObjectURL(arImageFile)
                    : isEditMode
                      ? sliderToEdit.arImageUrl
                      : null
                }
                onImageChange={(e) => {
                  setArImageFile(e.target.files?.[0] || null);
                  setImageErrors((prev) =>
                    prev
                      ? {
                          ...prev,
                          arImageFile: undefined,
                        }
                      : null
                  );
                }}
                disabled={isSaving}
              />

              {imageErrors?.arImageFile && (
                <p className="text-xs text-red-500 text-center">
                  {imageErrors.arImageFile}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {isSaving
                ? "Saving..."
                : isEditMode
                  ? "Save Changes"
                  : "Add Slider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SliderFormModal;