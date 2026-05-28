import * as React from "react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface LineChartData {
  name: string;
  [key: string]: any;
}

export interface LineChartProps {
  data: LineChartData[];
  dataKeys: string[];
  colors?: string[];
  height?: number;
}

export function LineChart({
  data,
  dataKeys,
  colors = ["#3B82F6", "#8B5CF6", "#EF4444"],
  height = 300,
}: LineChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              fontWeight: 500,
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: "10px", fontWeight: 600, color: "#475569" }}
          />
          {dataKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i] || "#3B82F6"}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
