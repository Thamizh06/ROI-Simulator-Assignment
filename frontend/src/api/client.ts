import type {
  ScenarioInputs,
  ScenarioCreateBody,
  ScenarioResult,
  ScenarioRow,
  ScenarioFull,
  SimulateResponse,
} from "@/types/scenario";

const BASE_URL = import.meta.env.VITE_API_URL || "https://roi-simulator-assignment-2.onrender.com";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function simulate(inputs: ScenarioInputs): Promise<SimulateResponse> {
  return fetchJson<SimulateResponse>("/simulate", {
    method: "POST",
    body: JSON.stringify(inputs),
  });
}

export async function saveScenario(
  body: ScenarioCreateBody
): Promise<{ id: string; name: string; inputs: ScenarioCreateBody["inputs"]; results: ScenarioResult }> {
  return fetchJson("/scenarios", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listScenarios(): Promise<ScenarioRow[]> {
  return fetchJson<ScenarioRow[]>("/scenarios");
}

export async function getScenario(id: string): Promise<ScenarioFull> {
  return fetchJson<ScenarioFull>(`/scenarios/${id}`);
}

export async function deleteScenario(id: string): Promise<{ ok: boolean }> {
  return fetchJson<{ ok: boolean }>(`/scenarios/${id}`, {
    method: "DELETE",
  });
}

export async function generateReportById(email: string, scenarioId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/report/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, scenarioId }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate report");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `roi-report-${scenarioId}.html`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function generateReportAdhoc(email: string, inputs: ScenarioInputs): Promise<void> {
  const response = await fetch(`${BASE_URL}/report/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, inputs }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate report");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `roi-report-${inputs.scenario_name}.html`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
