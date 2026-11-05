import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function PrescriptionSidebarShell({
  titleId,
  title,
  description,
  closeLabel,
  className = "max-w-xl",
  onClose,
  onSubmit,
  isSaving = false,
  footer,
  children,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    const animation = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? dialog.animate(
          [{ transform: "translateX(100%)" }, { transform: "translateX(0)" }],
          { duration: 220, easing: "ease-out" }
        )
      : null;

    return () => {
      animation?.cancel();
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const Body = onSubmit ? "form" : "div";

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-busy={isSaving || undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (!isSaving) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose();
      }}
      className={`fixed inset-y-0 left-auto right-0 m-0 ml-auto h-dvh max-h-none w-full overflow-hidden border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 sm:rounded-l-2xl ${className}`}
    >
      <Body
        className="flex h-full min-h-0 flex-col"
        onSubmit={onSubmit ? (event) => {
          if (isSaving) event.preventDefault();
          else onSubmit(event);
        } : undefined}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
            {description && <p className="mt-0.5 break-words text-xs text-slate-500" dir="auto">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label={closeLabel}
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-slate-50 p-5 sm:p-6">
          {children}
        </div>
        {footer && (
          <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </Body>
    </dialog>
  );
}
