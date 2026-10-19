import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function FormModalShell({
  title,
  onClose,
  onSubmit,
  className = "max-w-xl",  
  formClassName = "",
  native = false,
  titleId,
  description,
  closeLabel,
  isSaving = false,
  children,
}) {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!native) return;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [native]);

  const Container = native ? "dialog" : "div";
  const Heading = native ? "h2" : "h3";
  const Body = native && !onSubmit ? "div" : "form";
  return (
    <Container
      ref={native ? dialogRef : undefined}
      aria-labelledby={native ? titleId : undefined}
      aria-modal={native ? "true" : undefined}
      onCancel={native ? (event) => {
        event.preventDefault();
        if (!isSaving) onClose();
      } : undefined}
      onClick={native ? (event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      } : undefined}
      className={native
        ? `m-auto w-[calc(100%_-_2rem)] overflow-hidden rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 ${className}`
        : "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"}
    >
      <div className={native ? "flex max-h-[85vh] flex-col" : `w-full rounded-xl bg-white p-6 shadow-xl ${className}`}>
        <div className={native ? "flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6" : "mb-5 flex items-center justify-between"}>
          {native || description ? <div>
            <Heading id={titleId} className="text-lg font-semibold text-slate-900">{title}</Heading>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div> : <Heading id={titleId} className="text-lg font-semibold text-slate-900">{title}</Heading>}
          <button
            type={native ? "button" : undefined}
            onClick={onClose}
            disabled={isSaving}
            aria-label={closeLabel}
            className={native
              ? "rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
              : "rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <Body onSubmit={onSubmit} className={native ? `min-h-0 space-y-5 overflow-y-auto p-5 sm:p-6 ${formClassName}` : formClassName}>
          {children}
        </Body>
      </div>
    </Container>
  );
}
