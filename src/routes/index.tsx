import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { LoadingSkeleton } from '@/components';
import { ROUTES } from '@/constants';

const HomePage = lazy(() => import('@/pages/HomePage'));
const DetailPage = lazy(() => import('@/pages/DetailPage'));
const AdvancedSearchPage = lazy(() => import('@/pages/AdvancedSearchPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <LoadingSkeleton count={3} />
    </div>
  );
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.HOME} replace />,
      },
      {
        path: 'home',
        element: withSuspense(HomePage),
      },
      {
        path: 'detail/:uuid',
        element: withSuspense(DetailPage),
      },
      {
        path: 'advanced-search',
        element: withSuspense(AdvancedSearchPage),
      },
      {
        path: '*',
        element: withSuspense(NotFoundPage),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
