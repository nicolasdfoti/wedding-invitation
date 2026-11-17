import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { X } from 'lucide-react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Modal accesible: bottom-sheet en mobile, centrado desde sm. Esc cierra,
// el foco queda atrapado adentro y vuelve al botón que lo abrió al cerrar.
export default function Modal({ open, onClose, title, children }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current;
      const target = panel?.querySelector('[data-autofocus]') ?? panel?.querySelector(FOCUSABLE) ?? panel;
      target?.focus();
    });

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      const panel = panelRef.current;
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const inside = panel.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          key="modal"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} aria-hidden="true" />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="relative w-full sm:max-w-lg max-h-[90vh] max-h-[90dvh] overflow-y-auto overscroll-contain bg-white rounded-t-[2rem] sm:rounded-3xl shadow-soft px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-8 outline-none"
            initial={{ y: 48 }}
            animate={{ y: 0 }}
            exit={{ y: 48 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="sm:hidden mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" aria-hidden="true" />
            <div className="flex items-start justify-between gap-4 mb-5">
              <h2 id={titleId} className="font-title text-3xl leading-tight text-gray-700">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 -mr-2 -mt-1 inline-flex items-center justify-center min-h-11 min-w-11 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            {children}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
