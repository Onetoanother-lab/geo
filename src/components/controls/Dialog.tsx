import { useEffect, useRef, type ReactNode } from 'react';
import { IconClose } from './icons';

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  className?: string;
  children: ReactNode;
};

/**
 * Native <dialog> (modal): built-in focus containment, Escape closes, focus
 * returns to the opener. Escape never traps the user.
 */
export function Dialog({ open, onClose, label, className, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
    } else if (!open && d.open) {
      if (typeof d.close === 'function') d.close();
      else d.removeAttribute('open');
      if (opener.current instanceof HTMLElement) opener.current.focus({ preventScroll: true });
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`dialog ${className ?? ''}`}
      aria-label={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="dialog-inner">
        <button type="button" className="dialog-close" onClick={onClose} aria-label="Yopish (Esc)">
          <IconClose size={22} />
        </button>
        {children}
      </div>
    </dialog>
  );
}
