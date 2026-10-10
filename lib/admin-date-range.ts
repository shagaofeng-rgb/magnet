export type AdminRangePreset = "today" | "week" | "month" | "90d" | "custom";

const dayInMs = 86_400_000;

function dayInShanghai(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

function addDays(day: string, amount: number) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + amount)).toISOString().slice(0, 10);
}

function validDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value ? null : value;
}

export function resolveAdminDateRange(input: { range?: string; from?: string; to?: string }, now = new Date()) {
  const today = dayInShanghai(now);
  const range: AdminRangePreset = input.range === "week" || input.range === "month" || input.range === "90d" || input.range === "custom" ? input.range : "today";
  let from = today;
  let to = today;
  if (range === "week") {
    const [year, month, date] = today.split("-").map(Number);
    const weekday = new Date(Date.UTC(year, month - 1, date)).getUTCDay() || 7;
    from = addDays(today, 1 - weekday);
  } else if (range === "month") from = `${today.slice(0, 8)}01`;
  else if (range === "90d") from = addDays(today, -89);
  else if (range === "custom") {
    from = validDate(input.from) || today;
    to = validDate(input.to) || today;
    if (from > to) [from, to] = [to, from];
  }
  const days = Math.round((Date.parse(`${to}T00:00:00.000Z`) - Date.parse(`${from}T00:00:00.000Z`)) / dayInMs) + 1;
  return { range, from, to, days };
}
