import { useEffect, useRef } from 'react';
export const useDialog = (open: boolean, onClose: () => void) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    const cancel = (event: Event) => { event.preventDefault(); onClose(); };
    dialog.addEventListener('cancel', cancel);
    if (open) document.body.style.overflow = 'hidden';
    return () => { dialog.removeEventListener('cancel', cancel); document.body.style.overflow = ''; };
  }, [open, onClose]);
  return { dialogRef };
};
