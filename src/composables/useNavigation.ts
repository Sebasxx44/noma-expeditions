import { useState } from 'react';
export const useNavigation = () => {
  const [open, setOpen] = useState(false);
  return { open, toggle: () => setOpen((value) => !value), close: () => setOpen(false) };
};
