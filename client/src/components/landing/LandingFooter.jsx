import { Link } from "react-router-dom";

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
  { label: "Team Login", to: "/login" },
  { label: "Contact", href: "#contact" },
];

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                LF
              </div>
              <span className="font-display text-lg font-bold text-white">LeadFlow Pro</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500">
              The modern CRM built for sales teams who move fast and close more deals.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-8 gap-y-3 sm:justify-end">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link
                      to={link.to}
                      className="text-sm font-medium text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm font-medium text-slate-400 transition-all duration-200 hover:text-white hover:underline hover:underline-offset-4 hover:decoration-violet-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/5 pt-8 text-center sm:mt-12 sm:gap-4">
          <div className="sr-only">
            <h2 id="privacy">Privacy Policy</h2>
            <h2 id="terms">Terms of Service</h2>
          </div>
          <p className="text-sm text-slate-500">© 2026 LeadFlow Pro</p>
          <p className="text-sm text-slate-500">
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-400 transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm"
            >
              Built for Digital Heroes Training Task
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
