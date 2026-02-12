/**
 * Shared design constants - 8pt grid (Apple HIG)
 */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 20,
  pill: 26,
} as const;

export const TYPOGRAPHY = {
  title: 28,
  headline: 20,
  body: 16,
  subhead: 15,
  footnote: 13,
} as const;

export const COLORS = {
  primary: '#000000',
  secondary: 'rgba(0, 0, 0, 0.7)',
  tertiary: 'rgba(0, 0, 0, 0.5)',
  background: '#FFFFFF',
  avatarPlaceholder: '#E0E0E0',
} as const;
