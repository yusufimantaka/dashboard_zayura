"use client";

import { motion, useMotionValue, useSpring, useTransform, HTMLMotionProps } from "framer-motion";
import React, { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
  noBackground?: boolean;
}

export const cardContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

export const cardItemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 25
    }
  },
} as const;

export function AnimatedCard({ children, className, enableTilt = true, noBackground = false, ...props }: AnimatedCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 50, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 50, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      variants={cardItemVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ 
        scale: 1.02,
        z: 20,
        transition: { type: "spring", stiffness: 200, damping: 25 }
      }}
      className={cn("perspective-1000 h-full", className)}
      {...props}
    >
      <div className={cn(
        "h-full w-full backdrop-blur-md border border-border/40 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative group flex flex-col",
        !noBackground && "bg-card/40"
      )}>
        {/* Subtle inner glow for glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30 pointer-events-none z-10" />
        <div className="relative z-0 h-full flex flex-col">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

