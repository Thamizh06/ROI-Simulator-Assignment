import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScenarioForm } from "@/components/ScenarioForm";
import { ResultsCards } from "@/components/ResultsCards";
import { SavingsChart } from "@/components/SavingsChart";
import { ReportDownloadModal } from "@/components/ReportDownloadModal";
import { ScenarioManager } from "@/components/ScenarioManager";
import { Save, Download, FolderOpen, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import * as api from "@/api/client";
import type { ScenarioInputs, SimulateResponse } from "@/types/scenario";

export default function SimulatorPage() {
  const [simulationResult, setSimulationResult] = useState<SimulateResponse | null>(null);
  const [currentInputs, setCurrentInputs] = useState<ScenarioInputs | null>(null);
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch scenarios list
  const { data: scenarios = [], isLoading: scenariosLoading } = useQuery({
    queryKey: ["scenarios"],
    queryFn: api.listScenarios,
  });

  // Simulate mutation
  const simulateMutation = useMutation({
    mutationFn: api.simulate,
    onSuccess: (data) => {
      setSimulationResult(data);
      setCurrentInputs(data.inputs);
      toast.success("ROI calculated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Simulation failed: ${error.message}`);
    },
  });

  // Save scenario mutation
  const saveScenarioMutation = useMutation({
    mutationFn: api.saveScenario,
    onSuccess: (data) => {
      setCurrentScenarioId(data.id);
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      toast.success(`Scenario "${data.name}" saved successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to save scenario: ${error.message}`);
    },
  });

  // Delete scenario mutation
  const deleteScenarioMutation = useMutation({
    mutationFn: api.deleteScenario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      toast.success("Scenario deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  // Load scenario mutation
  const loadScenarioMutation = useMutation({
    mutationFn: api.getScenario,
    onSuccess: (data) => {
      const fullInputs: ScenarioInputs = {
        scenario_name: data.name,
        ...data.inputs,
      };
      setCurrentInputs(fullInputs);
      setCurrentScenarioId(data.id);
      setSimulationResult({
        inputs: fullInputs,
        results: data.results,
      });
      setManagerOpen(false);
      toast.success(`Scenario "${data.name}" loaded`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to load scenario: ${error.message}`);
    },
  });

  // Report generation mutations
  const generateReportMutation = useMutation({
    mutationFn: async ({ email, useScenario }: { email: string; useScenario: boolean }) => {
      if (useScenario && currentScenarioId) {
        return api.generateReportById(email, currentScenarioId);
      } else if (currentInputs) {
        return api.generateReportAdhoc(email, currentInputs);
      }
      throw new Error("No scenario or inputs available");
    },
    onSuccess: () => {
      toast.success("Report downloaded successfully");
      setReportModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Report generation failed: ${error.message}`);
    },
  });

  const handleSimulate = (inputs: ScenarioInputs) => {
    simulateMutation.mutate(inputs);
  };

  const handleSaveScenario = () => {
    if (!currentInputs) {
      toast.error("No inputs to save");
      return;
    }

    const { scenario_name, ...inputs } = currentInputs;
    saveScenarioMutation.mutate({
      name: scenario_name,
      inputs,
    });
  };

  const handleGenerateReport = (email: string, useScenario: boolean) => {
    generateReportMutation.mutate({ email, useScenario });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Invoicing ROI Simulator</h1>
                <p className="text-sm text-muted-foreground">Calculate your automation savings</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setManagerOpen(true)}>
              <FolderOpen className="h-4 w-4 mr-2" />
              My Scenarios
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
            <ScenarioForm
              initialValues={currentInputs || undefined}
              onSubmit={handleSimulate}
              isLoading={simulateMutation.isPending}
            />
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            <ResultsCards
              results={simulationResult?.results || null}
              isLoading={simulateMutation.isPending}
            />

            {simulationResult && (
              <>
                <SavingsChart
                  results={simulationResult.results}
                  timeHorizon={simulationResult.inputs.time_horizon_months}
                  monthlySavings={simulationResult.results.monthly_savings}
                  implementationCost={simulationResult.inputs.one_time_implementation_cost}
                />

                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveScenario}
                    disabled={saveScenarioMutation.isPending}
                    className="flex-1"
                    variant="outline"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveScenarioMutation.isPending ? "Saving..." : "Save Scenario"}
                  </Button>
                  <Button
                    onClick={() => setReportModalOpen(true)}
                    disabled={!simulationResult}
                    className="flex-1 bg-gradient-accent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <ReportDownloadModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        onGenerate={handleGenerateReport}
        hasScenarioId={!!currentScenarioId}
        isLoading={generateReportMutation.isPending}
      />

      <ScenarioManager
        open={managerOpen}
        onOpenChange={setManagerOpen}
        scenarios={scenarios}
        onLoad={(id) => loadScenarioMutation.mutate(id)}
        onDelete={(id) => deleteScenarioMutation.mutate(id)}
        isLoading={scenariosLoading}
      />
    </div>
  );
}
