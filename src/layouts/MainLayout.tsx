import { Outlet } from 'react-router-dom';
import { Header, Footer } from '@/components';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
