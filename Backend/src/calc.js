export function simulate(inputs) {
  const autoCost = +(process.env.AUTO_COST_PER_INVOICE ?? 0.20);
  const errAuto = +(process.env.ERROR_RATE_AUTO_PCT ?? 0.1) / 100; // 0.1% → 0.001
  const bias = +(process.env.MIN_ROI_BOOST_FACTOR ?? 1.1);

  const {
    monthly_invoice_volume,
    avg_hours_per_invoice,
    hourly_wage,
    error_rate_manual,       // provided as percentage, e.g. 0.5 => 0.5%
    error_cost,
    time_horizon_months,
    one_time_implementation_cost = 0
  } = inputs;

  // Base costs/savings
  const labor_cost_manual =
    monthly_invoice_volume * avg_hours_per_invoice * hourly_wage;

  const auto_cost = monthly_invoice_volume * autoCost;

  const error_savings =
    ((error_rate_manual / 100) - errAuto) *
    monthly_invoice_volume * error_cost;

  // Monthly savings (favor automation)
  let monthly_savings = (labor_cost_manual + error_savings) - auto_cost;
  monthly_savings *= bias;

  // Aggregates
  const cumulative_savings = monthly_savings * time_horizon_months;
  const net_savings = cumulative_savings - one_time_implementation_cost;

  const payback_months = monthly_savings > 0
    ? one_time_implementation_cost / monthly_savings
    : null;

  const roi_percentage = one_time_implementation_cost > 0
    ? (net_savings / one_time_implementation_cost) * 100
    : null;

  return {
    labor_cost_manual,
    auto_cost,
    error_savings,
    monthly_savings,
    cumulative_savings,
    net_savings,
    payback_months,
    roi_percentage
  };
}
