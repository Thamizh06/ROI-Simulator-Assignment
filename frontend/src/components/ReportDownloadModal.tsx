import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download } from "lucide-react";

interface ReportDownloadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (email: string, useScenario: boolean) => void;
  hasScenarioId: boolean;
  isLoading?: boolean;
}

export function ReportDownloadModal({
  open,
  onOpenChange,
  onGenerate,
  hasScenarioId,
  isLoading,
}: ReportDownloadModalProps) {
  const [email, setEmail] = useState("");
  const [useScenario, setUseScenario] = useState(hasScenarioId);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setEmailError("");
    onGenerate(email, useScenario);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download ROI Report
          </DialogTitle>
          <DialogDescription>
            Enter your email to receive a detailed HTML report of your ROI calculation
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
              />
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <Label>Report Source</Label>
              <RadioGroup value={useScenario.toString()} onValueChange={(v) => setUseScenario(v === "true")}>
                {hasScenarioId && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="use-scenario" />
                    <Label htmlFor="use-scenario" className="font-normal cursor-pointer">
                      Use saved scenario
                    </Label>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="use-inputs" />
                  <Label htmlFor="use-inputs" className="font-normal cursor-pointer">
                    Use current inputs (ad-hoc)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-accent">
              {isLoading ? "Generating..." : "Generate Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
