import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from '@/routes';
import { DocumentLanguage } from '@/i18n/DocumentLanguage';
import '@/i18n';
import '@/styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <DocumentLanguage />
      <AppRouter />
    </Suspense>
  </StrictMode>,
);
