"use client";

import { useState } from "react";
import { IconCalendar } from "@tabler/icons-react";
import type { AdminRangePreset } from "@/lib/admin-date-range";

export function AdminDateFields({ range, from, to }: { range: AdminRangePreset; from: string; to: string }) {
  const [selected, setSelected] = useState<AdminRangePreset>(range);
  return <div className="admin-date-fields">
    <label className="admin-range-field"><span>时间范围</span><span className="admin-select-wrap"><IconCalendar size={18} aria-hidden="true" /><select name="range" value={selected} onChange={(event) => setSelected(event.target.value as AdminRangePreset)}><option value="today">今天</option><option value="week">本周</option><option value="month">本月</option><option value="90d">90 天</option><option value="custom">自定义</option></select></span></label>
    {selected === "custom" ? <><label><span>开始日期</span><input type="date" name="from" defaultValue={from} /></label><label><span>结束日期</span><input type="date" name="to" defaultValue={to} /></label></> : <span className="admin-selected-dates" aria-label="当前数据日期范围">{from} 至 {to}</span>}
  </div>;
}
