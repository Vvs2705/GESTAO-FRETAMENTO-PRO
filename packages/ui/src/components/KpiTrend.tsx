import * as React from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export interface KpiTrendProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function KpiTrend({ data, color = "#3B82F6", width = 60, height = 20 }: KpiTrendProps) {
  const chartData = React.useMemo(() => {
    return data.map((val, index) => ({ index, value: val }));
  }, [data]);

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.1}
            strokeWidth={1.5}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
