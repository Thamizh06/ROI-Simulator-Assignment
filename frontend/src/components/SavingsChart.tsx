import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import type { ScenarioResult } from "@/types/scenario";

interface SavingsChartProps {
  results: ScenarioResult | null;
  timeHorizon: number;
  monthlySavings: number;
  implementationCost: number;
}

export function SavingsChart({ results, timeHorizon, monthlySavings, implementationCost }: SavingsChartProps) {
  if (!results) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Cumulative Savings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate data points for the chart
  const data = Array.from({ length: timeHorizon + 1 }, (_, i) => ({
    month: i,
    savings: i === 0 ? -implementationCost : monthlySavings * i - implementationCost,
  }));

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Cumulative Savings Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
              label={{ value: "Months", position: "insideBottom", offset: -5 }}
              className="text-xs"
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              className="text-xs"
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Savings"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
