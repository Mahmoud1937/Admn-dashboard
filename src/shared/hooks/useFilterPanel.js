import { useEffect, useRef, useState } from "react";

/**
 * Shared state + behaviour for the anchored filter panels that open under a
 * toolbar trigger. Handles: open/close state, committed vs draft filters,
 * apply/clear/close handlers, and dismiss-on-outside-click (panel + trigger).
 *
 * @param {{ emptyFilters: object }} options - the "no filters applied" shape
 */
export default function useFilterPanel({ emptyFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [draft, setDraft] = useState(emptyFilters);

  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  const open = () => {
    setDraft(filters);
    setIsOpen(true);
  };

  const toggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setDraft(filters);
      setIsOpen(true);
    }
  };

  const close = () => setIsOpen(false);

  const apply = () => {
    setFilters(draft);
    setIsOpen(false);
  };

  const clear = () => {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      const clickedPanel = panelRef.current?.contains(e.target) ?? false;
      const clickedTrigger = triggerRef.current?.contains(e.target) ?? false;
      if (!clickedPanel && !clickedTrigger) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return {
    isOpen,
    filters,
    draft,
    setDraft,
    panelRef,
    triggerRef,
    open,
    toggle,
    close,
    apply,
    clear,
  };
}