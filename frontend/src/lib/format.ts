const formatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export const formatNumber = (value?: number) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return formatter.format(value);
};

export const formatCurrency = (value?: number) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value?: number) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(2)}%`;
};

export const formatMultiple = (value?: number) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(2)}x`;
};
