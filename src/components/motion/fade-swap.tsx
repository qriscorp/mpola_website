"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Cross-fades between a loading skeleton and real content instead of
 * popping straight from one to the other. `loadingKey` should change
 * whenever the underlying data set changes (e.g. a page number), so the
 * fade replays for genuinely new content.
 */
export function FadeSwap({
  loading,
  skeleton,
  loadingKey = "content",
  children,
}: {
  loading: boolean;
  skeleton: React.ReactNode;
  loadingKey?: string | number;
  children: React.ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <>{loading ? skeleton : children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key={loadingKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
