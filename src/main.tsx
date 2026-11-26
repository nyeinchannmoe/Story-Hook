import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from '@/routes';
import { DocumentLanguage } from '@/i18n/DocumentLanguage';
import { PwaProvider } from '@/components/PwaProvider';
import { installImageProtection } from '@/utils/image';
import '@/i18n';
import '@/styles/index.css';

installImageProtection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <DocumentLanguage />
      <AppRouter />
      <PwaProvider />
    </Suspense>
  </StrictMode>,
);
