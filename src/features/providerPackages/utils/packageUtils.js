export const formatPrice = (value) => {
  if (value == null || value === "" || !Number.isFinite(Number(value))) {
    return "-";
  }
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getDiscountPercent = (priceBefore, totalDiscount) => {
  const before = Number(priceBefore);
  const discount = Number(totalDiscount);
  if (!before || !discount || discount <= 0) return null;
  return Math.round((discount / before) * 100);
};

export const hasDiscount = (totalDiscount) => Number(totalDiscount) > 0;