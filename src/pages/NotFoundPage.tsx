import { Link } from 'react-router-dom';
import { PageContainer, SEO } from '@/components';
import { APP_NAME, ROUTES } from '@/constants';

export default function NotFoundPage() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist."
      />

      <PageContainer>
        <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
          <p className="text-8xl font-bold text-accent" aria-hidden="true">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold text-text-primary sm:text-3xl">
            Page Not Found
          </h1>
          <p className="mt-3 max-w-md text-text-secondary">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            to={ROUTES.HOME}
            className="mt-8 rounded-lg gradient-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-900/30"
          >
            Back to {APP_NAME}
          </Link>
        </div>
      </PageContainer>
    </>
  );
}
