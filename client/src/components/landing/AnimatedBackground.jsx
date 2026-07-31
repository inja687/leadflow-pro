import { motion } from "framer-motion";
import { useMotionSafe } from "./motion";

export default function AnimatedBackground({ variant = "hero" }) {
  const motionEnabled = useMotionSafe();

  if (variant === "light") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(59,130,246,0.06),transparent)]" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.35),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(99,102,241,0.2),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_80%,rgba(6,182,212,0.12),transparent)]" />

      {motionEnabled && (
        <>
          <motion.div
            className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]"
            animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-[100px]"
            animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 left-1/3 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[90px]"
            animate={{ x: [0, 25, 0], y: [0, -25, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}
