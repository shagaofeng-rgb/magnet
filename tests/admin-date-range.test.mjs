import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveAdminDateRange } from "../lib/admin-date-range.ts";

const saturday = new Date("2026-10-09T16:00:00.000Z"); // 2026-10-10 in Asia/Shanghai

test("admin presets resolve in the site timezone", () => {
  assert.deepEqual(resolveAdminDateRange({ range: "today" }, saturday), { range: "today", from: "2026-10-10", to: "2026-10-10", days: 1 });
  assert.deepEqual(resolveAdminDateRange({ range: "week" }, saturday), { range: "week", from: "2026-10-05", to: "2026-10-10", days: 6 });
  assert.deepEqual(resolveAdminDateRange({ range: "month" }, saturday), { range: "month", from: "2026-10-01", to: "2026-10-10", days: 10 });
  assert.deepEqual(resolveAdminDateRange({ range: "90d" }, saturday), { range: "90d", from: "2026-07-13", to: "2026-10-10", days: 90 });
});

test("custom range validates dates and orders endpoints", () => {
  assert.deepEqual(resolveAdminDateRange({ range: "custom", from: "2026-10-08", to: "2026-10-01" }, saturday), { range: "custom", from: "2026-10-01", to: "2026-10-08", days: 8 });
  assert.deepEqual(resolveAdminDateRange({ range: "custom", from: "2026-02-30", to: "2026-10-10" }, saturday), { range: "custom", from: "2026-10-10", to: "2026-10-10", days: 1 });
});
