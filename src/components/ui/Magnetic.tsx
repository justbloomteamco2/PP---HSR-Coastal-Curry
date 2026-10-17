import { motion, useReducedMotion, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";

type MagneticProps = {
  children: ReactNode;
  strength?: number;
};

/** Adapted from the 21st.dev Magnetic Button; preserves reduced-motion preference. */
export function Magnetic({ children, strength = 0.12 }: MagneticProps) {
  const reducedMotion = useReducedMotion();
  const x = useSpring(0, { stiffness: 240, damping: 22, mass: 0.35 });
  const y = useSpring(0, { stiffness: 240, damping: 22, mass: 0.35 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (bounds.left + bounds.width / 2)) * strength);
    y.set((event.clientY - (bounds.top + bounds.height / 2)) * strength);
  };

  return (
    <motion.div
      className="magnetic"
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      onPointerMove={handlePointerMove}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
}
