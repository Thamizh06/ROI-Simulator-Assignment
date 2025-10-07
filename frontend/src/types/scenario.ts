export type ScenarioInputs = {
  scenario_name: string;
  monthly_invoice_volume: number;
  num_ap_staff: number;
  avg_hours_per_invoice: number;
  hourly_wage: number;
  error_rate_manual: number; // percentage
  error_cost: number;
  time_horizon_months: number;
  one_time_implementation_cost: number;
};

export type ScenarioCreateBody = {
  name: string;
  inputs: Omit<ScenarioInputs, "scenario_name">;
};

export type ScenarioResult = {
  labor_cost_manual: number;
  auto_cost: number;
  error_savings: number;
  monthly_savings: number;
  cumulative_savings: number;
  net_savings: number;
  payback_months: number | null;
  roi_percentage: number | null;
};

export type ScenarioRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ScenarioFull = ScenarioRow & {
  inputs: Omit<ScenarioInputs, "scenario_name">;
  results: ScenarioResult;
};

export type SimulateResponse = {
  inputs: ScenarioInputs;
  results: ScenarioResult;
};
