import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScenarioInputs } from "@/types/scenario";

interface ScenarioFormProps {
  initialValues?: ScenarioInputs;
  onSubmit: (values: ScenarioInputs) => void;
  isLoading?: boolean;
}

const defaultValues: ScenarioInputs = {
  scenario_name: "",
  monthly_invoice_volume: 2000,
  num_ap_staff: 3,
  avg_hours_per_invoice: 0.17,
  hourly_wage: 30,
  error_rate_manual: 0.5,
  error_cost: 100,
  time_horizon_months: 36,
  one_time_implementation_cost: 50000,
};

export function ScenarioForm({ initialValues, onSubmit, isLoading }: ScenarioFormProps) {
  const [values, setValues] = useState<ScenarioInputs>(initialValues || defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ScenarioInputs, string>>>({});

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    }
  }, [initialValues]);

  const validateField = (name: keyof ScenarioInputs, value: number | string): string | null => {
    if (name === "scenario_name") {
      return !value ? "Scenario name is required" : null;
    }
    
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return "Must be a valid number";
    
    switch (name) {
      case "monthly_invoice_volume":
        return numValue <= 0 ? "Must be greater than 0" : null;
      case "num_ap_staff":
        return numValue < 0 ? "Cannot be negative" : null;
      case "avg_hours_per_invoice":
        return numValue < 0.01 || numValue > 8 ? "Must be between 0.01 and 8 hours" : null;
      case "hourly_wage":
        return numValue < 0 ? "Cannot be negative" : null;
      case "error_rate_manual":
        return numValue < 0 ? "Cannot be negative" : null;
      case "error_cost":
        return numValue < 0 ? "Cannot be negative" : null;
      case "time_horizon_months":
        return numValue < 1 || numValue > 60 ? "Must be between 1 and 60 months" : null;
      case "one_time_implementation_cost":
        return numValue < 0 ? "Cannot be negative" : null;
      default:
        return null;
    }
  };

  const handleChange = (name: keyof ScenarioInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = name === "scenario_name" ? e.target.value : e.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error || undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Partial<Record<keyof ScenarioInputs, string>> = {};
    let hasErrors = false;
    
    (Object.keys(values) as Array<keyof ScenarioInputs>).forEach((key) => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });
    
    setErrors(newErrors);
    
    if (!hasErrors) {
      onSubmit(values);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>ROI Simulator</CardTitle>
        <CardDescription>Enter your invoicing metrics to calculate potential savings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario_name">Scenario Name</Label>
            <Input
              id="scenario_name"
              value={values.scenario_name}
              onChange={handleChange("scenario_name")}
              placeholder="e.g., Q4_Pilot"
            />
            {errors.scenario_name && <p className="text-sm text-destructive">{errors.scenario_name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_invoice_volume">Monthly Invoice Volume</Label>
            <Input
              id="monthly_invoice_volume"
              type="number"
              value={values.monthly_invoice_volume}
              onChange={handleChange("monthly_invoice_volume")}
              placeholder="2000"
            />
            {errors.monthly_invoice_volume && <p className="text-sm text-destructive">{errors.monthly_invoice_volume}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_ap_staff">Number of AP Staff</Label>
            <Input
              id="num_ap_staff"
              type="number"
              value={values.num_ap_staff}
              onChange={handleChange("num_ap_staff")}
              placeholder="3"
            />
            {errors.num_ap_staff && <p className="text-sm text-destructive">{errors.num_ap_staff}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="avg_hours_per_invoice">Average Hours per Invoice</Label>
            <Input
              id="avg_hours_per_invoice"
              type="number"
              step="0.01"
              value={values.avg_hours_per_invoice}
              onChange={handleChange("avg_hours_per_invoice")}
              placeholder="0.17"
            />
            <p className="text-xs text-muted-foreground">e.g., 0.17 hours = 10 minutes</p>
            {errors.avg_hours_per_invoice && <p className="text-sm text-destructive">{errors.avg_hours_per_invoice}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly_wage">Hourly Wage ($)</Label>
            <Input
              id="hourly_wage"
              type="number"
              step="0.01"
              value={values.hourly_wage}
              onChange={handleChange("hourly_wage")}
              placeholder="30"
            />
            {errors.hourly_wage && <p className="text-sm text-destructive">{errors.hourly_wage}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="error_rate_manual">Manual Error Rate (%)</Label>
            <Input
              id="error_rate_manual"
              type="number"
              step="0.1"
              value={values.error_rate_manual}
              onChange={handleChange("error_rate_manual")}
              placeholder="0.5"
            />
            <p className="text-xs text-muted-foreground">e.g., 0.5 = 0.5% error rate</p>
            {errors.error_rate_manual && <p className="text-sm text-destructive">{errors.error_rate_manual}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="error_cost">Cost per Error ($)</Label>
            <Input
              id="error_cost"
              type="number"
              step="0.01"
              value={values.error_cost}
              onChange={handleChange("error_cost")}
              placeholder="100"
            />
            {errors.error_cost && <p className="text-sm text-destructive">{errors.error_cost}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="time_horizon_months">Time Horizon (Months)</Label>
            <Input
              id="time_horizon_months"
              type="number"
              value={values.time_horizon_months}
              onChange={handleChange("time_horizon_months")}
              placeholder="36"
            />
            <p className="text-xs text-muted-foreground">1-60 months</p>
            {errors.time_horizon_months && <p className="text-sm text-destructive">{errors.time_horizon_months}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="one_time_implementation_cost">One-time Implementation Cost ($)</Label>
            <Input
              id="one_time_implementation_cost"
              type="number"
              step="0.01"
              value={values.one_time_implementation_cost}
              onChange={handleChange("one_time_implementation_cost")}
              placeholder="50000"
            />
            {errors.one_time_implementation_cost && <p className="text-sm text-destructive">{errors.one_time_implementation_cost}</p>}
          </div>

          <Button type="submit" className="w-full bg-gradient-primary" disabled={isLoading}>
            {isLoading ? "Calculating..." : "Calculate ROI"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
