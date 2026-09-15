// features/invoices/utils/timelineMapper.js

import { formatDateTimeShort } from "../../../utils/formatDate";


const STATUS_CONFIG = {
  pending: { icon: "file", tagColor: "amber" },
  "قيد الانتظار": { icon: "file", tagColor: "amber" },

  used: { icon: "check", tagColor: "green" },
  "مستخدم": { icon: "check", tagColor: "green" },

  paid: { icon: "check", tagColor: "blue" },
  "مدفوع": { icon: "check", tagColor: "blue" },
};

export function mapInvoiceToStep(item) {
  const key = item.status?.trim().toLowerCase();
  const config = STATUS_CONFIG[key] || { icon: "file", tagColor: "blue" };

  return {
    title: item.name,
    date: formatDateTimeShort(item.date),
    by: item.name,
    icon: config.icon,
    tag: item.status,
    tagColor: config.tagColor,
  };
}