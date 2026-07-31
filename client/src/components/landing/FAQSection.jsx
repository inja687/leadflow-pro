import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "./constants";
import { fadeUp } from "./motion";

function FAQItem({ item, isOpen, onToggle, index }) {
  const id = `faq-${index}`;
  return (
    <div className="border-b border-slate-200/80 last:border-0">
      <button
        type="button"
        id={`${id}-button`}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 px-2 text-left transition-all duration-200 hover:text-violet-600 hover:bg-violet-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 rounded-lg"
      >
        <span className="font-display text-base font-semibold text-slate-900 sm:text-lg">
          {item.q}
        </span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-violet-500" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-slate-500 sm:text-base">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            FAQ
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="mt-12 rounded-2xl border border-slate-200/80 bg-white/80 px-6 shadow-sm backdrop-blur-sm sm:px-8"
        >
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={item.q}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
