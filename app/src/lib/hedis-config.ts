/**
 * Shared HEDIS measure configuration. Both the Settings control card
 * and the patient HEDIS modal read from this list. A measure with
 * enabled: true appears in the patient modal; enabled: false does not.
 *
 * In production this will be persisted to the database. For the prototype
 * it is a compile-time constant — toggle here, both pages update.
 */

export interface HedisMeasureConfig {
  code: string;
  measure: string;
  category: string;
  enabled: boolean;
  selfReport: boolean;
}

export const HEDIS_MEASURE_CONFIG: HedisMeasureConfig[] = [
  // Cardiovascular
  { code: "CBP", measure: "Controlling High Blood Pressure", category: "Cardiovascular", enabled: true, selfReport: true },
  { code: "SPC", measure: "Statin Therapy for Patients with Cardiovascular Disease", category: "Cardiovascular", enabled: true, selfReport: false },
  { code: "PBH", measure: "Persistence of Beta-Blocker Treatment After a Heart Attack", category: "Cardiovascular", enabled: false, selfReport: false },
  // Diabetes
  { code: "HBD", measure: "Hemoglobin A1c Control for Patients with Diabetes", category: "Diabetes", enabled: true, selfReport: false },
  { code: "EED", measure: "Eye Exam for Patients with Diabetes", category: "Diabetes", enabled: true, selfReport: true },
  { code: "KED", measure: "Kidney Health Evaluation for Patients with Diabetes", category: "Diabetes", enabled: true, selfReport: false },
  { code: "SPD", measure: "Statin Therapy for Patients with Diabetes", category: "Diabetes", enabled: true, selfReport: false },
  { code: "GSD", measure: "Glycemic Status Assessment for Patients with Diabetes", category: "Diabetes", enabled: false, selfReport: false },
  // Cancer Screening
  { code: "COL", measure: "Colorectal Cancer Screening", category: "Cancer Screening", enabled: true, selfReport: true },
  { code: "BCS", measure: "Breast Cancer Screening", category: "Cancer Screening", enabled: true, selfReport: true },
  { code: "CCS", measure: "Cervical Cancer Screening", category: "Cancer Screening", enabled: false, selfReport: true },
  // Musculoskeletal
  { code: "OMW", measure: "Osteoporosis Management in Women Who Had a Fracture", category: "Musculoskeletal", enabled: true, selfReport: true },
  { code: "ART", measure: "Disease-Modifying Anti-Rheumatic Drug Therapy for Rheumatoid Arthritis", category: "Musculoskeletal", enabled: false, selfReport: false },
  // Medication Safety
  { code: "DAE", measure: "Use of High-Risk Medications in Older Adults", category: "Medication Safety", enabled: true, selfReport: false },
  { code: "DDE", measure: "Potentially Harmful Drug-Disease Interactions in Older Adults", category: "Medication Safety", enabled: false, selfReport: false },
  { code: "SUPD", measure: "Statin Use in Persons with Diabetes", category: "Medication Safety", enabled: false, selfReport: false },
  // Transitions of Care
  { code: "MRP", measure: "Medication Reconciliation Post-Discharge", category: "Transitions of Care", enabled: true, selfReport: false },
  { code: "PCR", measure: "Plan All-Cause Readmissions", category: "Transitions of Care", enabled: true, selfReport: false },
  { code: "TRC", measure: "Transitions of Care", category: "Transitions of Care", enabled: false, selfReport: false },
  // Behavioral Health
  { code: "FUM", measure: "Follow-Up After ED Visit for Mental Illness", category: "Behavioral Health", enabled: true, selfReport: false },
  { code: "AMM", measure: "Antidepressant Medication Management", category: "Behavioral Health", enabled: true, selfReport: false },
  { code: "FUH", measure: "Follow-Up After Hospitalization for Mental Illness", category: "Behavioral Health", enabled: false, selfReport: false },
  { code: "ADD", measure: "Follow-Up Care for Children Prescribed ADHD Medication", category: "Behavioral Health", enabled: false, selfReport: false },
  { code: "APM", measure: "Metabolic Monitoring for Children and Adolescents on Antipsychotics", category: "Behavioral Health", enabled: false, selfReport: false },
  { code: "SAA", measure: "Adherence to Antipsychotic Medications for Individuals with Schizophrenia", category: "Behavioral Health", enabled: false, selfReport: false },
  { code: "DSF", measure: "Depression Screening and Follow-Up for Adolescents and Adults", category: "Behavioral Health", enabled: true, selfReport: false },
  // Respiratory
  { code: "PCE", measure: "Pharmacotherapy Management of COPD Exacerbation", category: "Respiratory", enabled: true, selfReport: false },
  { code: "ASM", measure: "Asthma Medication Ratio", category: "Respiratory", enabled: false, selfReport: false },
  // Immunizations
  { code: "FVO", measure: "Flu Vaccinations for Adults Ages 18-64", category: "Immunizations", enabled: false, selfReport: true },
  { code: "PNU", measure: "Pneumococcal Vaccination Status for Older Adults", category: "Immunizations", enabled: false, selfReport: true },
  // Overuse / Appropriateness
  { code: "COU", measure: "Appropriate Treatment for Upper Respiratory Infection", category: "Overuse", enabled: false, selfReport: false },
  { code: "AAB", measure: "Avoidance of Antibiotic Treatment for Acute Bronchitis/Bronchiolitis", category: "Overuse", enabled: false, selfReport: false },
  { code: "LBP", measure: "Use of Imaging Studies for Low Back Pain", category: "Overuse", enabled: false, selfReport: false },
  // Access / Preventive
  { code: "AWC", measure: "Adult BMI Assessment", category: "Preventive", enabled: false, selfReport: true },
  { code: "AIS", measure: "Adult Immunization Status", category: "Preventive", enabled: false, selfReport: true },
  { code: "COA", measure: "Care for Older Adults", category: "Preventive", enabled: false, selfReport: false },
];

const STORAGE_KEY = "hedis-settings";

/** Save the current enabled/selfReport state to localStorage */
export function saveHedisSettings(measures: HedisMeasureConfig[]) {
  const state: Record<string, { enabled: boolean; selfReport: boolean }> = {};
  for (const m of measures) {
    state[m.code] = { enabled: m.enabled, selfReport: m.selfReport };
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Load saved settings and merge with defaults */
export function loadHedisSettings(): HedisMeasureConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return HEDIS_MEASURE_CONFIG;
    const state = JSON.parse(raw) as Record<string, { enabled: boolean; selfReport: boolean }>;
    return HEDIS_MEASURE_CONFIG.map((m) => {
      const saved = state[m.code];
      return saved ? { ...m, enabled: saved.enabled, selfReport: saved.selfReport } : m;
    });
  } catch {
    return HEDIS_MEASURE_CONFIG;
  }
}

/** Read the enabled codes from persisted settings */
export function getEnabledHedisCodes(): Set<string> {
  const measures = loadHedisSettings();
  return new Set(measures.filter((m) => m.enabled).map((m) => m.code));
}

/** Read the self-report codes from persisted settings */
export function getSelfReportCodes(): Set<string> {
  const measures = loadHedisSettings();
  return new Set(measures.filter((m) => m.selfReport).map((m) => m.code));
}
