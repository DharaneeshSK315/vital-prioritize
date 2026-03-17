// Doctor Recommendation Engine
// Maps symptoms to specialists and specific doctor names

export interface DoctorRecommendation {
  specialization: string;
  doctorName: string;
}

interface DoctorEntry {
  specialization: string;
  doctors: string[];
}

// Symptom keyword → specialist mapping with multiple doctors per specialty
const symptomDoctorMap: Record<string, DoctorEntry> = {
  "chest pain": { specialization: "Cardiologist", doctors: ["Dr. Dharani", "Dr. Vignesh", "Dr. Suresh"] },
  "shortness of breath": { specialization: "Pulmonologist", doctors: ["Dr. Arjun", "Dr. Kavitha"] },
  "fever": { specialization: "General Physician", doctors: ["Dr. Kumar", "Dr. Lakshmi", "Dr. Raj"] },
  "headache": { specialization: "Neurologist", doctors: ["Dr. Priya", "Dr. Naveen"] },
  "skin rash": { specialization: "Dermatologist", doctors: ["Dr. Meena", "Dr. Anitha"] },
  "rash": { specialization: "Dermatologist", doctors: ["Dr. Meena", "Dr. Anitha"] },
  "fracture": { specialization: "Orthopedic", doctors: ["Dr. Ravi", "Dr. Karthik"] },
  "sprain": { specialization: "Orthopedic", doctors: ["Dr. Ravi", "Dr. Karthik"] },
  "laceration": { specialization: "Emergency Surgeon", doctors: ["Dr. Vikram", "Dr. Deepa"] },
  "abdominal pain": { specialization: "Gastroenterologist", doctors: ["Dr. Senthil", "Dr. Divya"] },
  "nausea": { specialization: "Gastroenterologist", doctors: ["Dr. Senthil", "Dr. Divya"] },
  "dizziness": { specialization: "Neurologist", doctors: ["Dr. Priya", "Dr. Naveen"] },
  "confusion": { specialization: "Neurologist", doctors: ["Dr. Priya", "Dr. Naveen"] },
  "cough": { specialization: "Pulmonologist", doctors: ["Dr. Arjun", "Dr. Kavitha"] },
  "trauma": { specialization: "Trauma Surgeon", doctors: ["Dr. Vikram", "Dr. Arun"] },
  "unresponsive": { specialization: "Emergency Medicine", doctors: ["Dr. Vikram", "Dr. Arun"] },
  "sore throat": { specialization: "ENT Specialist", doctors: ["Dr. Ramesh", "Dr. Swathi"] },
  "fatigue": { specialization: "General Physician", doctors: ["Dr. Kumar", "Dr. Lakshmi"] },
  "wrist pain": { specialization: "Orthopedic", doctors: ["Dr. Ravi", "Dr. Karthik"] },
  "ankle": { specialization: "Orthopedic", doctors: ["Dr. Ravi", "Dr. Karthik"] },
};

// Priority order for specializations (higher = more urgent)
const specializationPriority: Record<string, number> = {
  "Emergency Medicine": 10,
  "Trauma Surgeon": 9,
  "Emergency Surgeon": 8,
  "Cardiologist": 7,
  "Pulmonologist": 6,
  "Neurologist": 5,
  "Gastroenterologist": 4,
  "Orthopedic": 3,
  "Dermatologist": 2,
  "ENT Specialist": 2,
  "General Physician": 1,
};

export function recommendDoctor(symptoms: string): DoctorRecommendation {
  const lowerSymptoms = symptoms.toLowerCase();
  const matches: { entry: DoctorEntry; priority: number }[] = [];

  for (const [keyword, entry] of Object.entries(symptomDoctorMap)) {
    if (lowerSymptoms.includes(keyword)) {
      matches.push({
        entry,
        priority: specializationPriority[entry.specialization] ?? 0,
      });
    }
  }

  if (matches.length === 0) {
    return { specialization: "General Physician", doctorName: "Dr. Kumar" };
  }

  // Pick highest priority specialist
  matches.sort((a, b) => b.priority - a.priority);
  const best = matches[0].entry;

  // Rotate doctors pseudo-randomly
  const doctor = best.doctors[Math.floor(Math.random() * best.doctors.length)];

  return { specialization: best.specialization, doctorName: doctor };
}

export function recommendAllDoctors(symptoms: string): DoctorRecommendation[] {
  const lowerSymptoms = symptoms.toLowerCase();
  const seen = new Set<string>();
  const results: DoctorRecommendation[] = [];

  for (const [keyword, entry] of Object.entries(symptomDoctorMap)) {
    if (lowerSymptoms.includes(keyword) && !seen.has(entry.specialization)) {
      seen.add(entry.specialization);
      const doctor = entry.doctors[Math.floor(Math.random() * entry.doctors.length)];
      results.push({ specialization: entry.specialization, doctorName: doctor });
    }
  }

  if (results.length === 0) {
    return [{ specialization: "General Physician", doctorName: "Dr. Kumar" }];
  }

  results.sort(
    (a, b) =>
      (specializationPriority[b.specialization] ?? 0) -
      (specializationPriority[a.specialization] ?? 0)
  );

  return results;
}
