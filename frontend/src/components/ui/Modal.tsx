import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[1] w-full max-w-md max-h-[min(90dvh,40rem)] overflow-y-auto rounded-xl border border-white/15 bg-white/[0.04] p-4 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/[0.07] backdrop-blur-sm dark:bg-card-dashboard/95"
      >
        <h2
          id={titleId}
          className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-piq-accent"
        >
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
