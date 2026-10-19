import { z } from "zod";
import { optionalIdField } from "../../../shared/schema/validation";

const isCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const dateField = (label) => z.string()
  .min(1, `${label} is required`)
  .refine((value) => !value || isCalendarDate(value), "Enter a valid date");

const dateFields = {
  startAt: dateField("Start date"),
  endAt: dateField("End date"),
};

const validateDateRange = (schema) => schema.refine(
  ({ startAt, endAt }) => !isCalendarDate(startAt) || !isCalendarDate(endAt) || endAt >= startAt,
  { path: ["endAt"], message: "End date must be on or after the start date" }
);

export const providerRenewalSchema = validateDateRange(z.object({
  ...dateFields,
  brokerId: optionalIdField.unwrap().refine(
    (value) => value === null || value === ""
      || (Number.isInteger(Number(value)) && Number(value) > 0),
    "Select a valid broker"
  ),
}));

export const providerRenewalUpdateSchema = validateDateRange(z.object(dateFields));
