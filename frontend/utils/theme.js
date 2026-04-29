// ── Design tokens — exact match with web globals.css ──────────────────────

export const C = {
  // Surfaces
  background:   "#f8f9fa",
  surfaceLow:   "#f3f4f5",
  surfaceHigh:  "#e6e8ea",
  card:         "#ffffff",

  // Primary (dark navy)
  primary:      "#000613",
  onPrimary:    "#ffffff",

  // Secondary (olive / lime)
  secondary:    "#426900",
  secondaryContainer: "#ADFF2F",

  // Text
  onSurface:    "#191c1d",
  onSurfaceVar: "#43474e",
  outline:      "#75777e",
  outlineVar:   "rgba(196,198,207,0.4)",

  // Semantic
  error:        "#ba1a1a",
  success:      "#16a34a",

  // Status colours
  blue:         "#2563EB",
  blueBg:       "#EFF6FF",
  yellow:       "#D97706",
  yellowBg:     "#FFFBEB",
  green:        "#16A34A",
  greenBg:      "#F0FDF4",
  red:          "#DC2626",
  redBg:        "#FEF2F2",
  orange:       "#F97316",
  orangeBg:     "#FFF7ED",
};

// Typography scale
export const T = {
  tagline:  { fontSize: 10, fontWeight: "900", letterSpacing: 2,   color: C.onSurfaceVar },
  heading:  { fontSize: 32, fontWeight: "900", letterSpacing: -1,  color: C.primary      },
  subhead:  { fontSize: 22, fontWeight: "900", letterSpacing: -0.5,color: C.primary      },
  label:    { fontSize: 9,  fontWeight: "900", letterSpacing: 1,   color: C.onSurfaceVar },
  body:     { fontSize: 14, fontWeight: "500",                     color: C.onSurfaceVar },
  bodyBold: { fontSize: 14, fontWeight: "700",                     color: C.onSurface    },
  caption:  { fontSize: 11, fontWeight: "700",                     color: C.onSurfaceVar },
  mono:     { fontSize: 12, fontWeight: "900", fontVariant: ["tabular-nums"], color: C.primary },
};

// Shared shape
export const R = {
  card:   24,
  chip:   20,
  input:  14,
  btn:    28,
  badge:  8,
};

// Shadow
export const shadow = {
  shadowColor: "#000613",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  elevation: 3,
};
