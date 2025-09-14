export const formatKcal = (value: number): string => `${Math.round(value)} kcal`;

export const formatGrams = (value: number, digits = 1): string => {
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  return `${rounded}${digits === 0 ? '' : ''}g`;
};

export const formatPercent = (value: number, digits = 0): string =>
  `${value.toFixed(digits)}%`;

export const clampPercent = (value: number): number => Math.min(Math.max(value, 0), 100);

export const smallNumber = (value: number, digits = 1): string => value.toFixed(digits);

