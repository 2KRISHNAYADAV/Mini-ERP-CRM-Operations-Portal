import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Optional element rendered to the right of the title (e.g., a Download PDF button) */
  headerAction?: React.ReactNode;
  /** Optional footer — rendered outside the scrollable body, pinned to bottom */
  footer?: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md', headerAction, footer }: ModalProps) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthMap = { sm: '400px', md: '560px', lg: '720px' };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: widthMap[size] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — visible on mobile only */}
        <div className="modal-drag-handle" aria-hidden="true" />

        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {headerAction}
            <button type="button" className="modal-close" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">{children}</div>

        {/* Pinned footer — outside the scrollable body */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
