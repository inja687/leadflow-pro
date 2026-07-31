import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { WORKFLOW_STEPS } from "./constants";
import { fadeUp, staggerContainer } from "./motion";

export default function WorkflowSection() {
  return (
    <section id="workflow" className="bg-slate-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Workflow
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From lead to revenue in four steps
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            A streamlined pipeline that mirrors how great sales teams actually work —
            no bloated features, no steep learning curve.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div
            className="absolute top-12 hidden h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent lg:block lg:w-[calc(100%-8rem)] lg:left-16"
            aria-hidden="true"
          />

          {WORKFLOW_STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              variants={fadeUp}
              custom={i}
              className="group relative"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-violet-500/10">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-display text-3xl font-bold text-violet-500/40">
                    {step.step}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-violet-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-display text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
