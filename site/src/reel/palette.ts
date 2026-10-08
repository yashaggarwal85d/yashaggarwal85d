export const C = {
  espresso: '#17100c',
  roast: '#2a1d16',
  cocoa: '#3b2a21',
  mocha: '#5a4032',
  taupe: '#8b7766',
  latte: '#c8ac8c',
  crema: '#e9d9bf',
  oat: '#f3eadb',
  foam: '#fbf7ef',
  caramel: '#d49a57',
  cinnamon: '#b8612f',
  cherry: '#8e2f2a',
  void: '#0d0806',
} as const;

export const F = {
  display: "'Fraunces', ui-serif, Georgia, serif",
  sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

/** Gradient-filled text style. */
export const gradText = (stops = `${C.crema}, ${C.caramel} 40%, ${C.cinnamon} 75%, ${C.cherry}`) => ({
  background: `linear-gradient(100deg, ${stops})`,
  WebkitBackgroundClip: 'text' as const,
  backgroundClip: 'text' as const,
  color: 'transparent',
});
