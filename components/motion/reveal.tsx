"use client";

import { m, type HTMLMotionProps, type Variants } from "framer-motion";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

/** Fades and lifts its children into view once, when scrolled to. */
export function Reveal({
  delay = 0,
  y = 24,
  children,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return (
    <m.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease, delay }}
      {...props}
    >
      {children}
    </m.div>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

/** Parent that staggers any <StaggerItem> children as they enter the viewport. */
export function Stagger({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <m.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      {...props}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <m.div variants={staggerItem} {...props}>
      {children}
    </m.div>
  );
}
