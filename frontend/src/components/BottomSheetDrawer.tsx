import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from './Icons';

type BottomSheetDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function BottomSheetDrawer({ isOpen, onClose, title, icon, children }: BottomSheetDrawerProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose} role="presentation">
      <div
        className="bottom-sheet-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="drawer-drag-handle" aria-hidden="true" />
        <header className="drawer-header">
          <div className="drawer-title-group">
            {icon && <span className="drawer-icon-mark" aria-hidden="true">{icon}</span>}
            <h3>{title}</h3>
          </div>
          <button
            className="drawer-close-btn"
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            title="Close"
          >
            <CloseIcon size={18} />
          </button>
        </header>
        <div className="drawer-content">{children}</div>
      </div>
    </div>
  );
}
