import { PageMeta } from "../components/layout/PageMeta";
import { ButtonLink } from "../components/ui/button";

export function NotFoundPage() {
  return (
    <>
      <PageMeta title="Page not found" description="The page you requested does not exist." />
      <section className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-caption font-medium text-primary-hover">404</p>
        <h1 className="mt-2 text-heading font-semibold">Page not found</h1>
        <p className="mt-2 max-w-md text-body text-text-muted">
          This page doesn't exist. Head back to the homepage or download the desktop app.
        </p>
        <div className="mt-8 flex gap-3">
          <ButtonLink to="/">Go home</ButtonLink>
          <ButtonLink to="/download" variant="secondary">
            Download
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
