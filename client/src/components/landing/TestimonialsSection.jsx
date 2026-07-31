import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "./constants";
import { fadeUp, staggerContainer } from "./motion";

export default function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Testimonials
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Loved by sales leaders
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Don't take our word for it — hear from teams closing more deals with LeadFlow.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid gap-6 lg:grid-cols-3"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.name}
              variants={fadeUp}
              custom={i}
              className="relative flex flex-col rounded-2xl border border-slate-200/80 bg-white/70 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/30 hover:border-violet-200/60"
            >
              <Quote
                className="absolute right-6 top-6 h-8 w-8 text-violet-100"
                aria-hidden="true"
              />
              <div className="mb-4 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-6">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white"
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div>
                  <cite className="not-italic">
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">
                      {t.role}, {t.company}
                    </p>
                  </cite>
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
