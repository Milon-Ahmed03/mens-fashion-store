import { useState } from 'react';

export function ConfirmDialog({ open, title = 'Are you sure?', message, confirmText = 'Yes, continue', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onMouseDown={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-danger btn-sm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ব্যবহার:  const { ask, dialog } = useConfirm();   ask('Delete this?', () => deleteIt());   আর JSX-এ {dialog} বসান
export function useConfirm() {
  const [state, setState] = useState(null);
  const ask = (opts, onYes) => setState({ ...(typeof opts === 'string' ? { message: opts } : opts), onYes });
  const dialog = (
    <ConfirmDialog
      open={!!state}
      title={state?.title}
      message={state?.message}
      confirmText={state?.confirmText}
      onCancel={() => setState(null)}
      onConfirm={() => {
        const fn = state.onYes;
        setState(null);
        fn();
      }}
    />
  );
  return { ask, dialog };
}
