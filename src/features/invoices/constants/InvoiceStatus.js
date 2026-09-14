export const INVOICE_STATUS = {
  PAID: 1,
  PENDING: 2,
  CANCELED: 3,
  USED: 4,
};

export const INVOICE_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: INVOICE_STATUS.PAID, label: "Paid" },
  { value: INVOICE_STATUS.PENDING, label: "Pending" },
  { value: INVOICE_STATUS.CANCELED, label: "Canceled" },
  { value: INVOICE_STATUS.USED, label: "Used" },
];

export const invoiceStatusBadgeClass = (status) => {
  switch (Number(status)) {
    case INVOICE_STATUS.PAID:
      return "bg-green-100 text-green-700";
    case INVOICE_STATUS.PENDING:
      return "bg-yellow-100 text-yellow-700";
    case INVOICE_STATUS.CANCELED:
      return "bg-red-100 text-red-700";
    case INVOICE_STATUS.USED:
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};