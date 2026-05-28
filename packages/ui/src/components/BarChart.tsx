import * as React from "react";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface BarChartData {
  name: string;
  [key: string]: any;
}

export interface BarChartProps {
  data: BarChartData[];
  dataKeys: string[];
  colors?: string[];
  height?: number;
}

export function BarChart({
  data,
  dataKeys,
  colors = ["#3B82F6", "#8B5CF6", "#EF4444"],
  height = 300,
}: BarChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.5} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 505,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: "10px", fontWeight: 600, color: "#475569" }}
          />
          {dataKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[i] || "#3B82F6"}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
