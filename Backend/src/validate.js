import { z } from 'zod';

export const InputsSchema = z.object({
  scenario_name: z.string().min(1).max(191),
  monthly_invoice_volume: z.number().int().positive(),
  num_ap_staff: z.number().int().nonnegative(),
  avg_hours_per_invoice: z.number().positive(),      // hours (0.17 = 10 mins)
  hourly_wage: z.number().nonnegative(),
  error_rate_manual: z.number().nonnegative(),       // percentage (0.5 = 0.5%)
  error_cost: z.number().nonnegative(),
  time_horizon_months: z.number().int().positive(),
  one_time_implementation_cost: z.number().nonnegative().optional()
});

export const ScenarioSaveSchema = z.object({
  name: z.string().min(1).max(191),
  inputs: InputsSchema.omit({ scenario_name: true }) // backend trusts 'name'
});

export const IdParamSchema = z.object({
  id: z.string().min(1).max(26)
});

export const EmailSchema = z.object({
  email: z.string().email(),
  scenarioId: z.string().min(1).max(26).optional()
});
