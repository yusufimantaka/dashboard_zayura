"use client";

import { useEffect } from "react";
import { useMotionValue, motion, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface CountUpProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
  className?: string;
}

export function CountUp({ value, duration = 1.2, formatter = (v) => Math.floor(v).toLocaleString(), className }: CountUpProps) {
  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, (latest) => formatter(latest));

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: duration,
      ease: [0.16, 1, 0.3, 1], // Custom out-expo for snappy end
    });
    return () => controls.stop();
  }, [value, motionValue, duration]);

  return <motion.span className={cn("tabular-nums", className)}>{displayValue}</motion.span>;
}

