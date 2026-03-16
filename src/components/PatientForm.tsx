import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type PatientInput, type Patient, predictTriage } from "@/lib/triageEngine";
import { PriorityBadge } from "./PriorityBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Zap, AlertCircle } from "lucide-react";

interface PatientFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (patient: Patient) => void;
}

const defaultInput: PatientInput = {
  name: "",
  age: 30,
  heartRate: 80,
  systolicBp: 120,
  spo2: 98,
  temperature: 36.6,
  painLevel: 0,
  breathingDifficulty: 0,
  symptoms: "",
};

export const PatientForm = ({ open, onClose, onSubmit }: PatientFormProps) => {
  const [input, setInput] = useState<PatientInput>(defaultInput);
  const [preview, setPreview] = useState<ReturnType<typeof predictTriage> | null>(null);

  const update = <K extends keyof PatientInput>(key: K, value: PatientInput[K]) => {
    const next = { ...input, [key]: value };
    setInput(next);
    if (next.name) {
      setPreview(predictTriage(next));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.name.trim()) return;
    const result = predictTriage(input);
    const patient: Patient = {
      ...input,
      id: crypto.randomUUID(),
      result,
      admittedAt: new Date(),
    };
    onSubmit(patient);
    setInput(defaultInput);
    setPreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] bg-foreground/20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-card rounded-xl shadow-clinical-lg w-full max-w-lg mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold">New Patient Admission</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter vitals for AI triage assessment
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Name & Age */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                  <Input
                    value={input.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Patient name"
                    className="mt-1"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Age</Label>
                  <Input
                    type="number"
                    value={input.age}
                    onChange={(e) => update("age", +e.target.value)}
                    className="mt-1 font-mono"
                    min={0}
                    max={120}
                  />
                </div>
              </div>

              {/* Vitals grid */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Vital Signs
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Heart Rate (bpm)", key: "heartRate" as const, min: 30, max: 220 },
                    { label: "Systolic BP (mmHg)", key: "systolicBp" as const, min: 50, max: 250 },
                    { label: "SpO2 (%)", key: "spo2" as const, min: 50, max: 100 },
                    { label: "Temperature (°C)", key: "temperature" as const, min: 33, max: 42, step: 0.1 },
                  ].map((field) => (
                    <div key={field.key}>
                      <Label className="text-xs text-muted-foreground">{field.label}</Label>
                      <Input
                        type="number"
                        value={input[field.key]}
                        onChange={(e) => update(field.key, +e.target.value)}
                        className="mt-1 font-mono"
                        min={field.min}
                        max={field.max}
                        step={field.step || 1}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pain & Breathing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Pain Level ({input.painLevel}/10)
                  </Label>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={input.painLevel}
                    onChange={(e) => update("painLevel", +e.target.value)}
                    className="w-full mt-2 accent-primary"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Breathing Difficulty</Label>
                  <select
                    value={input.breathingDifficulty}
                    onChange={(e) => update("breathingDifficulty", +e.target.value as 0 | 1 | 2)}
                    className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={0}>None</option>
                    <option value={1}>Moderate</option>
                    <option value={2}>Severe</option>
                  </select>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <Label className="text-xs text-muted-foreground">Symptoms</Label>
                <textarea
                  value={input.symptoms}
                  onChange={(e) => update("symptoms", e.target.value)}
                  placeholder="Describe patient symptoms..."
                  className="w-full mt-1 px-3 py-2 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none h-20"
                  maxLength={500}
                />
              </div>

              {/* Live preview */}
              {preview && input.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg border border-border p-4 bg-muted/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      AI Prediction Preview
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <PriorityBadge level={preview.priority} />
                    <span className="font-mono text-sm text-muted-foreground">
                      Risk: {preview.riskScore.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    {preview.action}
                  </p>
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Admit Patient
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
