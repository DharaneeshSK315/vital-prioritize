// AI Triage Prediction Engine
// Rule-based classification mimicking a Random Forest model trained on Manchester Triage Scale
import { recommendDoctor } from "./doctorMapping";

export type PriorityLevel = "Critical" | "High" | "Medium" | "Low";

export interface PatientInput {
  name: string;
  age: number;
  heartRate: number;
  systolicBp: number;
  spo2: number;
  temperature: number;
  painLevel: number;
  breathingDifficulty: 0 | 1 | 2; // 0: None, 1: Moderate, 2: Severe
  symptoms: string;
}

export interface DoctorRecommendation {
  specialization: string;
  doctorName: string;
}

export interface TriageResult {
  priority: PriorityLevel;
  riskScore: number;
  action: string;
  reasoning: string[];
  doctor: DoctorRecommendation;
}

export interface Patient extends PatientInput {
  id: string;
  result: TriageResult;
  admittedAt: Date;
}

function computeRiskFactors(input: PatientInput): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // SpO2 analysis
  if (input.spo2 < 85) {
    score += 40;
    reasons.push(`Critical SpO2 level: ${input.spo2}%`);
  } else if (input.spo2 < 92) {
    score += 25;
    reasons.push(`Low SpO2 level: ${input.spo2}%`);
  } else if (input.spo2 < 95) {
    score += 10;
    reasons.push(`Below-normal SpO2: ${input.spo2}%`);
  }

  // Heart rate
  if (input.heartRate > 130) {
    score += 35;
    reasons.push(`Severe tachycardia: ${input.heartRate} bpm`);
  } else if (input.heartRate > 110) {
    score += 20;
    reasons.push(`Tachycardia: ${input.heartRate} bpm`);
  } else if (input.heartRate < 50) {
    score += 30;
    reasons.push(`Bradycardia: ${input.heartRate} bpm`);
  }

  // Blood pressure
  if (input.systolicBp > 180) {
    score += 30;
    reasons.push(`Hypertensive crisis: ${input.systolicBp} mmHg`);
  } else if (input.systolicBp > 160) {
    score += 15;
    reasons.push(`Elevated systolic BP: ${input.systolicBp} mmHg`);
  } else if (input.systolicBp < 90) {
    score += 35;
    reasons.push(`Hypotension: ${input.systolicBp} mmHg`);
  }

  // Temperature
  if (input.temperature > 39.5) {
    score += 20;
    reasons.push(`High fever: ${input.temperature.toFixed(1)}°C`);
  } else if (input.temperature > 38.5) {
    score += 10;
    reasons.push(`Fever: ${input.temperature.toFixed(1)}°C`);
  } else if (input.temperature < 35.5) {
    score += 25;
    reasons.push(`Hypothermia: ${input.temperature.toFixed(1)}°C`);
  }

  // Breathing difficulty
  if (input.breathingDifficulty === 2) {
    score += 35;
    reasons.push("Severe breathing difficulty");
  } else if (input.breathingDifficulty === 1) {
    score += 15;
    reasons.push("Moderate breathing difficulty");
  }

  // Pain level
  if (input.painLevel >= 9) {
    score += 20;
    reasons.push(`Extreme pain level: ${input.painLevel}/10`);
  } else if (input.painLevel >= 7) {
    score += 12;
    reasons.push(`Severe pain: ${input.painLevel}/10`);
  } else if (input.painLevel >= 5) {
    score += 5;
    reasons.push(`Moderate pain: ${input.painLevel}/10`);
  }

  // Age risk factor
  if (input.age > 75 || input.age < 2) {
    score += 10;
    reasons.push(`Age risk factor: ${input.age} years`);
  }

  // Compound risk: low SpO2 + high HR
  if (input.spo2 < 92 && input.heartRate > 110) {
    score += 15;
    reasons.push("Compound risk: hypoxia with tachycardia");
  }

  return { score, reasons };
}

export function predictTriage(input: PatientInput): TriageResult {
  const { score, reasons } = computeRiskFactors(input);

  // Normalize score to 0-1
  const maxScore = 200;
  const riskScore = Math.min(score / maxScore, 1);

  let priority: PriorityLevel;
  let action: string;

  if (riskScore >= 0.55) {
    priority = "Critical";
    action = "Immediate resuscitation — assign to trauma bay";
  } else if (riskScore >= 0.35) {
    priority = "High";
    action = "Urgent treatment — assign attending physician within 10 minutes";
  } else if (riskScore >= 0.15) {
    priority = "Medium";
    action = "Standard consultation — nurse assessment within 30 minutes";
  } else {
    priority = "Low";
    action = "Non-urgent — standard queue, reassess in 60 minutes";
  }

  return {
    priority,
    riskScore: Math.round(riskScore * 1000) / 10, // percentage with 1 decimal
    action,
    reasoning: reasons.length > 0 ? reasons : ["All vitals within normal range"],
  };
}

// Generate mock patients for demo
export function generateMockPatients(): Patient[] {
  const names = [
    "Sarah Mitchell", "James Rodriguez", "Emily Chen", "Robert Okafor",
    "Maria Santos", "David Kim", "Anna Petrov", "Michael Thompson",
    "Fatima Al-Hassan", "William Foster", "Priya Sharma", "Carlos Mendez",
  ];

  const mockData: Omit<PatientInput, "name">[] = [
    { age: 67, heartRate: 138, systolicBp: 85, spo2: 82, temperature: 38.2, painLevel: 8, breathingDifficulty: 2, symptoms: "Chest pain, shortness of breath" },
    { age: 45, heartRate: 110, systolicBp: 165, spo2: 91, temperature: 39.1, painLevel: 7, breathingDifficulty: 1, symptoms: "Severe headache, dizziness" },
    { age: 32, heartRate: 88, systolicBp: 125, spo2: 97, temperature: 38.8, painLevel: 5, breathingDifficulty: 0, symptoms: "Abdominal pain, nausea" },
    { age: 78, heartRate: 48, systolicBp: 100, spo2: 89, temperature: 36.8, painLevel: 3, breathingDifficulty: 1, symptoms: "Fatigue, confusion" },
    { age: 25, heartRate: 72, systolicBp: 118, spo2: 99, temperature: 36.6, painLevel: 2, breathingDifficulty: 0, symptoms: "Minor laceration" },
    { age: 55, heartRate: 125, systolicBp: 190, spo2: 94, temperature: 37.0, painLevel: 9, breathingDifficulty: 1, symptoms: "Crushing chest pain, radiating to arm" },
    { age: 8, heartRate: 115, systolicBp: 95, spo2: 96, temperature: 39.8, painLevel: 6, breathingDifficulty: 1, symptoms: "High fever, cough, rash" },
    { age: 42, heartRate: 78, systolicBp: 130, spo2: 98, temperature: 37.2, painLevel: 4, breathingDifficulty: 0, symptoms: "Wrist pain after fall" },
    { age: 61, heartRate: 142, systolicBp: 78, spo2: 84, temperature: 35.2, painLevel: 10, breathingDifficulty: 2, symptoms: "Severe trauma, unresponsive" },
    { age: 35, heartRate: 82, systolicBp: 122, spo2: 98, temperature: 37.0, painLevel: 3, breathingDifficulty: 0, symptoms: "Sore throat, mild cough" },
    { age: 70, heartRate: 98, systolicBp: 155, spo2: 93, temperature: 38.5, painLevel: 6, breathingDifficulty: 1, symptoms: "Persistent cough, chest tightness" },
    { age: 19, heartRate: 68, systolicBp: 115, spo2: 99, temperature: 36.7, painLevel: 1, breathingDifficulty: 0, symptoms: "Sprained ankle" },
  ];

  return names.map((name, i) => {
    const input: PatientInput = { name, ...mockData[i] };
    const result = predictTriage(input);
    const minutesAgo = Math.floor(Math.random() * 120);
    return {
      ...input,
      id: crypto.randomUUID(),
      result,
      admittedAt: new Date(Date.now() - minutesAgo * 60000),
    };
  });
}
