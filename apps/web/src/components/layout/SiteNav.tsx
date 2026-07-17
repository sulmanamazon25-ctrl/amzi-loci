import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "../../lib/site";
import { ButtonLink } from "../ui/button";
import { cn } from "../../lib/utils";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-medium text-text">
          <span className="h-7 w-7 rounded-md bg-primary" />
          Amzi Loci
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "rounded-input px-3 py-2 text-body transition-colors",
                  isActive ? "bg-primary/10 text-text" : "text-text-muted hover:text-text",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink to="/download" variant="secondary" size="sm">
            Download
          </ButtonLink>
          <ButtonLink to="/pricing" size="sm">
            Start trial
          </ButtonLink>
        </div>

        <button
          type="button"
          className="rounded-input p-2 text-text-muted md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className="rounded-input px-3 py-2 text-body text-text-muted hover:bg-card hover:text-text"
              >
                {label}
              </NavLink>
            ))}
            <ButtonLink to="/pricing" className="mt-3 w-full" onClick={() => setOpen(false)}>
              Start trial
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
