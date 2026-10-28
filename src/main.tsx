import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ExpeditionPageTA } from '@/components/ExpeditionPageTA';
import '@/styles.css';

const container = document.getElementById('root');
if (container) createRoot(container).render(<StrictMode><ExpeditionPageTA /></StrictMode>);
