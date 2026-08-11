import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  isDestructive = false,
  loading = false,
}: ConfirmDialogProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div style={{ textAlign: 'center', padding: '0.5rem 0 1.5rem' }}>
      <AlertTriangle size={40} color={isDestructive ? '#ef4444' : '#f59e0b'} style={{ marginBottom: '1rem' }} />
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{message}</p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button className="btn btn-outline" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button
          className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);
