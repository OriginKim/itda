"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { fadeInTransition } from "@/lib/motion";

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...fadeInTransition, delay }}
    >
      {children}
    </motion.div>
  );
}
