const AMSTERDAM_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Amsterdam",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today's date as YYYY-MM-DD in the Europe/Amsterdam timezone. */
export function todayAmsterdam(now: Date = new Date()): string {
  return AMSTERDAM_DATE.format(now);
}
