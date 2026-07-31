import { motion } from "framer-motion";
import {
  Target,
  BarChart3,
  Bell,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import { FEATURES } from "./constants";
import { fadeUp, staggerContainer } from "./motion";

const ICON_MAP = { Target, BarChart3, Bell, Shield, Users, Zap };

export default function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden py-24 sm:py-32">
      <AnimatedBackground variant="light" />
      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
            Features
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything your team needs to win
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            From first contact to signed contract — LeadFlow Pro covers every step
            of your revenue pipeline with tools your team will actually use.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon];
            return (
              <motion.article
                key={feature.title}
                variants={fadeUp}
                custom={i}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 p-7 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:border-violet-200/80 hover:shadow-xl hover:shadow-violet-100/40"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-100`}
                  aria-hidden="true"
                />
                <div className="relative">
                  <div className="mb-5 inline-flex rounded-xl border border-violet-100 bg-violet-50 p-3 text-violet-600 transition-all duration-200 group-hover:border-violet-200 group-hover:bg-violet-100 group-hover:shadow-md group-hover:shadow-violet-100/50">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {feature.desc}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
