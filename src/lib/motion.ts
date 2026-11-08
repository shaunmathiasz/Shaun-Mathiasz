/** Shared progressive motion; content remains readable without it. */
export const motionTokens = {
  duration: { micro: 0.2, reveal: 0.58, section: 0.8 },
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  distance: { reveal: 16, parallax: 8 },
} as const;
