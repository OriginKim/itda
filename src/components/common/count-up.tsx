"use client";

import { animate, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { countUpTransition } from "@/lib/motion";

export function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, countUpTransition);
    return controls.stop;
  }, [value, motionValue]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (spanRef.current) {
        spanRef.current.textContent = String(latest);
      }
    });
  }, [rounded]);

  return (
    <span ref={spanRef} className={className}>
      0
    </span>
  );
}
