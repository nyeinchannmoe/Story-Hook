import { Outlet } from 'react-router-dom';
import { Footer, Header, ScrollToTop } from '@/components';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <ScrollToTop />
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
