"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface DataPoint {
  month: string;
  inspections: number;
  subscriptions: number;
  margin: number;
  count: number;
}

export default function RevenueChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorInspections" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1A4A8A" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1A4A8A" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSubscriptions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#B8860B" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#B8860B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => [`${Number(value).toLocaleString()} MAD`, ""]}
          labelStyle={{ fontWeight: "bold" }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="inspections"
          name="Inspections"
          stroke="#1A4A8A"
          strokeWidth={2}
          fill="url(#colorInspections)"
        />
        <Area
          type="monotone"
          dataKey="subscriptions"
          name="Abonnements"
          stroke="#B8860B"
          strokeWidth={2}
          fill="url(#colorSubscriptions)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
