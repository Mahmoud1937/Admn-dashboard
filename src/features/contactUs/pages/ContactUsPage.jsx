import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faEnvelope,
  faPen,
  faXmark,
  faFloppyDisk,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  faWhatsapp,
  faFacebook,
  faInstagram,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { useContactUsQuery } from "../hooks/useContactUsQuery";
import { useContactUsMutations } from "../hooks/useContactUsMutations";
import { contactUsSchema } from "../schema/contactUsSchema";
import { applyServerErrors } from "../../../shared/utils/applyServerErrors";

const defaultValues = {
  phoneNumber: "",
  email: "",
  whatsApp: "",
  faceBook: "",
  instagram: "",
  tikTok: "",
};

const PRIMARY_FIELDS = [
  { key: "phoneNumber", label: "Phone number", icon: faPhone, required: true },
  { key: "email", label: "Email", icon: faEnvelope, required: true, type: "email" },
  { key: "whatsApp", label: "WhatsApp", icon: faWhatsapp, required: true },
];

const SOCIAL_FIELDS = [
  { key: "faceBook", label: "Facebook", icon: faFacebook, required: false },
  { key: "instagram", label: "Instagram", icon: faInstagram, required: false },
  { key: "tikTok", label: "TikTok", icon: faTiktok, required: false },
];

export default function ContactUsPage() {
  const { contactUs, isLoading, isError, error } = useContactUsQuery();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactUsSchema),
    defaultValues,
  });

  useEffect(() => {
    if (contactUs) {
      reset({
        phoneNumber: contactUs.phoneNumber || "",
        email: contactUs.email || "",
        whatsApp: contactUs.whatsApp || "",
        faceBook: contactUs.faceBook || "",
        instagram: contactUs.instagram || "",
        tikTok: contactUs.tikTok || "",
      });
    }
  }, [contactUs, reset]);

  const closeEdit = () => {
    setIsEditing(false);
    clearServerErrors();
  };

  const { updateMutation, isSaving, serverErrors, clearServerErrors } = useContactUsMutations({
    onUpdateSuccess: closeEdit,
  });

  useEffect(() => {
    applyServerErrors(serverErrors, setError);
  }, [serverErrors, setError]);

  const onSubmit = (values) => {
    updateMutation.mutate(values);
  };

  const handleCancel = () => {
    if (contactUs) {
      reset({
        phoneNumber: contactUs.phoneNumber || "",
        email: contactUs.email || "",
        whatsApp: contactUs.whatsApp || "",
        faceBook: contactUs.faceBook || "",
        instagram: contactUs.instagram || "",
        tikTok: contactUs.tikTok || "",
      });
    }
    closeEdit();
  };

  if (isLoading) {
    return (
      <p className="p-8 text-center text-sm text-slate-400">
        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
        Loading contact information...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="p-8 text-center text-sm text-red-500">
        {error?.message || "Failed to load contact information."}
      </p>
    );
  }

  const hasFieldErrors = Object.keys(errors).length > 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-2xl">Contact Us</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-sm">
            Contact details and social links shown to your users.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <FontAwesomeIcon icon={faPen} />
            Edit
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="space-y-8 p-6">
          {hasFieldErrors && (
            <div className="text-sm text-red-500">
              Please fix the highlighted fields below.
            </div>
          )}

          <Section title="Contact information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PRIMARY_FIELDS.map((field) => (
                <FieldRow
                  key={field.key}
                  field={field}
                  isEditing={isEditing}
                  register={register}
                  error={errors[field.key]?.message}
                  value={contactUs?.[field.key]}
                />
              ))}
            </div>
          </Section>

          <Section title="Social media">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {SOCIAL_FIELDS.map((field) => (
                <FieldRow
                  key={field.key}
                  field={field}
                  isEditing={isEditing}
                  register={register}
                  error={errors[field.key]?.message}
                  value={contactUs?.[field.key]}
                />
              ))}
            </div>
          </Section>

          {contactUs?.updatedAt && !contactUs.updatedAt.startsWith("0001") && (
            <p className="text-xs text-slate-400">
              Last updated {new Date(contactUs.updatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {isEditing && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-800 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faXmark} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={isSaving ? faSpinner : faFloppyDisk} spin={isSaving} />
              Save changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldRow({ field, isEditing, register, error, value }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
        <FontAwesomeIcon icon={field.icon} className="w-4 text-slate-400" />
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
      </label>

      {isEditing ? (
        <>
          <input
            type={field.type || "text"}
            placeholder={field.label}
            {...register(field.key)}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-400/30 ${
              error ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-blue-400"
            }`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </>
      ) : (
        <p className="flex min-h-[2.25rem] items-center break-all rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-800">
          {value || <span className="text-slate-400">Not set</span>}
        </p>
      )}
    </div>
  );
}