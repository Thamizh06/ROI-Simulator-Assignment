import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Percent, DollarSign } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import type { ScenarioResult } from "@/types/scenario";

interface ResultsCardsProps {
  results: ScenarioResult | null;
  isLoading?: boolean;
}

export function ResultsCards({ results, isLoading }: ResultsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-card">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!results) {
    return (
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Enter your data and calculate to see results
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="shadow-elevated border-success/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Monthly Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-success">{formatCurrency(results.monthly_savings)}</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            Payback Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">
            {results.payback_months !== null ? `${results.payback_months.toFixed(1)} months` : "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Percent className="h-4 w-4" />
            ROI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-accent">
            {results.roi_percentage !== null ? formatPercent(results.roi_percentage) : "N/A"}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Cumulative Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-foreground">{formatCurrency(results.cumulative_savings)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
