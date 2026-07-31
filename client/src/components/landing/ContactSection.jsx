import { motion } from "framer-motion";
import { ArrowRight, Check, Send } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import { CONTACT_BENEFITS } from "./constants";
import { fadeUp } from "./motion";

export default function ContactSection({
  form,
  errors,
  loading,
  serverError,
  onChange,
  onSubmit,
}) {
  return (
    <section id="contact" className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
      <AnimatedBackground />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              Get started
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              Ready to grow your pipeline?
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              Fill in your details and one of our team members will reach out
              within one business day with a tailored walkthrough.
            </p>

            <ul className="mt-10 space-y-4">
              {CONTACT_BENEFITS.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-violet-950/30 backdrop-blur-xl">
              <div className="border-b border-white/10 px-8 py-6">
                <h3 className="font-display text-xl font-bold text-white">Get in touch</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Fields marked with <span className="text-rose-400">*</span> are required.
                </p>
              </div>

              <div className="p-8">
                {serverError && (
                  <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3.5 text-sm text-rose-200"
                  >
                    <span aria-hidden="true">⚠</span>
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={onSubmit} noValidate className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      label="Full Name"
                      name="name"
                      required
                      placeholder="John Smith"
                      value={form.name}
                      error={errors.name}
                      onChange={onChange}
                    />
                    <FormField
                      label="Work Email"
                      name="email"
                      type="email"
                      required
                      placeholder="john@company.com"
                      value={form.email}
                      error={errors.email}
                      onChange={onChange}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+1 555 000 1234"
                      value={form.phone}
                      error={errors.phone}
                      onChange={onChange}
                    />
                    <FormField
                      label="Company"
                      name="company"
                      placeholder="Acme Corp"
                      value={form.company}
                      onChange={onChange}
                      optional
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      How can we help?{" "}
                      <span className="text-slate-500">(optional)</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Tell us about your team size, current challenges, or anything else..."
                      value={form.message}
                      onChange={onChange}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-all duration-200 hover:border-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:shadow-violet-600/40 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span
                          className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                          aria-hidden="true"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Send my request
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
                    <Send className="h-3 w-3" aria-hidden="true" />
                    We respect your privacy. No spam, ever.
                  </p>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required,
  optional,
  placeholder,
  value,
  error,
  onChange,
}) {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-slate-300">
        {label}{" "}
        {required && <span className="text-rose-400">*</span>}
        {optional && <span className="text-slate-500">(optional)</span>}
      </label>
      <input
        id={inputId}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        required={required}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
          error
            ? "border-rose-500/50 bg-rose-500/10 focus:ring-rose-500/30"
            : "border-white/10 bg-white/5 hover:border-white/20 focus:border-violet-500/50 focus:ring-violet-500/30"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
