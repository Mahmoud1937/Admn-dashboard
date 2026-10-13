export const formatPrice = (value) => {
  if (value == null || value === "" || !Number.isFinite(Number(value))) {
    return "-";
  }
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getDiscountPercent = (totalDiscount) => {
  const discount = Number(totalDiscount);
  if (!Number.isFinite(discount) || discount <= 0) return null;
  return discount;
};

export const hasDiscount = (totalDiscount) => Number(totalDiscount) > 0;
