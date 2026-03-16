import { motion, AnimatePresence } from "framer-motion";
import { type Patient } from "@/lib/triageEngine";
import { PriorityBadge } from "./PriorityBadge";
import { X, Heart, Thermometer, Wind, Gauge, Activity, AlertCircle } from "lucide-react";

interface PatientDetailProps {
  patient: Patient | null;
  onClose: () => void;
}

export const PatientDetail = ({ patient, onClose }: PatientDetailProps) => (
  <AnimatePresence>
    {patient && (
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
          className="bg-card rounded-xl shadow-clinical-lg w-full max-w-md mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold">{patient.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {patient.age} years · {patient.symptoms}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Priority & Risk */}
            <div className="flex items-center justify-between">
              <PriorityBadge level={patient.result.priority} pulse />
              <span className="font-mono text-lg font-semibold">
                {patient.result.riskScore.toFixed(1)}%
                <span className="text-xs text-muted-foreground ml-1 font-sans font-normal">risk</span>
              </span>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Heart, label: "Heart Rate", value: `${patient.heartRate} bpm`, warn: patient.heartRate > 120 || patient.heartRate < 50 },
                { icon: Gauge, label: "Blood Pressure", value: `${patient.systolicBp} mmHg`, warn: patient.systolicBp > 170 || patient.systolicBp < 90 },
                { icon: Activity, label: "SpO2", value: `${patient.spo2}%`, warn: patient.spo2 < 92 },
                { icon: Thermometer, label: "Temperature", value: `${patient.temperature.toFixed(1)}°C`, warn: patient.temperature > 38.5 || patient.temperature < 35.5 },
                { icon: AlertCircle, label: "Pain Level", value: `${patient.painLevel}/10`, warn: patient.painLevel >= 7 },
                { icon: Wind, label: "Breathing", value: ["Normal", "Moderate", "Severe"][patient.breathingDifficulty], warn: patient.breathingDifficulty >= 1 },
              ].map(({ icon: Icon, label, value, warn }) => (
                <div
                  key={label}
                  className={`rounded-lg border p-3 ${warn ? "border-critical/30 bg-critical-surface/50" : "border-border bg-muted/30"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3 h-3 ${warn ? "text-critical" : "text-muted-foreground"}`} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <span className={`font-mono text-sm font-semibold ${warn ? "text-critical-foreground" : ""}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* AI Reasoning */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                AI Reasoning
              </p>
              <ul className="space-y-1.5">
                {patient.result.reasoning.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action */}
            <div className="rounded-lg border border-border p-3 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Recommended Action
              </p>
              <p className="text-sm">{patient.result.action}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
