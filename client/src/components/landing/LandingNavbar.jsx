import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "./constants";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        aria-label="Main navigation"
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-5 py-3.5 transition-all duration-300 ${
          scrolled
            ? "border border-white/10 bg-slate-950/70 shadow-2xl shadow-violet-950/20 backdrop-blur-xl"
            : "border border-transparent bg-transparent"
        }`}
      >
        <Link to="/" className="group flex items-center gap-2.5" aria-label="LeadFlow Pro home">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-105">
            LF
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            LeadFlow Pro
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 hover:shadow-sm"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            Sign in
          </Link>
          <a
            href="#contact"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-white/10 transition-all duration-200 hover:bg-slate-100 hover:shadow-xl hover:shadow-white/15 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Get started
          </a>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <Link
                to="/login"
                className="block rounded-xl px-4 py-3 text-center text-sm font-medium text-slate-300 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <a
                href="#contact"
                className="block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900"
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
