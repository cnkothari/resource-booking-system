import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  loading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) => (
  <Modal
    open={open}
    title={title}
    onClose={onClose}
    footer={
      <>
        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Working…' : confirmLabel}
        </button>
      </>
    }
  >
    <p className="text-sm text-slate-600">{message}</p>
    {error && <p className="field-error mt-3">{error}</p>}
  </Modal>
);

export default ConfirmDialog;
