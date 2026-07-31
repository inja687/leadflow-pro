import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { STATS } from "./constants";
import { fadeUp, staggerContainer } from "./motion";

function AnimatedStat({ value, suffix, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;

    const numericPart = parseFloat(value.replace(/[^0-9.]/g, ""));
    const isDecimal = value.includes(".");
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericPart * eased;
      setDisplay(isDecimal ? current.toFixed(1) : Math.round(current).toString());
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, value]);

  const prefix = value.startsWith("3") && suffix === "×" ? "" : value.match(/^[^\d]*/)?.[0] || "";
  const suffixDisplay = suffix || value.match(/[^\d.]+$/)?.[0] || "";

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-8 text-center shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-violet-100/50 hover:border-violet-200/60"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-indigo-500/0 transition-all group-hover:from-violet-500/[0.04] group-hover:to-indigo-500/[0.02]" />
      <p className="font-display relative text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          {prefix}
          {display}
          {suffixDisplay}
        </span>
      </p>
      <p className="relative mt-2 text-sm font-medium text-slate-500">{label}</p>
    </motion.div>
  );
}

export default function StatsSection() {
  return (
    <section aria-label="Key statistics" className="relative -mt-8 pb-20 sm:-mt-12">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
        >
          {STATS.map((stat) => (
            <AnimatedStat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
