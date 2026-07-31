import { motion } from "framer-motion";
import { TRUSTED_COMPANIES } from "./constants";
import { fadeUp } from "./motion";

export default function TrustedBySection() {
  return (
    <section aria-label="Trusted by companies" className="border-y border-slate-100 bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center text-sm font-medium text-slate-400"
        >
          Trusted by high-growth sales teams at
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {TRUSTED_COMPANIES.map((company) => (
            <span
              key={company}
              className="font-display text-lg font-semibold tracking-tight text-slate-300 transition-all duration-300 hover:text-violet-400 hover:scale-105"
            >
              {company}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
