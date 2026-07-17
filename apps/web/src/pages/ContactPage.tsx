import { Mail } from "lucide-react";
import { CONTACT_EMAIL } from "../lib/site";
import { PageMeta } from "../components/layout/PageMeta";
import { Hero } from "../components/marketing/Hero";
import { Button } from "../components/ui/button";
import { Panel } from "../components/ui/card";

export function ContactPage() {
  return (
    <>
      <PageMeta
        title="Contact"
        description="Get in touch with the Amzi Loci team — support, partnerships, and agency inquiries."
        path="/contact"
      />
      <Hero
        title="Get in touch"
        subtitle="Questions about the desktop app, agency plans, or partnerships? We'd love to hear from you."
      />

      <section className="container-page max-w-xl pb-20">
        <Panel>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 text-section font-medium text-primary-hover hover:underline"
          >
            <Mail size={18} />
            {CONTACT_EMAIL}
          </a>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const subject = encodeURIComponent(String(fd.get("subject") ?? "Amzi Loci inquiry"));
              const body = encodeURIComponent(String(fd.get("message") ?? ""));
              window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
            }}
          >
            <div>
              <label className="mb-1 block text-caption text-text-muted">Name</label>
              <input
                name="name"
                required
                className="w-full rounded-input border border-border bg-card px-3 py-2 text-body"
              />
            </div>
            <div>
              <label className="mb-1 block text-caption text-text-muted">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-input border border-border bg-card px-3 py-2 text-body"
              />
            </div>
            <div>
              <label className="mb-1 block text-caption text-text-muted">Subject</label>
              <input
                name="subject"
                className="w-full rounded-input border border-border bg-card px-3 py-2 text-body"
              />
            </div>
            <div>
              <label className="mb-1 block text-caption text-text-muted">Message</label>
              <textarea
                name="message"
                rows={5}
                required
                className="w-full rounded-input border border-border bg-card px-3 py-2 text-body"
              />
            </div>
            <Button type="submit">Open in email app</Button>
          </form>
          <p className="mt-4 text-caption text-text-muted">
            v1 uses your default mail client — no form backend yet.
          </p>
        </Panel>
      </section>
    </>
  );
}
