import { useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  children?: ReactNode;
  confirmDisabled?: boolean;
}
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  children,
  confirmDisabled = false,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={handleConfirm}
            disabled={loading || confirmDisabled}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </Button>
        </>
      }
    >
      {description && (
        <div className="flex gap-3">
          {variant === 'danger' && (
            <AlertTriangle className="mt-0.5 shrink-0 text-pv-danger" size={20} />
          )}
          <p className="text-sm text-pv-gray">{description}</p>
        </div>
      )}
      {children}
    </Modal>
  );
}
