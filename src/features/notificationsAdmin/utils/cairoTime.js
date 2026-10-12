// const CAIRO_TZ = "Africa/Cairo";

// // بيرجّع offset القاهرة عند لحظة معينة، مثلاً "+03:00"
// const getCairoOffset = (date) => {
//   const part = new Intl.DateTimeFormat("en-US", {
//     timeZone: CAIRO_TZ,
//     timeZoneName: "longOffset",
//   })
//     .formatToParts(date)
//     .find((p) => p.type === "timeZoneName").value; // "GMT+03:00"

//   return part === "GMT" ? "+00:00" : part.replace("GMT", "");
// };

// const offsetToMinutes = (offset) => {
//   const sign = offset[0] === "-" ? -1 : 1;
//   const [h, m] = offset.slice(1).split(":").map(Number);
//   return sign * (h * 60 + m);
// };

// // "2026-10-12T11:56" (وقت القاهرة) -> "2026-10-12T11:56:00+03:00"
// export const toCairoIso = (local) => {
//   const [d, t] = local.split("T");
//   const [y, mo, day] = d.split("-").map(Number);
//   const [h, mi] = t.split(":").map(Number);

//   const asUtc = Date.UTC(y, mo - 1, day, h, mi);


//   let offset = getCairoOffset(new Date(asUtc));
//   const instant = new Date(asUtc - offsetToMinutes(offset) * 60000);
//   offset = getCairoOffset(instant);

//   return `${local}:00${offset}`;
// };

// export const getCairoToday = () =>
//   new Intl.DateTimeFormat("en-CA", {
//     timeZone: CAIRO_TZ,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }).format(new Date());

// export const getCairoClock = () =>
//   new Date().toLocaleTimeString("en-US", {
//     timeZone: CAIRO_TZ,
//     hour: "2-digit",
//     minute: "2-digit",
//   });