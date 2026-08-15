import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import VitalsAnalysisModal, { type VitalKey } from "@/components/forms/VitalsAnalysisModal";
import EEDFormModal from "@/components/forms/EEDFormModal";
import EmergencyModal from "@/components/forms/EmergencyModal";
import { CTH_FOCUS, CTH_STATUS, CTH_SURFACE, REPLICA, UI_NEUTRAL } from "@/lib/design-tokens";
import { getEnabledHedisCodes, getSelfReportCodes } from "@/lib/hedis-config";

const TABS = [
  "Notes to Provider",
  "HUM HRA",
  "PCP and Pharm Info",
  "A.W.V.",
  "PHQ2",
  "PHQ9",
  "P.P.P.S.",
  "Urgent and Emergent Event Form",
  "Routine Referral Form",
  "Patient Safety Plan",
] as const;

type TabName = (typeof TABS)[number];

// ---------------------------------------------------------------------------
// Medication data
// ---------------------------------------------------------------------------

interface Medication {
  name: string;
  status: "active" | "stopped" | "completed" | "unconfirmed";
  dosage: string;
  frequency: string;
  startDate: string;
  instructions: string;
  confirmed: boolean;
}

const MEDICATIONS: Medication[] = [
  { name: "galcanezumab-gnlm (EMGALITY PEN) 120 mg/mL Pnlj", status: "active", dosage: "", frequency: "", startDate: "2020-01-27", instructions: "", confirmed: true },
  { name: "ketoconazole (NIZORAL) 2% Cream", status: "active", dosage: "Apply thin layer", frequency: "Twice daily", startDate: "2021-03-15", instructions: "Apply to affected area", confirmed: false },
  { name: "latanoprost (XALATAN) 0.005% Ophth Soln", status: "active", dosage: "1 drop", frequency: "Once daily at bedtime", startDate: "2019-08-10", instructions: "In affected eye(s)", confirmed: true },
  { name: "losartan (COZAAR) 100 MG tablet", status: "active", dosage: "100mg", frequency: "Once daily", startDate: "2018-06-22", instructions: "Take with or without food", confirmed: false },
  { name: "ketorolac (SPRIX) 15.75 mg/spray Spry", status: "active", dosage: "1 spray", frequency: "Every 6-8 hours", startDate: "2023-11-05", instructions: "In one nostril", confirmed: false },
  { name: "amlodipine (NORVASC) 5 MG tablet", status: "active", dosage: "5mg", frequency: "Once daily", startDate: "2017-02-14", instructions: "", confirmed: false },
  { name: "metformin (GLUCOPHAGE) 500 MG tablet", status: "active", dosage: "500mg", frequency: "Twice daily", startDate: "2019-01-08", instructions: "Take with meals", confirmed: false },
  { name: "atorvastatin (LIPITOR) 40 MG tablet", status: "active", dosage: "40mg", frequency: "Once daily at bedtime", startDate: "2016-09-30", instructions: "", confirmed: true },
  { name: "omeprazole (PRILOSEC) 20 MG capsule", status: "stopped", dosage: "20mg", frequency: "Once daily", startDate: "2020-04-12", instructions: "30 min before breakfast", confirmed: false },
  { name: "lisinopril (PRINIVIL) 10 MG tablet", status: "stopped", dosage: "10mg", frequency: "Once daily", startDate: "2015-11-20", instructions: "", confirmed: false },
  { name: "hydrochlorothiazide (MICROZIDE) 25 MG capsule", status: "active", dosage: "25mg", frequency: "Once daily", startDate: "2018-03-05", instructions: "Take in the morning", confirmed: false },
  { name: "gabapentin (NEURONTIN) 300 MG capsule", status: "active", dosage: "300mg", frequency: "Three times daily", startDate: "2022-07-18", instructions: "", confirmed: false },
  { name: "levothyroxine (SYNTHROID) 50 MCG tablet", status: "active", dosage: "50mcg", frequency: "Once daily", startDate: "2017-10-01", instructions: "On empty stomach", confirmed: false },
  { name: "furosemide (LASIX) 40 MG tablet", status: "completed", dosage: "40mg", frequency: "Once daily", startDate: "2021-06-14", instructions: "Take in the morning", confirmed: false },
  { name: "warfarin (COUMADIN) 5 MG tablet", status: "active", dosage: "5mg", frequency: "Once daily", startDate: "2020-12-01", instructions: "At same time each day", confirmed: false },
  { name: "albuterol (PROVENTIL HFA) 90 MCG inhaler", status: "active", dosage: "2 puffs", frequency: "Every 4-6 hours as needed", startDate: "2019-05-22", instructions: "Shake well before use", confirmed: false },
  { name: "sertraline (ZOLOFT) 50 MG tablet", status: "active", dosage: "50mg", frequency: "Once daily", startDate: "2022-01-10", instructions: "", confirmed: false },
  { name: "clopidogrel (PLAVIX) 75 MG tablet", status: "active", dosage: "75mg", frequency: "Once daily", startDate: "2020-08-15", instructions: "", confirmed: false },
  { name: "acetaminophen (TYLENOL) 500 MG tablet", status: "stopped", dosage: "500mg", frequency: "Every 6 hours as needed", startDate: "2023-02-28", instructions: "Do not exceed 3000mg/day", confirmed: false },
  { name: "metoprolol succinate (TOPROL XL) 50 MG tablet", status: "active", dosage: "50mg", frequency: "Once daily", startDate: "2018-11-12", instructions: "Do not crush", confirmed: false },
  { name: "prednisone (DELTASONE) 10 MG tablet", status: "completed", dosage: "10mg", frequency: "Once daily", startDate: "2023-09-01", instructions: "Taper as directed", confirmed: false },
  { name: "fluticasone (FLONASE) 50 MCG spray", status: "active", dosage: "2 sprays", frequency: "Once daily", startDate: "2021-04-20", instructions: "In each nostril", confirmed: false },
  { name: "tamsulosin (FLOMAX) 0.4 MG capsule", status: "active", dosage: "0.4mg", frequency: "Once daily", startDate: "2022-06-08", instructions: "30 min after same meal daily", confirmed: false },
  { name: "pantoprazole (PROTONIX) 40 MG tablet", status: "active", dosage: "40mg", frequency: "Once daily", startDate: "2023-01-15", instructions: "Before breakfast", confirmed: false },
  { name: "glipizide (GLUCOTROL) 5 MG tablet", status: "active", dosage: "5mg", frequency: "Once daily", startDate: "2019-07-03", instructions: "30 min before breakfast", confirmed: false },
  { name: "rosuvastatin (CRESTOR) 10 MG tablet", status: "stopped", dosage: "10mg", frequency: "Once daily", startDate: "2016-04-18", instructions: "", confirmed: false },
  { name: "montelukast (SINGULAIR) 10 MG tablet", status: "active", dosage: "10mg", frequency: "Once daily at bedtime", startDate: "2021-09-25", instructions: "", confirmed: false },
  { name: "duloxetine (CYMBALTA) 30 MG capsule", status: "active", dosage: "30mg", frequency: "Once daily", startDate: "2022-11-30", instructions: "Do not crush or chew", confirmed: false },
  { name: "insulin glargine (LANTUS) 100 units/mL", status: "active", dosage: "20 units", frequency: "Once daily at bedtime", startDate: "2020-03-10", instructions: "Subcutaneous injection", confirmed: false },
  { name: "aspirin (ECOTRIN) 81 MG tablet", status: "active", dosage: "81mg", frequency: "Once daily", startDate: "2017-01-05", instructions: "With food", confirmed: false },
  { name: "potassium chloride (KLOR-CON) 20 mEq tablet", status: "active", dosage: "20mEq", frequency: "Once daily", startDate: "2018-08-20", instructions: "With full glass of water", confirmed: false },
  { name: "tramadol (ULTRAM) 50 MG tablet", status: "stopped", dosage: "50mg", frequency: "Every 6 hours as needed", startDate: "2023-05-12", instructions: "For pain", confirmed: false },
  { name: "spironolactone (ALDACTONE) 25 MG tablet", status: "active", dosage: "25mg", frequency: "Once daily", startDate: "2021-12-08", instructions: "", confirmed: false },
  { name: "vitamin D3 (CHOLECALCIFEROL) 2000 IU capsule", status: "active", dosage: "2000 IU", frequency: "Once daily", startDate: "2019-10-15", instructions: "With food", confirmed: false },
  { name: "calcium carbonate (TUMS) 500 MG tablet", status: "active", dosage: "500mg", frequency: "Twice daily", startDate: "2020-06-22", instructions: "With meals", confirmed: false },
];

interface VitalCard {
  key: VitalKey;
  title: string;
  value: string;
  date: string;
}

const VITAL_CARDS: VitalCard[] = [
  { key: "weight", title: "Body weight", value: "89.812 kg", date: "09/24" },
  { key: "bmi", title: "Body mass index (BMI)", value: "27.81 kg/m2", date: "09/24" },
  { key: "bp", title: "Blood Pressure", value: "160 mm[Hg] /\n78 mm[Hg]", date: "10/06" },
  { key: "heartRate", title: "Heart rate", value: "68 /min", date: "10/06" },
];

const ACTION_PILLS = [
  { label: "CBP", active: false },
  { label: "COL", active: false },
  { label: "BCS", active: false },
  { label: "OMW", active: false },
  { label: "GSD", active: false },
  { label: "KED", active: false },
  { label: "EED", active: false },
  { label: "SPC", active: false },
  { label: "SUPD", active: false },
];

// ---------------------------------------------------------------------------
// Diagnostics data
// ---------------------------------------------------------------------------

/**
 * The clinical status set for a diagnosis. Deliberately NOT the medication set —
 * `stopped` and `completed` are drug concepts and must never appear on a
 * diagnosis. Drawn from FHIR `Condition.clinicalStatus`, narrowed to the three
 * values a reconciliation workflow can act on.
 *
 * `""` is a distinct fourth state and the only one production actually carries:
 * the source reported no status at all. It is typed separately from the three
 * real values so that no code path can mistake "unknown" for "not active".
 * Resolving what empty means is DB-Q1, open with Sameh.
 */
type DiagnosisStatus = "active" | "unconfirmed" | "resolved";

interface Diagnosis {
  /**
   * Stable, unique, source-independent row identity.
   *
   * The medication table keys rows on the composite `name + startDate`. That is
   * fragile there and unsafe here: the same ICD-10 code legitimately recurs
   * across encounters, potentially with the same onset date, so a composite key
   * can match two different rows — and checking one would silently check both.
   * `dx-003` and `dx-005` below are exactly that case, present on purpose.
   *
   * Every lookup in this modal goes through this field. Nothing is keyed on
   * name, code, date, or array index.
   */
  id: string;
  name: string;
  icd10: string;
  /** `""` means the source reported no status. See DB-Q1. */
  status: DiagnosisStatus | "";
  /** Body system. Plain text, never a colour chip — Layer B has no category hues. */
  category: string;
  onsetDate: string;
  notes: string;
  confirmed: boolean;
}

/**
 * Mock data. v1 persists nothing (FR-CNT-006) — this array is the whole data
 * layer, matching the medication modal's `MEDICATIONS` above.
 *
 * The first four rows are the diagnoses visible on the production screen. Every
 * `status` is `""` because that is what production returns for every row; that
 * is the condition the progress counter must survive, not an edge case.
 */
/**
 * Raw CCDA Problems list. Every row arrives with status "" because that is what
 * the source returns. `initDiagnoses()` below assigns statuses: for each ICD-10
 * code, the most recent onset date becomes "active" (the nurse's working list
 * for the AWV confirmation conversation). Older duplicates of the same code
 * become "resolved" — historical echoes, not separate conditions.
 */
const RAW_DIAGNOSES: Omit<Diagnosis, "status">[] = [
  { id: "dx-001", name: "Rash and other nonspecific skin eruption", icd10: "R21", category: "Integumentary", onsetDate: "2023-09-24", notes: "Trunk and upper arms. Patient reports intermittent pruritus, worse at night.", confirmed: false },
  { id: "dx-002", name: "Spondylosis without myelopathy or radiculopathy, lumbar region", icd10: "M47.816", category: "Musculoskeletal", onsetDate: "2023-09-12", notes: "", confirmed: false },
  { id: "dx-003", name: "Low back pain", icd10: "M54.5", category: "Musculoskeletal", onsetDate: "2020-02-25", notes: "Chronic. Managed with physical therapy and as-needed NSAIDs.", confirmed: false },
  { id: "dx-004", name: "Pain, unspecified", icd10: "R52", category: "Symptoms and Signs", onsetDate: "2020-02-25", notes: "", confirmed: false },
  { id: "dx-005", name: "Low back pain", icd10: "M54.5", category: "Musculoskeletal", onsetDate: "2020-02-25", notes: "Recorded at a second encounter on the same date. Retained pending reconciliation.", confirmed: false },
  { id: "dx-006", name: "Type 2 diabetes mellitus without complications", icd10: "E11.9", category: "Endocrine", onsetDate: "2019-04-08", notes: "", confirmed: false },
  { id: "dx-007", name: "Type 2 diabetes mellitus with diabetic chronic kidney disease", icd10: "E11.22", category: "Endocrine", onsetDate: "2021-06-17", notes: "Coded alongside N18.3. Nephrology following.", confirmed: false },
  { id: "dx-008", name: "Type 2 diabetes mellitus with hyperglycemia", icd10: "E11.65", category: "Endocrine", onsetDate: "2022-03-02", notes: "", confirmed: false },
  { id: "dx-009", name: "Essential (primary) hypertension", icd10: "I10", category: "Cardiovascular", onsetDate: "2016-11-30", notes: "Home readings run 150-165 systolic. Adherence reviewed at each visit.", confirmed: false },
  { id: "dx-010", name: "Atherosclerotic heart disease of native coronary artery without angina pectoris", icd10: "I25.10", category: "Cardiovascular", onsetDate: "2018-05-14", notes: "", confirmed: false },
  { id: "dx-011", name: "Unspecified atrial fibrillation", icd10: "I48.91", category: "Cardiovascular", onsetDate: "2021-10-09", notes: "Rate controlled. On anticoagulation.", confirmed: false },
  { id: "dx-012", name: "Chronic diastolic (congestive) heart failure", icd10: "I50.32", category: "Cardiovascular", onsetDate: "2022-08-21", notes: "", confirmed: false },
  { id: "dx-013", name: "Hyperlipidemia, unspecified", icd10: "E78.5", category: "Metabolic", onsetDate: "2017-02-19", notes: "", confirmed: false },
  { id: "dx-014", name: "Pure hypercholesterolemia, unspecified", icd10: "E78.00", category: "Metabolic", onsetDate: "2015-07-11", notes: "Statin therapy since 2016.", confirmed: false },
  { id: "dx-015", name: "Chronic kidney disease, stage 3 unspecified", icd10: "N18.3", category: "Genitourinary", onsetDate: "2021-06-17", notes: "", confirmed: false },
  { id: "dx-016", name: "Benign prostatic hyperplasia without lower urinary tract symptoms", icd10: "N40.0", category: "Genitourinary", onsetDate: "2020-09-05", notes: "", confirmed: false },
  { id: "dx-017", name: "Chronic obstructive pulmonary disease, unspecified", icd10: "J44.9", category: "Respiratory", onsetDate: "2019-12-03", notes: "Two exacerbations in the last twelve months.", confirmed: false },
  { id: "dx-018", name: "Unspecified asthma, uncomplicated", icd10: "J45.909", category: "Respiratory", onsetDate: "2014-03-27", notes: "", confirmed: false },
  { id: "dx-019", name: "Allergic rhinitis, unspecified", icd10: "J30.9", category: "Respiratory", onsetDate: "2013-05-16", notes: "", confirmed: false },
  { id: "dx-020", name: "Obstructive sleep apnea", icd10: "G47.33", category: "Neurological", onsetDate: "2020-01-22", notes: "CPAP issued 2020. Compliance data not available at this visit.", confirmed: false },
  { id: "dx-021", name: "Migraine, unspecified, not intractable, without status migrainosus", icd10: "G43.909", category: "Neurological", onsetDate: "2019-08-30", notes: "", confirmed: false },
  { id: "dx-022", name: "Polyneuropathy, unspecified", icd10: "G62.9", category: "Neurological", onsetDate: "2022-11-14", notes: "Bilateral lower extremity. Monofilament testing abnormal.", confirmed: false },
  { id: "dx-023", name: "Major depressive disorder, single episode, unspecified", icd10: "F32.9", category: "Mental Health", onsetDate: "2021-02-08", notes: "", confirmed: false },
  { id: "dx-024", name: "Generalized anxiety disorder", icd10: "F41.1", category: "Mental Health", onsetDate: "2021-02-08", notes: "", confirmed: false },
  { id: "dx-025", name: "Primary insomnia", icd10: "F51.01", category: "Mental Health", onsetDate: "2023-04-19", notes: "Sleep hygiene counselling provided.", confirmed: false },
  { id: "dx-026", name: "Gastro-esophageal reflux disease without esophagitis", icd10: "K21.9", category: "Digestive", onsetDate: "2018-10-25", notes: "", confirmed: false },
  { id: "dx-027", name: "Diverticulosis of large intestine without perforation or abscess", icd10: "K57.30", category: "Digestive", onsetDate: "2022-05-06", notes: "", confirmed: false },
  { id: "dx-028", name: "Constipation, unspecified", icd10: "K59.00", category: "Digestive", onsetDate: "2023-01-30", notes: "", confirmed: false },
  { id: "dx-029", name: "Unilateral primary osteoarthritis, right knee", icd10: "M17.11", category: "Musculoskeletal", onsetDate: "2020-07-13", notes: "Surgical consult declined by patient.", confirmed: false },
  { id: "dx-030", name: "Primary osteoarthritis, right hand", icd10: "M19.041", category: "Musculoskeletal", onsetDate: "2022-09-27", notes: "", confirmed: false },
  { id: "dx-031", name: "Age-related osteoporosis without current pathological fracture", icd10: "M81.0", category: "Musculoskeletal", onsetDate: "2021-11-08", notes: "DEXA due. Last study 2021.", confirmed: false },
  { id: "dx-032", name: "Fibromyalgia", icd10: "M79.7", category: "Musculoskeletal", onsetDate: "2018-01-16", notes: "", confirmed: false },
  { id: "dx-033", name: "Pain in right shoulder", icd10: "M25.511", category: "Musculoskeletal", onsetDate: "2023-06-11", notes: "", confirmed: false },
  { id: "dx-034", name: "Cellulitis of right lower limb", icd10: "L03.115", category: "Integumentary", onsetDate: "2023-02-14", notes: "Resolved with a ten-day course of oral antibiotics.", confirmed: false },
  { id: "dx-035", name: "Psoriasis, unspecified", icd10: "L40.9", category: "Integumentary", onsetDate: "2017-09-02", notes: "", confirmed: false },
  { id: "dx-036", name: "Dermatitis, unspecified", icd10: "L30.9", category: "Integumentary", onsetDate: "2022-04-25", notes: "", confirmed: false },
  { id: "dx-037", name: "Age-related nuclear cataract, bilateral", icd10: "H25.13", category: "Sensory", onsetDate: "2021-05-19", notes: "Ophthalmology following. Surgery not yet scheduled.", confirmed: false },
  { id: "dx-038", name: "Primary open-angle glaucoma, stage unspecified", icd10: "H40.11X0", category: "Sensory", onsetDate: "2019-08-10", notes: "", confirmed: false },
  { id: "dx-039", name: "Sensorineural hearing loss, bilateral", icd10: "H90.3", category: "Sensory", onsetDate: "2020-10-28", notes: "", confirmed: false },
  { id: "dx-040", name: "Hypothyroidism, unspecified", icd10: "E03.9", category: "Endocrine", onsetDate: "2017-10-01", notes: "TSH checked annually.", confirmed: false },
  { id: "dx-041", name: "Obesity, unspecified", icd10: "E66.9", category: "Metabolic", onsetDate: "2016-06-08", notes: "", confirmed: false },
  { id: "dx-042", name: "Anemia, unspecified", icd10: "D64.9", category: "Hematologic", onsetDate: "2022-02-21", notes: "", confirmed: false },
  { id: "dx-043", name: "Iron deficiency anemia, unspecified", icd10: "D50.9", category: "Hematologic", onsetDate: "2023-03-09", notes: "Oral iron started. Repeat CBC pending.", confirmed: false },
  { id: "dx-044", name: "Long term (current) use of insulin", icd10: "Z79.4", category: "Other Factors", onsetDate: "2020-03-10", notes: "", confirmed: false },
  { id: "dx-045", name: "Personal history of nicotine dependence", icd10: "Z87.891", category: "Other Factors", onsetDate: "2010-01-01", notes: "Quit 2010. Approximately 20 pack-year history.", confirmed: false },
  { id: "dx-046", name: "Prediabetes", icd10: "R73.03", category: "Endocrine", onsetDate: "2015-05-20", notes: "", confirmed: false },
  { id: "dx-047", name: "Dizziness and giddiness", icd10: "R42", category: "Symptoms and Signs", onsetDate: "2023-07-05", notes: "", confirmed: false },
  { id: "dx-048", name: "Headache, unspecified", icd10: "R51.9", category: "Symptoms and Signs", onsetDate: "2022-12-01", notes: "", confirmed: false },
  { id: "dx-049", name: "Shortness of breath", icd10: "R06.02", category: "Symptoms and Signs", onsetDate: "2023-08-16", notes: "On exertion only. Cardiology workup unremarkable.", confirmed: false },
  { id: "dx-050", name: "Frequency of micturition", icd10: "R35.0", category: "", onsetDate: "2023-05-23", notes: "", confirmed: false },
  { id: "dx-051", name: "Primary generalized osteoarthritis", icd10: "M15.0", category: "", onsetDate: "2019-03-12", notes: "", confirmed: false },
  { id: "dx-052", name: "Presence of right artificial knee joint", icd10: "Z96.651", category: "", onsetDate: "2021-07-30", notes: "Right total knee arthroplasty, 2021.", confirmed: false },
];

/**
 * Assign statuses from the raw CCDA list. For each ICD-10 code, the row with
 * the most recent onset date gets "active" — that is the nurse's working list
 * for the AWV. Older duplicates of the same code get "resolved."
 * When two rows share the same ICD-10 AND the same onset date, the first one
 * by array order wins (stable tiebreak).
 */
/**
 * ICD-10 codes for acute or self-limiting conditions that should not appear
 * in the AWV active confirmation list. A healed broken arm, a resolved
 * cellulitis — the nurse does not need to confirm these with the patient.
 * In production this will be driven by the CCDA's own clinical status;
 * for the prototype we hardcode the obvious cases in the mock data.
 */
const RESOLVED_ACUTE_CODES = new Set([
  "L03.115",  // Cellulitis — resolved per notes
  "R52",      // Pain, unspecified — transient symptom
  "R42",      // Dizziness — transient symptom
  "R51.9",    // Headache, unspecified — transient symptom
  "R35.0",    // Frequency of micturition — transient symptom
]);

function initDiagnoses(raw: Omit<Diagnosis, "status">[]): Diagnosis[] {
  // Find the most recent onset date for each ICD-10 code
  const latestByCode = new Map<string, string>();
  for (const d of raw) {
    const prev = latestByCode.get(d.icd10);
    if (!prev || d.onsetDate > prev) {
      latestByCode.set(d.icd10, d.onsetDate);
    }
  }
  // Assign statuses: acute/resolved conditions forced to "resolved",
  // duplicate ICD-10 codes keep only the most recent as "active"
  const seen = new Set<string>();
  return raw.map((d) => {
    if (RESOLVED_ACUTE_CODES.has(d.icd10)) {
      return { ...d, status: "resolved" as const };
    }
    const isLatest = d.onsetDate === latestByCode.get(d.icd10) && !seen.has(d.icd10);
    if (isLatest) seen.add(d.icd10);
    return { ...d, status: isLatest ? "active" as const : "resolved" as const };
  });
}

const DIAGNOSES: Diagnosis[] = initDiagnoses(RAW_DIAGNOSES);

// ---------------------------------------------------------------------------
// Labs data — from HIE results in the CCDA
// ---------------------------------------------------------------------------

type LabStatus = "Normal" | "Abnormal";

interface Lab {
  id: string;
  name: string;
  code: string;
  category: string;
  value: string;
  unit: string;
  refRange: string;
  status: LabStatus;
  date: string;
  source: string;
  confirmed: boolean;
}

const LABS: Lab[] = [
  // Statins
  { id: "lab-001", name: "ALT (SGPT)", code: "1742-6", category: "Statins", value: "28", unit: "U/L", refRange: "7–56", status: "Normal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-002", name: "AST (SGOT)", code: "1920-8", category: "Statins", value: "22", unit: "U/L", refRange: "10–40", status: "Normal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-003", name: "CK (Creatine Kinase)", code: "2157-6", category: "Statins", value: "110", unit: "U/L", refRange: "22–198", status: "Normal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  // A1C
  { id: "lab-004", name: "Hemoglobin A1c", code: "4548-4", category: "A1C", value: "8.2", unit: "%", refRange: "<5.7", status: "Abnormal", date: "2023-09-12", source: "Freeman Clinic (CW)", confirmed: false },
  // TSH
  { id: "lab-005", name: "Thyroid Stimulating Hormone (TSH)", code: "11580-8", category: "TSH", value: "2.1", unit: "mIU/L", refRange: "0.4–4.0", status: "Normal", date: "2023-01-10", source: "Freeman Clinic (CW)", confirmed: false },
  // Lipid Panel
  { id: "lab-006", name: "Total Cholesterol", code: "2093-3", category: "Lipid Panel", value: "242", unit: "mg/dL", refRange: "<200", status: "Abnormal", date: "2023-04-20", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-007", name: "LDL Cholesterol", code: "2089-1", category: "Lipid Panel", value: "158", unit: "mg/dL", refRange: "<100", status: "Abnormal", date: "2023-04-20", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-008", name: "HDL Cholesterol", code: "2085-9", category: "Lipid Panel", value: "52", unit: "mg/dL", refRange: ">40", status: "Normal", date: "2023-04-20", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-009", name: "Triglycerides", code: "2571-8", category: "Lipid Panel", value: "210", unit: "mg/dL", refRange: "<150", status: "Abnormal", date: "2023-04-20", source: "Freeman Clinic (CW)", confirmed: false },
  // Renal Function
  { id: "lab-010", name: "Blood Urea Nitrogen (BUN)", code: "3094-0", category: "Renal Function", value: "18", unit: "mg/dL", refRange: "6–20", status: "Normal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-011", name: "Creatinine", code: "2160-0", category: "Renal Function", value: "1.4", unit: "mg/dL", refRange: "0.7–1.3", status: "Abnormal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-012", name: "eGFR", code: "33914-3", category: "Renal Function", value: "52", unit: "mL/min", refRange: ">60", status: "Abnormal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  // Bone Density (Bisphosphonates)
  { id: "lab-013", name: "Serum Calcium (corrected)", code: "17861-6", category: "Bone Density", value: "9.4", unit: "mg/dL", refRange: "8.5–10.5", status: "Normal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-014", name: "Vitamin D 25-OH", code: "62292-8", category: "Bone Density", value: "18", unit: "ng/mL", refRange: "30–100", status: "Abnormal", date: "2022-11-14", source: "Freeman Clinic (CW)", confirmed: false },
  // Comprehensive Metabolic Panel
  { id: "lab-015", name: "Comprehensive Metabolic Panel (CMP)", code: "24323-8", category: "CMP", value: "—", unit: "", refRange: "—", status: "Abnormal", date: "2022-12-01", source: "Freeman Clinic (CW)", confirmed: false },
  // Electrolytes
  { id: "lab-016", name: "Sodium", code: "2951-2", category: "Electrolytes", value: "140", unit: "mEq/L", refRange: "136–145", status: "Normal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-017", name: "Potassium", code: "6298-4", category: "Electrolytes", value: "4.2", unit: "mEq/L", refRange: "3.5–5.0", status: "Normal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-018", name: "Chloride", code: "2075-0", category: "Electrolytes", value: "101", unit: "mEq/L", refRange: "98–106", status: "Normal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-019", name: "CO2 (Bicarbonate)", code: "1963-8", category: "Electrolytes", value: "24", unit: "mEq/L", refRange: "23–29", status: "Normal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  { id: "lab-020", name: "Magnesium", code: "19123-9", category: "Electrolytes", value: "2.0", unit: "mg/dL", refRange: "1.7–2.2", status: "Normal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  // Fasting Glucose
  { id: "lab-021", name: "Fasting Glucose", code: "2345-7", category: "Fasting Glucose", value: "162", unit: "mg/dL", refRange: "70–100", status: "Abnormal", date: "2023-06-15", source: "Freeman Clinic (CW)", confirmed: false },
  // Lipid Profile (duplicate intentional — separate order context from panel)
  { id: "lab-022", name: "Lipid Profile", code: "24331-1", category: "Lipid Profile", value: "—", unit: "", refRange: "—", status: "Abnormal", date: "2023-04-20", source: "Freeman Clinic (CW)", confirmed: false },
  // Hypertension
  { id: "lab-023", name: "Blood Pressure (BP)", code: "", category: "Hypertension", value: "148/92", unit: "mmHg", refRange: "<130/80", status: "Abnormal", date: "2023-09-24", source: "Freeman Clinic (CW)", confirmed: false },
];

type LabSortCol = "name" | "code" | "category" | "value" | "date" | "source";

function labSortKey(l: Lab, col: LabSortCol): string {
  switch (col) {
    case "name": return l.name.toLowerCase();
    case "code": return l.code.toLowerCase();
    case "category": return l.category.toLowerCase();
    case "value": return l.status.toLowerCase();
    case "date": return l.date;
    case "source": return l.source.toLowerCase();
  }
}

// ---------------------------------------------------------------------------
// HEDIS Measures data — identified gaps for this patient
// ---------------------------------------------------------------------------

interface HedisMeasure {
  id: string;
  measure: string;
  code: string;
  category: string;
  status: "Open" | "Closed";
  dueDate: string;
  notes: string;
  confirmed: boolean;
  selfReportAllowed: boolean;
  selfReportValue: string;
}

/**
 * Full HEDIS measures for this patient. selfReportAllowed is driven by the
 * shared config so it stays in sync with Settings. The .filter at the end
 * removes any measure not enabled in the control card.
 */
const ALL_PATIENT_HEDIS: HedisMeasure[] = [
  { id: "hm-001", measure: "Controlling High Blood Pressure", code: "CBP", category: "Cardiovascular", status: "Open", dueDate: "2024-12-31", notes: "Last BP 160/78 on 10/06. Target < 140/90.", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-002", measure: "Statin Therapy for Patients with Cardiovascular Disease", code: "SPC", category: "Cardiovascular", status: "Open", dueDate: "2024-12-31", notes: "On atorvastatin 40mg. Adherence check needed.", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-003", measure: "Hemoglobin A1c Control for Patients with Diabetes", code: "HBD", category: "Diabetes", status: "Open", dueDate: "2024-12-31", notes: "Last A1c abnormal 2023-09-12.", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-004", measure: "Eye Exam for Patients with Diabetes", code: "EED", category: "Diabetes", status: "Open", dueDate: "2024-12-31", notes: "No documented retinal exam in last 2 years.", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-005", measure: "Kidney Health Evaluation for Patients with Diabetes", code: "KED", category: "Diabetes", status: "Open", dueDate: "2024-12-31", notes: "eGFR abnormal. Nephrology following.", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-006", measure: "Colorectal Cancer Screening", code: "COL", category: "Cancer Screening", status: "Open", dueDate: "2024-12-31", notes: "", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-007", measure: "Breast Cancer Screening", code: "BCS", category: "Cancer Screening", status: "Closed", dueDate: "2024-12-31", notes: "Mammogram completed 2023-08.", confirmed: true, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-008", measure: "Osteoporosis Management in Women Who Had a Fracture", code: "OMW", category: "Musculoskeletal", status: "Open", dueDate: "2024-12-31", notes: "DEXA due. Last study 2021.", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-009", measure: "Use of High-Risk Medications in Older Adults", code: "DAE", category: "Medication Safety", status: "Open", dueDate: "2024-12-31", notes: "", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-010", measure: "Statin Therapy for Patients with Diabetes", code: "SPD", category: "Diabetes", status: "Closed", dueDate: "2024-12-31", notes: "On atorvastatin.", confirmed: true, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-011", measure: "Medication Reconciliation Post-Discharge", code: "MRP", category: "Transitions of Care", status: "Open", dueDate: "2024-12-31", notes: "", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-012", measure: "Plan All-Cause Readmissions", code: "PCR", category: "Transitions of Care", status: "Open", dueDate: "2024-12-31", notes: "", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-013", measure: "Follow-Up After ED Visit for Mental Illness", code: "FUM", category: "Behavioral Health", status: "Open", dueDate: "2024-12-31", notes: "MDD and GAD documented.", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-014", measure: "Antidepressant Medication Management", code: "AMM", category: "Behavioral Health", status: "Open", dueDate: "2024-12-31", notes: "On sertraline 50mg.", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-015", measure: "Depression Screening and Follow-Up", code: "DSF", category: "Behavioral Health", status: "Open", dueDate: "2024-12-31", notes: "MDD and GAD documented. PHQ-2/PHQ-9 due.", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
  { id: "hm-016", measure: "Pharmacotherapy Management of COPD Exacerbation", code: "PCE", category: "Respiratory", status: "Open", dueDate: "2024-12-31", notes: "Two exacerbations in last 12 months.", confirmed: false, selfReportAllowed: false, selfReportValue: "" },
];

/**
 * Build the patient's HEDIS list from persisted Settings.
 * Called inside the component so it reads localStorage at render time.
 */
function buildPatientHedis(): HedisMeasure[] {
  const enabled = getEnabledHedisCodes();
  const sr = getSelfReportCodes();
  return ALL_PATIENT_HEDIS
    .filter((m) => enabled.has(m.code))
    .map((m) => ({ ...m, selfReportAllowed: sr.has(m.code) }));
}

type HedisSortCol = "measure" | "code" | "category" | "status" | "dueDate";

function hedisSortKey(h: HedisMeasure, col: HedisSortCol): string {
  switch (col) {
    case "measure": return h.measure.toLowerCase();
    case "code": return h.code.toLowerCase();
    case "category": return h.category.toLowerCase();
    case "status": return h.status.toLowerCase();
    case "dueDate": return h.dueDate;
  }
}

/** The sortable diagnostics columns. Notes is absent on purpose — it is not sortable. */
type DxSortCol = "name" | "icd10" | "status" | "category" | "onsetDate";

/** Every diagnostics sort key is a string, so one comparator covers all five columns. */
function dxSortKey(d: Diagnosis, col: DxSortCol): string {
  switch (col) {
    case "name": return d.name.toLowerCase();
    case "icd10": return d.icd10.toLowerCase();
    case "status": return d.status;
    case "category": return d.category.toLowerCase();
    case "onsetDate": return d.onsetDate;
  }
}

/** Numbered pages shown at once before the pager starts eliding. */
const DX_PAGE_WINDOW = 5;

/**
 * Production's pager form — `1 2 3 4 5 … 7` — as a sliding window rather than a
 * fixed prefix.
 *
 * The medication pager renders `.slice(0, 5)` of the page list, so with seven
 * pages there is no numbered button for 6 or 7 at all. Production's ellipsis
 * form is better but a static `1 2 3 4 5 … 7` still leaves 6 unreachable by
 * number. This window slides with the current page, so every page is reachable
 * through numbered controls alone: at page 1 it renders production's exact form,
 * and by page 5 it has become `1 … 3 4 5 6 7`.
 */
function dxPageButtons(current: number, total: number): (number | "gap")[] {
  if (total <= DX_PAGE_WINDOW) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const start = Math.min(Math.max(current - 2, 1), total - (DX_PAGE_WINDOW - 1));
  const end = start + DX_PAGE_WINDOW - 1;
  const out: (number | "gap")[] = [];
  if (start > 1) {
    out.push(1);
    if (start > 2) out.push("gap");
  }
  for (let p = start; p <= end; p += 1) out.push(p);
  if (end < total) {
    if (end < total - 1) out.push("gap");
    out.push(total);
  }
  return out;
}

/**
 * GL-003 §10.6 focus indicator — 2px solid ring at 2px offset, bound to
 * `:focus-visible`, never alpha-tinted and never the user-agent default.
 *
 * Authored as a stylesheet rather than inline `style` because `:focus-visible`
 * is a pseudo-class and an inline style object cannot express one. The
 * alternative already in this file — `onFocus` / `onBlur` handlers writing
 * `element.style.outline` — binds to `:focus`, which paints the ring on mouse
 * clicks too. §10.6 rule 3 names that as the reason developers strip focus
 * styling in the first place.
 *
 * Values interpolate from the token module, so there is no hex literal here.
 * One idiom, two surfaces: navy on light, white on the navy header (§10.6
 * selection rule — the ring must clear 3:1 against the surface behind it).
 */
const DX_FOCUS_CSS = `
.dx-focusable:focus-visible {
  outline: ${CTH_FOCUS.width} solid ${CTH_FOCUS.ring};
  outline-offset: ${CTH_FOCUS.offset};
}
.dx-focusable-inverse:focus-visible {
  outline: ${CTH_FOCUS.width} solid ${CTH_FOCUS.ringInverse};
  outline-offset: ${CTH_FOCUS.offset};
}
`;

const DX_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Focus management for a modal surface: move focus in on open, keep Tab inside
 * it, close on Escape, and hand focus back to whatever opened it.
 *
 * GL-003 §10.6 governs how a focus ring looks; it does not govern where focus is
 * allowed to go. A correctly-styled ring painted on a control behind an open
 * modal is a correct indicator on the wrong element, so the two ship together.
 *
 * `suspended` is how a stacked surface takes the keyboard without this hook
 * tearing down. Both listeners live on `document`, and the parent registers
 * first, so the parent would otherwise always win the Tab key. While the Notes
 * sub-modal is open the parent suspends instead of unmounting — which also
 * means focus is not yanked back to the top of the table when the sub-modal
 * closes.
 *
 * Deliberately NOT applied to the medication modal. FR-DS-005: diagnostics
 * implements this correctly; back-porting is a separate, parked item.
 */
function useModalFocus(
  panelRef: React.RefObject<HTMLDivElement>,
  active: boolean,
  suspended: boolean,
  onDismiss: () => void,
): void {
  const suspendedRef = useRef(suspended);
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    suspendedRef.current = suspended;
    dismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!active) return;
    const panel = panelRef.current;
    if (!panel) return;

    const restoreTo = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(DX_FOCUSABLE_SELECTOR)).filter(
        (el) => el.getClientRects().length > 0,
      );

    if (!panel.contains(document.activeElement)) {
      (focusables()[0] ?? panel).focus();
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (suspendedRef.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        dismissRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const outside = !current || !panel.contains(current);
      if (e.shiftKey && (outside || current === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (outside || current === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (restoreTo && document.contains(restoreTo)) restoreTo.focus();
    };
  }, [panelRef, active]);
}

const PatientAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabName>("Notes to Provider");
  const [showMedModal, setShowMedModal] = useState(false);
  const [analysisVital, setAnalysisVital] = useState<VitalKey | null>(null);
  const [patientInfoCollapsed, setPatientInfoCollapsed] = useState(false);
  const [instructionsModal, setInstructionsModal] = useState<string | null>(null);
  const [showReconcileConfirm, setShowReconcileConfirm] = useState(false);
  const [medReconciled, setMedReconciled] = useState(false);
  const [medFilter, setMedFilter] = useState<"active" | "stopped" | "completed" | "unconfirmed" | "all">("active");
  const [medPage, setMedPage] = useState(1);
  const [meds, setMeds] = useState<Medication[]>(MEDICATIONS);
  const [medSort, setMedSort] = useState<{ col: string; dir: "asc" | "desc" } | null>(null);
  const [medSearch, setMedSearch] = useState("");
  const [medSearchOpen, setMedSearchOpen] = useState(false);
  const medRowsPerPage = 8;

  // --- Diagnostics Review ---------------------------------------------------
  // Deliberately parallel to the medication state above rather than shared.
  // PRD §0.3 accepts the duplication so both surfaces can be lifted onto one
  // data layer in a single later move; extracting one of them now would leave a
  // half-shared abstraction that is harder to finish than either half.
  const [showDxModal, setShowDxModal] = useState(false);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(DIAGNOSES);
  const [dxSort, setDxSort] = useState<{ col: DxSortCol; dir: "asc" | "desc" } | null>(null);
  const [dxSearch, setDxSearch] = useState("");
  const [dxSearchOpen, setDxSearchOpen] = useState(false);
  const [dxPage, setDxPage] = useState(1);
  const [dxRowsPerPage, setDxRowsPerPage] = useState(8);
  const [dxNote, setDxNote] = useState<string | null>(null);
  const [dxFilter, setDxFilter] = useState<DiagnosisStatus | "all">("active");
  const [showDxReconcileConfirm, setShowDxReconcileConfirm] = useState(false);
  const [dxReconciled, setDxReconciled] = useState(false);
  const dxPanelRef = useRef<HTMLDivElement | null>(null);
  const dxNotePanelRef = useRef<HTMLDivElement | null>(null);

  // --- Labs Review -----------------------------------------------------------
  const [showLabsModal, setShowLabsModal] = useState(false);
  const [labs, setLabs] = useState<Lab[]>(LABS);
  const [labSort, setLabSort] = useState<{ col: LabSortCol; dir: "asc" | "desc" } | null>(null);
  const [labSearch, setLabSearch] = useState("");
  const [labSearchOpen, setLabSearchOpen] = useState(false);
  const [labPage, setLabPage] = useState(1);
  const labRowsPerPage = 8;
  const [labFilter, setLabFilter] = useState<LabStatus | "All">("All");
  const [labsReviewed, setLabsReviewed] = useState(false);
  const [showLabOrderConfirm, setShowLabOrderConfirm] = useState(false);
  const labPanelRef = useRef<HTMLDivElement | null>(null);

  // --- HEDIS Measures --------------------------------------------------------
  const [showHedisModal, setShowHedisModal] = useState(false);
  const [hedisMeasures, setHedisMeasures] = useState<HedisMeasure[]>(buildPatientHedis);
  const [hedisSort, setHedisSort] = useState<{ col: HedisSortCol; dir: "asc" | "desc" } | null>(null);
  const [hedisSearch, setHedisSearch] = useState("");
  const [hedisSearchOpen, setHedisSearchOpen] = useState(false);
  const [hedisPage, setHedisPage] = useState(1);
  const hedisRowsPerPage = 20;
  const [hedisFilter, setHedisFilter] = useState<"Open" | "Closed" | "All">("All");
  const [hedisNote, setHedisNote] = useState<string | null>(null);
  const [selfReportEdit, setSelfReportEdit] = useState<{ id: string; measure: string; value: string } | null>(null);
  const hedisPanelRef = useRef<HTMLDivElement | null>(null);
  const hedisNotePanelRef = useRef<HTMLDivElement | null>(null);

  // --- EED Form Modal -------------------------------------------------------
  const [showEEDModal, setShowEEDModal] = useState(false);
  const [eedSubmitted, setEedSubmitted] = useState(false);

  // --- Emergency (911) Modal --------------------------------------------------
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  // Mirrors the literal demo values already rendered in the Patient Info
  // Header below — not a fetch, not a new data source. There is no shared
  // patient data object/state on this page today (the header renders these
  // as hardcoded JSX literals); this const exists so the modal can reuse the
  // same values without duplicating them a second time inline. Felix flag:
  // if a real patient object lands later, wire this from that instead.
  const patientDispatchInfo = {
    name: "Johnny Appleseed",
    dob: "1976-07-25",
    address: "123 Orchard Street",
    cityStateZip: "Grove, South Dakota, SD, 57223",
    homePhone: "6053101479",
    mobilePhone: "6053101479",
  };

  // The tab strip scrolls horizontally and macOS overlay scrollbars are invisible
  // at rest, so the only cue that more tabs exist is an edge fade. Track which
  // edge can still scroll so the fade only ever appears where there is more to see.
  const tabScrollerRef = useRef<HTMLDivElement | null>(null);
  const [tabScroll, setTabScroll] = useState<{ atStart: boolean; atEnd: boolean }>({
    atStart: true,
    atEnd: true,
  });

  const syncTabScroll = useCallback(() => {
    const el = tabScrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setTabScroll((prev) => {
      const atStart = el.scrollLeft <= 1;
      const atEnd = el.scrollLeft >= maxScroll - 1;
      return prev.atStart === atStart && prev.atEnd === atEnd ? prev : { atStart, atEnd };
    });
  }, []);

  useEffect(() => {
    const el = tabScrollerRef.current;
    if (!el) return;
    syncTabScroll();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(syncTabScroll);
    observer.observe(el);
    return () => observer.disconnect();
  }, [syncTabScroll]);

  const tabMask = `linear-gradient(to right, ${
    tabScroll.atStart ? "#000 0px" : "transparent 0px, #000 24px"
  }, ${tabScroll.atEnd ? "#000 100%" : "#000 calc(100% - 24px), transparent 100%"})`;

  // Stable identity: VitalsAnalysisModal keys its focus-management effect on this,
  // so an inline arrow here would re-run the effect on every parent render and
  // pull focus back to the close button mid-interaction.
  const closeAnalysis = useCallback(() => setAnalysisVital(null), []);

  const filteredMeds = (() => {
    let list = meds.filter((m) => {
      if (medFilter !== "all" && m.status !== medFilter) return false;
      if (medSearch && !m.name.toLowerCase().includes(medSearch.toLowerCase())) return false;
      return true;
    });
    if (medSort) {
      list = [...list].sort((a, b) => {
        let va: string | number | boolean, vb: string | number | boolean;
        switch (medSort.col) {
          case "name": va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
          case "status": va = a.status; vb = b.status; break;
          case "dosage": va = a.dosage.toLowerCase(); vb = b.dosage.toLowerCase(); break;
          case "frequency": va = a.frequency.toLowerCase(); vb = b.frequency.toLowerCase(); break;
          case "startDate": va = a.startDate; vb = b.startDate; break;
          case "confirmed": va = a.confirmed ? 1 : 0; vb = b.confirmed ? 1 : 0; break;
          default: va = ""; vb = "";
        }
        if (va < vb) return medSort.dir === "asc" ? -1 : 1;
        if (va > vb) return medSort.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  })();
  const activeMeds = meds.filter((m) => m.status === "active");
  const confirmedCount = activeMeds.filter((m) => m.confirmed).length;
  const activeTotal = activeMeds.length;
  const totalMedPages = Math.max(1, Math.ceil(filteredMeds.length / medRowsPerPage));
  const pagedMeds = filteredMeds.slice((medPage - 1) * medRowsPerPage, medPage * medRowsPerPage);
  const allPagedChecked = pagedMeds.length > 0 && pagedMeds.every((m) => m.confirmed);

  const toggleMedSort = (col: string) => {
    setMedSort((prev) => {
      if (prev?.col === col) return prev.dir === "asc" ? { col, dir: "desc" } : null;
      return { col, dir: "asc" };
    });
  };

  const toggleSelectAll = () => {
    const names = pagedMeds.map((m) => m.name + m.startDate);
    const newVal = !allPagedChecked;
    setMeds((prev) => prev.map((m) => names.includes(m.name + m.startDate) ? { ...m, confirmed: newVal } : m));
  };

  // --- Diagnostics: derived state ------------------------------------------
  //
  // Search spans name AND ICD-10 code: a coder searching "M54" is doing the same
  // job as a clinician searching "back pain", and the code column is the one a
  // reviewer can read off a claim.
  //
  // The sort carries a deterministic `id` tiebreak. That is not cosmetic. Every
  // Status value in this dataset is the empty string (DB-Q1), so a Status sort
  // compares 52 identical keys; without a tiebreak the row order after a sort is
  // whatever the engine's sort happens to produce, and a checked row appears to
  // move to a different diagnosis. Checkbox state is keyed on `id`, so nothing
  // is actually mis-assigned — but "looks mis-assigned" is indistinguishable
  // from "is mis-assigned" to a reviewer signing off on a chart.
  const filteredDx = (() => {
    const q = dxSearch.trim().toLowerCase();
    let list = diagnoses.filter((d) => {
      if (dxFilter !== "all" && d.status !== dxFilter) return false;
      if (q && !d.name.toLowerCase().includes(q) && !d.icd10.toLowerCase().includes(q)) return false;
      return true;
    });
    if (dxSort) {
      const dir = dxSort.dir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        const va = dxSortKey(a, dxSort.col);
        const vb = dxSortKey(b, dxSort.col);
        if (va < vb) return -dir;
        if (va > vb) return dir;
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      });
    }
    return list;
  })();

  const totalDxPages = Math.max(1, Math.ceil(filteredDx.length / dxRowsPerPage));
  // Clamp on read rather than correcting state in an effect: filtering to a
  // shorter list while on a high page must not render one empty frame first.
  const dxPageSafe = Math.min(Math.max(dxPage, 1), totalDxPages);
  const pagedDx = filteredDx.slice((dxPageSafe - 1) * dxRowsPerPage, dxPageSafe * dxRowsPerPage);
  const allPagedDxChecked = pagedDx.length > 0 && pagedDx.every((d) => d.confirmed);

  // FR-CNT-001/002 — the denominator, named on purpose.
  //
  // The medication card reads "0 of 0" whenever the confirmed count and the
  // total are computed over different populations: the numerator is scoped to a
  // status ("active"), the rendered table is not, so a table full of rows can
  // sit under a zero total. The fix is not a bigger number, it is one scope for
  // both halves. `dxDenominatorScope` IS that scope — numerator and denominator
  // are both read from it, so they cannot diverge, and re-scoping later (once
  // DB-Q1 gives Status real values) is this one line.
  const dxDenominatorScope = diagnoses.filter((d) => d.status === "active");
  const dxTotal = dxDenominatorScope.length;
  const dxConfirmedCount = dxDenominatorScope.filter((d) => d.confirmed).length;
  // Live guard, not decoration. Today it can never fire — the scope is the full
  // list, so rows rendering implies a non-zero total. It becomes the safety net
  // the moment someone narrows the scope above: the card says so instead of
  // silently printing the "0 of 0" this modal exists to remove.
  const dxProgressIndeterminate = dxTotal === 0 && filteredDx.length > 0;

  // Every Status value in production is empty (§9 DB-Q1). Rendering a column of
  // em-dashes with no explanation reads as a load failure; saying so converts it
  // into information. Computed, not hard-coded, so it disappears by itself when
  // the source starts populating the field.
  const dxStatusReported = diagnoses.some((d) => d.status !== "");

  const toggleDxSort = (col: DxSortCol) => {
    setDxSort((prev) => {
      if (prev?.col === col) return prev.dir === "asc" ? { col, dir: "desc" } : null;
      return { col, dir: "asc" };
    });
  };

  // Page-scoped and id-keyed. The medication equivalent builds a `name + startDate`
  // key set, which on this data would toggle two different encounters of the same
  // ICD-10 code together (dx-003 / dx-005 are exactly that case).
  const toggleDxSelectAll = () => {
    const ids = new Set(pagedDx.map((d) => d.id));
    const next = !allPagedDxChecked;
    setDiagnoses((prev) => prev.map((d) => (ids.has(d.id) ? { ...d, confirmed: next } : d)));
  };

  const toggleDxConfirmed = (rowId: string) => {
    setDiagnoses((prev) => prev.map((d) => (d.id === rowId ? { ...d, confirmed: !d.confirmed } : d)));
  };

  const closeDxModal = useCallback(() => setShowDxModal(false), []);
  const closeDxNote = useCallback(() => setDxNote(null), []);
  useModalFocus(dxPanelRef, showDxModal, dxNote !== null, closeDxModal);
  useModalFocus(dxNotePanelRef, dxNote !== null, false, closeDxNote);

  // --- Labs: derived state ---------------------------------------------------
  const filteredLabs = (() => {
    const q = labSearch.trim().toLowerCase();
    let list = labs.filter((l) => {
      if (labFilter !== "All" && l.status !== labFilter) return false;
      if (q && !l.name.toLowerCase().includes(q) && !l.code.toLowerCase().includes(q)) return false;
      return true;
    });
    if (labSort) {
      const dir = labSort.dir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        const va = labSortKey(a, labSort.col);
        const vb = labSortKey(b, labSort.col);
        if (va < vb) return -dir;
        if (va > vb) return dir;
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      });
    }
    return list;
  })();

  const totalLabPages = Math.max(1, Math.ceil(filteredLabs.length / labRowsPerPage));
  const labPageSafe = Math.min(Math.max(labPage, 1), totalLabPages);
  const pagedLabs = filteredLabs.slice((labPageSafe - 1) * labRowsPerPage, labPageSafe * labRowsPerPage);
  const allPagedLabsChecked = pagedLabs.length > 0 && pagedLabs.every((l) => l.confirmed);
  const labTotal = labs.length;
  const labConfirmedCount = labs.filter((l) => l.confirmed).length;

  const toggleLabSort = (col: LabSortCol) => {
    setLabSort((prev) => {
      if (prev?.col === col) return prev.dir === "asc" ? { col, dir: "desc" } : null;
      return { col, dir: "asc" };
    });
  };

  const toggleLabSelectAll = () => {
    const ids = new Set(pagedLabs.map((l) => l.id));
    const next = !allPagedLabsChecked;
    setLabs((prev) => prev.map((l) => (ids.has(l.id) ? { ...l, confirmed: next } : l)));
  };

  const toggleLabConfirmed = (rowId: string) => {
    setLabs((prev) => prev.map((l) => (l.id === rowId ? { ...l, confirmed: !l.confirmed } : l)));
  };

  const closeLabsModal = useCallback(() => setShowLabsModal(false), []);
  useModalFocus(labPanelRef, showLabsModal, false, closeLabsModal);

  // --- HEDIS: derived state --------------------------------------------------
  const filteredHedis = (() => {
    const q = hedisSearch.trim().toLowerCase();
    let list = hedisMeasures.filter((h) => {
      if (hedisFilter !== "All" && h.status !== hedisFilter) return false;
      if (q && !h.measure.toLowerCase().includes(q) && !h.code.toLowerCase().includes(q)) return false;
      return true;
    });
    if (hedisSort) {
      const dir = hedisSort.dir === "asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        const va = hedisSortKey(a, hedisSort.col);
        const vb = hedisSortKey(b, hedisSort.col);
        if (va < vb) return -dir;
        if (va > vb) return dir;
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      });
    }
    return list;
  })();

  const totalHedisPages = Math.max(1, Math.ceil(filteredHedis.length / hedisRowsPerPage));
  const hedisPageSafe = Math.min(Math.max(hedisPage, 1), totalHedisPages);
  const pagedHedis = filteredHedis.slice((hedisPageSafe - 1) * hedisRowsPerPage, hedisPageSafe * hedisRowsPerPage);
  const allPagedHedisChecked = pagedHedis.length > 0 && pagedHedis.every((h) => h.confirmed);
  const hedisTotal = hedisMeasures.length;
  const hedisConfirmedCount = hedisMeasures.filter((h) => h.confirmed).length;

  const toggleHedisSort = (col: HedisSortCol) => {
    setHedisSort((prev) => {
      if (prev?.col === col) return prev.dir === "asc" ? { col, dir: "desc" } : null;
      return { col, dir: "asc" };
    });
  };

  const toggleHedisSelectAll = () => {
    const ids = new Set(pagedHedis.map((h) => h.id));
    const next = !allPagedHedisChecked;
    setHedisMeasures((prev) => prev.map((h) => (ids.has(h.id) ? { ...h, confirmed: next } : h)));
  };

  const toggleHedisConfirmed = (rowId: string) => {
    setHedisMeasures((prev) => prev.map((h) => (h.id === rowId ? { ...h, confirmed: !h.confirmed } : h)));
  };

  const closeHedisModal = useCallback(() => setShowHedisModal(false), []);
  const closeHedisNote = useCallback(() => setHedisNote(null), []);
  useModalFocus(hedisPanelRef, showHedisModal, hedisNote !== null, closeHedisModal);
  useModalFocus(hedisNotePanelRef, hedisNote !== null, false, closeHedisNote);

  return (
    <MainLayout breadcrumbs={[]}>
      <div style={{ maxWidth: "100%", overflow: "hidden" }}>
      {/* Top-right buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          SnapBP List
        </button>
        <button
          type="button"
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          SnapBP Call
        </button>
        <button
          type="button"
          style={{
            backgroundColor: "#fff",
            color: "#1e3a5f",
            border: "1px solid #1e3a5f",
            borderRadius: 4,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Files
        </button>
        <button
          type="button"
          aria-label="Prescribe medication"
          onClick={() => {
            // TODO: wire prescribe action
          }}
          style={{
            backgroundColor: "#fff",
            color: "#1e3a5f",
            border: "1px solid #1e3a5f",
            borderRadius: 4,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Prescribe
        </button>
        {/* GL-003 §10.5 requires every Brick-filled control to state its
            consequence in a second channel, never colour alone. The visible
            "911" already does that for a sighted US clinical user — strip the
            fill and the label still reads as an emergency. It is thinner read
            aloud, where a bare numeric can arrive as three digits with no verb,
            so the accessible name carries the verb. It contains the visible
            label verbatim, so WCAG 2.5.3 Label in Name still holds. */}
        <button
          type="button"
          aria-label="Call 911 emergency services"
          onClick={() => setShowEmergencyModal(true)}
          style={{
            backgroundColor: "#9b3a31",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          911
        </button>
      </div>

      {/* Patient Info Header */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #d1d5db",
          borderRadius: 6,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, minWidth: 0 }}>
          {/* Collapse arrow */}
          <button
            type="button"
            aria-label="Collapse patient info"
            onClick={() => setPatientInfoCollapsed(!patientInfoCollapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              color: "#374151",
              flexShrink: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              style={{ display: "block" }}
            >
              <path
                d={patientInfoCollapsed ? "M5 7.5l5 5 5-5" : "M5 12.5l5-5 5 5"}
                stroke="#374151"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Column 1 — Demographics */}
          <div style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.7, color: "#374151" }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Johnny Appleseed</span>
              {"  "}1976-07-25{"  "}49 Years Old{"  "}/{" "}Male
            </div>
            {!patientInfoCollapsed && <>
            <div>123 Orchard Street</div>
            <div>Grove, South Dakota, SD, 57223</div>
            <div>troy.belden@caretalkhealth.com</div>
            <div>H: 6053101479, M: 6053101479</div>
            </>}
          </div>

          {!patientInfoCollapsed && <>
          {/* Column 2 — Insurance */}
          <div style={{ flex: 0.7, minWidth: 0, fontSize: 13, lineHeight: 1.7, color: "#374151" }}>
            <div><span style={{ fontWeight: 600 }}>MBI:</span> 1TL1B72SD68</div>
            <div><span style={{ fontWeight: 600 }}>SSN:</span> 000-000-0000</div>
            <div><span style={{ fontWeight: 600 }}>Plan:</span> Medicare Part A and Part B</div>
          </div>

          {/* Column 3 — Provider */}
          <div style={{ flex: 0.8, minWidth: 0, fontSize: 13, lineHeight: 1.7, color: "#374151" }}>
            <div><span style={{ fontWeight: 600 }}>Initiating Provider:</span> Dr..Hogue</div>
            <div><span style={{ fontWeight: 600 }}>Initiating Visit:</span> 2026-04-22</div>
            <div><span style={{ fontWeight: 600 }}>Eligible AWV:</span> Yes</div>
            <div><span style={{ fontWeight: 600 }}>Patient Status:</span> Active</div>
          </div>

          {/* Column 4 — IDs + icons */}
          <div style={{ flex: 0.6, minWidth: 0, fontSize: 13, lineHeight: 1.7, color: "#374151", position: "relative" }}>
            <div><span style={{ fontWeight: 600 }}>Eligible Id:</span> 3303</div>
            <div><span style={{ fontWeight: 600 }}>Patient Id:</span> 78</div>
            <div>2026-04-22</div>
            <div style={{ position: "absolute", top: 0, right: 0, display: "flex", gap: 8 }}>
              <button
                type="button"
                aria-label="Edit patient"
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}
              >
                &#9998;
              </button>
              <button
                type="button"
                aria-label="Download PDF"
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}
              >
                &#128196;
              </button>
            </div>
          </div>
          </>}
        </div>
      </div>

      {/* Vitals row
          Blood Pressure carries a two-line value, so it sets the row height. The
          cards stay stretched to a common height (deliberate, not incidental) and
          each card is a column whose value row absorbs the leftover space and
          centres in it. That puts the value, date and glyph of all four cards on
          one shared horizontal line — the same line BP's date/glyph already sit
          on, centred between its two value lines — instead of leaving ~14px of
          dead space under the three short cards. */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 8, marginBottom: 12, minWidth: 0 }}>
        {VITAL_CARDS.map((vital) => (
          <div
            key={vital.title}
            style={{
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "4px 8px",
              backgroundColor: "#fff",
            }}
          >
            <div style={{ fontSize: 9, color: "#1e3a5f", fontWeight: 700, marginBottom: 1 }}>
              {vital.title}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flex: "1 1 auto" }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#111827", whiteSpace: "pre-line", lineHeight: 1.25 }}>{vital.value}</span>
              <span style={{ fontSize: 9, color: "#6b7280" }}>{vital.date}</span>
              <button
                type="button"
                aria-label={`View ${vital.title} analysis`}
                onClick={() => setAnalysisVital(vital.key)}
                onFocus={(e) => { e.currentTarget.style.outline = "2px solid #2563eb"; e.currentTarget.style.outlineOffset = "2px"; }}
                onBlur={(e) => { e.currentTarget.style.outline = "none"; }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  lineHeight: 0,
                  cursor: "pointer",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" style={{ display: "block" }}>
                  <rect x="0.5" y="9" width="3" height="5" rx="0.5" fill="#2563eb" />
                  <rect x="4.5" y="5" width="3" height="9" rx="0.5" fill="#2563eb" />
                  <rect x="8.5" y="8" width="3" height="6" rx="0.5" fill="#2563eb" />
                  <rect x="12.5" y="3" width="3" height="11" rx="0.5" fill="#2563eb" />
                  <line x1="0.5" y1="14.5" x2="15.5" y2="14.5" stroke="#1e3a5f" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {/* Toolbar icons — right side of vitals row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", flexShrink: 0 }}>
          <button type="button" title="Medication" onClick={() => setShowMedModal(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ display: "block" }}>
              <rect x="6" y="2" width="8" height="3" rx="1" stroke={medReconciled ? CTH_STATUS.success : "#4b5563"} strokeWidth="1.3" fill="none" />
              <path d="M5 5h10v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" stroke={medReconciled ? CTH_STATUS.success : "#4b5563"} strokeWidth="1.3" fill="none" />
              <line x1="7" y1="10" x2="13" y2="10" stroke={medReconciled ? CTH_STATUS.success : "#4b5563"} strokeWidth="1" />
              <text x="8" y="14.5" fontSize="5" fill={medReconciled ? CTH_STATUS.success : "#4b5563"} fontWeight="700" fontFamily="sans-serif">Rx</text>
            </svg>
          </button>
          <button
            type="button"
            title="Diagnosis"
            aria-label="Diagnosis"
            aria-haspopup="dialog"
            className="dx-focusable"
            onClick={() => setShowDxModal(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ display: "block" }}>
              <g transform="translate(0.4 0.798) scale(0.96)">
                <path d="M9.17 1.67v1.67" stroke={dxReconciled ? CTH_STATUS.success : "#4b5563"} strokeWidth="1.5625" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.17 1.67v1.67" stroke={dxReconciled ? CTH_STATUS.success : "#4b5563"} strokeWidth="1.5625" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.17 2.5H3.33a1.67 1.67 0 00-1.67 1.67v3.33a5 5 0 0010 0V4.17a1.67 1.67 0 00-1.67-1.67h-.83" stroke={dxReconciled ? CTH_STATUS.success : "#4b5563"} strokeWidth="1.5625" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.67 12.5a5 5 0 0010 0v-2.5" stroke={dxReconciled ? CTH_STATUS.success : "#4b5563"} strokeWidth="1.5625" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16.67" cy="8.33" r="1.67" stroke={dxReconciled ? CTH_STATUS.success : "#4b5563"} strokeWidth="1.5625" fill="none" />
              </g>
            </svg>
          </button>
          <button
            type="button"
            title="Labs"
            aria-label="Labs"
            aria-haspopup="dialog"
            onClick={() => setShowLabsModal(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ display: "block" }}>
              <path d="M7 2h6M8 2v5l-4.5 8a2 2 0 001.73 3h9.54a2 2 0 001.73-3L12 7V2" stroke={labsReviewed ? CTH_STATUS.success : "#4b5563"} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.5 13h7" stroke={labsReviewed ? CTH_STATUS.success : "#4b5563"} strokeWidth="1" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" title="Vitals" style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ display: "block" }}>
              <path d="M10 17s-7-4.5-7-9a4 4 0 017-2.5A4 4 0 0117 8c0 4.5-7 9-7 9z" stroke="#4b5563" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
          <button type="button" title="Images" style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ display: "block" }}>
              <rect x="2" y="3" width="16" height="14" rx="2" stroke="#4b5563" strokeWidth="1.5" fill="none" />
              <circle cx="7" cy="8" r="2" stroke="#4b5563" strokeWidth="1" fill="none" />
              <path d="M2 14l4-4 3 3 3-3 6 4" stroke="#4b5563" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
          <button type="button" title="Edit" style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ display: "block" }}>
              <path d="M12.5 3.5l4 4L6 18H2v-4L12.5 3.5z" stroke="#4b5563" strokeWidth="1.5" fill="none" />
              <line x1="10.5" y1="5.5" x2="14.5" y2="9.5" stroke="#4b5563" strokeWidth="1" />
            </svg>
          </button>
          <button type="button" title="Add" style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ display: "block" }}>
              <rect x="2" y="2" width="16" height="16" rx="2" stroke="#4b5563" strokeWidth="1.5" fill="none" />
              <line x1="10" y1="6" x2="10" y2="14" stroke="#4b5563" strokeWidth="1.5" />
              <line x1="6" y1="10" x2="14" y2="10" stroke="#4b5563" strokeWidth="1.5" />
            </svg>
          </button>
          <button type="button" title="HEDIS Measures" aria-label="HEDIS Measures" aria-haspopup="dialog" onClick={() => setShowHedisModal(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ display: "block" }}>
              <path d="M10 2L18 17H2L10 2z" stroke="#4b5563" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
              <line x1="10" y1="8" x2="10" y2="12" stroke="#4b5563" strokeWidth="1.5" />
              <circle cx="10" cy="14.5" r="0.75" fill="#4b5563" />
            </svg>
          </button>
        </div>
      </div>

      {/* Actions row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, minHeight: 26 }}>
          <span style={{ fontWeight: 600, fontSize: 13, lineHeight: 1, color: "#374151" }}>Actions</span>
          <button
            type="button"
            aria-label="Refresh actions"
            style={{
              display: "flex",
              alignItems: "center",
              background: "none",
              border: "none",
              padding: 0,
              lineHeight: 1,
              cursor: "pointer",
              fontSize: 14,
              color: "#6b7280",
            }}
          >
            &#8635;
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 6,
            flex: "1 1 auto",
            minWidth: 0,
          }}
        >
          {ACTION_PILLS.map((pill) => {
            const isActive = pill.label === "EED" ? eedSubmitted : pill.active;
            return (
              <span
                key={pill.label}
                role={pill.label === "EED" ? "button" : undefined}
                tabIndex={pill.label === "EED" ? 0 : undefined}
                aria-label={pill.label === "EED" ? "EED - Eye Exam for Patients with Diabetes" : undefined}
                onClick={pill.label === "EED" ? () => setShowEEDModal(true) : undefined}
                onKeyDown={pill.label === "EED" ? (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowEEDModal(true); } } : undefined}
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: 9999,
                  fontSize: 12,
                  lineHeight: "16px",
                  fontWeight: 600,
                  cursor: pill.label === "EED" ? "pointer" : "pointer",
                  backgroundColor: isActive ? CTH_STATUS.success : "#fff",
                  color: isActive ? "#fff" : "#374151",
                  border: isActive ? `1px solid ${CTH_STATUS.success}` : "1px solid #d1d5db",
                }}
              >
                {pill.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tabs row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #d1d5db",
          marginBottom: 0,
          gap: 0,
          minWidth: 0,
        }}
      >
        <div
          ref={tabScrollerRef}
          onScroll={syncTabScroll}
          style={{
            display: "flex",
            flex: 1,
            gap: 0,
            overflowX: "auto",
            minWidth: 0,
            maskImage: tabMask,
            WebkitMaskImage: tabMask,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid #1e3a5f" : "2px solid transparent",
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: activeTab === tab ? 700 : 400,
                color: activeTab === tab ? "#1e3a5f" : "#6b7280",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #d1d5db",
          borderTop: "none",
          borderRadius: "0 0 6px 6px",
          padding: 20,
          minHeight: 300,
        }}
      >
        {activeTab === "Notes to Provider" && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937", margin: "0 0 12px" }}>
              Notes:
            </h3>
            <label
              htmlFor="notes-visit"
              style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}
            >
              Q1: Notes for Visit:
            </label>
            <textarea
              id="notes-visit"
              rows={10}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: 4,
                padding: 10,
                fontSize: 13,
                resize: "vertical",
                fontFamily: "inherit",
              }}
            />
          </div>
        )}
        {activeTab !== "Notes to Provider" && (
          <div style={{ color: "#9ca3af", fontSize: 13, fontStyle: "italic" }}>
            {activeTab} content goes here.
          </div>
        )}
      </div>
      </div>

      {/* Vitals Analysis Modal — one component, driven by which glyph was clicked */}
      <VitalsAnalysisModal vital={analysisVital} onClose={closeAnalysis} />

      {/* Medication Review Modal */}
      {showMedModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 40,
          }}
          onClick={() => setShowMedModal(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              width: 1105,
              maxHeight: "calc(100vh - 80px)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: "#1e3a5f",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15 }}>Medication Review</span>
              <button
                type="button"
                onClick={() => setShowMedModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
              {/* Subtitle */}
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
                Review and confirm patient medications
              </div>

              {/* Progress bar */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Review Progress</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>
                    {confirmedCount} of {activeTotal} confirmed
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Completion</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb" }}>
                    {activeTotal > 0 ? ((confirmedCount / activeTotal) * 100).toFixed(1) : "0.0"}%
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setShowReconcileConfirm(true)}
                    style={{
                      backgroundColor: CTH_STATUS.success,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "7px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Reconcile
                  </button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: CTH_STATUS.success,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "7px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      marginRight: "auto",
                    }}
                  >
                    + Add Medication
                  </button>
                  <div style={{ position: "relative", marginRight: "auto" }}>
                    <input
                      type="text"
                      placeholder="Search medication..."
                      value={medSearch}
                      onChange={(e) => { setMedSearch(e.target.value); setMedPage(1); setMedSearchOpen(true); }}
                      onFocus={() => { if (medSearch) setMedSearchOpen(true); }}
                      onBlur={() => setTimeout(() => setMedSearchOpen(false), 200)}
                      style={{
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        padding: "7px 12px",
                        fontSize: 12,
                        width: 200,
                        outline: "none",
                      }}
                    />
                    {medSearch && medSearchOpen && filteredMeds.length > 0 && (
                      <div style={{
                        position: "absolute", top: "100%", left: 0, width: 360,
                        backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: 6,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)", maxHeight: 200, overflowY: "auto", zIndex: 10,
                      }}>
                        {filteredMeds.slice(0, 10).map((m, i) => (
                          <button
                            key={i}
                            type="button"
                            onMouseDown={() => {
                              const idx = meds.findIndex((med) => med.name === m.name && med.startDate === m.startDate);
                              if (idx !== -1) {
                                const pageNum = Math.floor(filteredMeds.findIndex((fm) => fm.name === m.name && fm.startDate === m.startDate) / medRowsPerPage) + 1;
                                setMedPage(pageNum);
                              }
                              setMedSearch(m.name);
                              setMedSearchOpen(false);
                            }}
                            style={{
                              display: "block", width: "100%", textAlign: "left",
                              padding: "8px 12px", border: "none", background: "none",
                              fontSize: 12, cursor: "pointer", borderBottom: "1px solid #f3f4f6",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {(["active", "unconfirmed", "stopped", "completed", "all"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => { setMedFilter(f); setMedPage(1); }}
                      style={{
                        backgroundColor: medFilter === f ? "#1e3a5f" : "#fff",
                        color: medFilter === f ? "#fff" : "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        padding: "7px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                  <button
                    type="button"
                    title="Move unchecked to unconfirmed"
                    onClick={() => {
                      setMeds((prev) => prev.map((m) => {
                        if (m.confirmed && m.status !== "active") return { ...m, status: "active", confirmed: false };
                        if (!m.confirmed && m.status === "active") return { ...m, status: "unconfirmed" };
                        return m;
                      }));
                      setMedPage(1);
                    }}
                    style={{
                      backgroundColor: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      padding: "7px 10px",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    ↻
                  </button>
              </div>

              {/* Medication table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} role="table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb" }}>
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          style={{
                            width: 18, height: 18, borderRadius: 3,
                            border: allPagedChecked ? "none" : "2px solid #d1d5db",
                            backgroundColor: allPagedChecked ? CTH_STATUS.success : "#fff",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                          }}
                          aria-label={allPagedChecked ? "Uncheck all" : "Check all"}
                        >
                          {allPagedChecked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </button>
                      </th>
                      {([
                        { label: "Medication Name", col: "name" },
                        { label: "Status", col: "status" },
                        { label: "Dosage", col: "dosage" },
                        { label: "Frequency", col: "frequency" },
                        { label: "Start Date", col: "startDate" },
                        { label: "Instructions", col: "" },
                      ] as const).map((h) => (
                        <th
                          key={h.label}
                          onClick={h.col ? () => toggleMedSort(h.col) : undefined}
                          style={{
                            textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb",
                            fontSize: 11, fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap",
                            cursor: h.col ? "pointer" : "default", userSelect: "none",
                          }}
                        >
                          {h.label}
                          {h.col && medSort?.col === h.col ? (medSort.dir === "asc" ? " ▲" : " ▼") : h.col ? " ⇅" : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedMeds.map((med, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "8px 10px" }}>
                          <button
                            type="button"
                            onClick={() => {
                              const medIdx = meds.findIndex((m) => m.name === med.name && m.startDate === med.startDate);
                              if (medIdx !== -1) {
                                setMeds((prev) => prev.map((m, i) => i === medIdx ? { ...m, confirmed: !m.confirmed } : m));
                              }
                            }}
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 3,
                              border: med.confirmed ? "none" : "2px solid #d1d5db",
                              backgroundColor: med.confirmed ? CTH_STATUS.success : "#fff",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                            }}
                            aria-label={med.confirmed ? "Unmark as reviewed" : "Mark as reviewed"}
                          >
                            {med.confirmed && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        </td>
                        <td style={{ padding: "8px 10px", fontWeight: 500, color: "#1f2937", maxWidth: 320 }}>{med.name}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                            backgroundColor: med.status === "active" ? "#f3f4f6" : med.status === "stopped" ? "#fef2f2" : med.status === "unconfirmed" ? "#fef9c3" : "#f0fdf4",
                            color: med.status === "active" ? "#374151" : med.status === "stopped" ? "#dc2626" : med.status === "unconfirmed" ? "#a16207" : CTH_STATUS.success,
                            border: "1px solid #e5e7eb", whiteSpace: "nowrap",
                          }}>{med.status}</span>
                        </td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{med.dosage || "—"}</td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{med.frequency || "—"}</td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{med.startDate}</td>
                        <td style={{ padding: "8px 10px" }}>
                          {med.instructions ? (
                            <button
                              type="button"
                              onClick={() => setInstructionsModal(med.instructions)}
                              style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 12, textDecoration: "underline", padding: 0 }}
                            >
                              View
                            </button>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151" }}>
                  <span>Rows per page</span>
                  <select
                    value={medRowsPerPage}
                    disabled
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: 4,
                      padding: "2px 6px",
                      fontSize: 12,
                    }}
                  >
                    <option value={8}>8</option>
                  </select>
                  <span style={{ marginLeft: 8 }}>Go to</span>
                  <input
                    type="number"
                    min={1}
                    max={totalMedPages}
                    value={medPage}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      if (p >= 1 && p <= totalMedPages) setMedPage(p);
                    }}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: 4,
                      padding: "2px 6px",
                      fontSize: 12,
                      width: 40,
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button type="button" onClick={() => setMedPage(1)} disabled={medPage === 1} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>«</button>
                  <button type="button" onClick={() => setMedPage(Math.max(1, medPage - 1))} disabled={medPage === 1} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>‹</button>
                  {Array.from({ length: totalMedPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setMedPage(p)}
                      style={{
                        border: "1px solid #d1d5db",
                        borderRadius: 4,
                        padding: "4px 10px",
                        fontSize: 11,
                        cursor: "pointer",
                        background: medPage === p ? "#1e3a5f" : "#fff",
                        color: medPage === p ? "#fff" : "#374151",
                        fontWeight: medPage === p ? 700 : 400,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button type="button" onClick={() => setMedPage(Math.min(totalMedPages, medPage + 1))} disabled={medPage === totalMedPages} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>›</button>
                  <button type="button" onClick={() => setMedPage(totalMedPages)} disabled={medPage === totalMedPages} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>»</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reconcile Confirmation Modal */}
      {showReconcileConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              width: 460,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                backgroundColor: "#1e3a5f",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "8px 8px 0 0",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Confirm Reconciliation
            </div>
            <div style={{ padding: "20px 16px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              Doing this will move any unchecked to the unconfirmed page. Are you sure you want to complete the medication reconciliation?
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 16px 16px" }}>
              <button
                type="button"
                onClick={() => setShowReconcileConfirm(false)}
                style={{
                  backgroundColor: "#fff",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  padding: "7px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  setMeds((prev) => prev.map((m) =>
                    !m.confirmed && m.status === "active" ? { ...m, status: "unconfirmed" } : m
                  ));
                  setMedPage(1);
                  setShowReconcileConfirm(false);
                  setShowMedModal(false);
                  setMedReconciled(true);
                }}
                style={{
                  backgroundColor: CTH_STATUS.success,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "7px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Review Modal */}
      {showDxModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 40,
          }}
          onClick={closeDxModal}
        >
          <div
            ref={dxPanelRef}
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              width: 1105,
              maxHeight: "calc(100vh - 80px)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: "#1e3a5f",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15 }}>Diagnosis Review</span>
              <button
                type="button"
                onClick={closeDxModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
                Review and confirm patient diagnosis from the problems list
              </div>

              {/* Progress bar */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Review Progress</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>
                    {dxConfirmedCount} of {dxTotal} confirmed
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Completion</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb" }}>
                    {dxTotal > 0 ? ((dxConfirmedCount / dxTotal) * 100).toFixed(1) : "0.0"}%
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowDxReconcileConfirm(true)}
                  style={{
                    backgroundColor: CTH_STATUS.success,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "7px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Reconcile
                </button>
                <button
                  type="button"
                  style={{
                    backgroundColor: CTH_STATUS.success,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "7px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginRight: "auto",
                  }}
                >
                  + Add Diagnosis
                </button>
                <div style={{ position: "relative", marginRight: "auto" }}>
                  <input
                    type="text"
                    placeholder="Search diagnosis or ICD-10..."
                    value={dxSearch}
                    onChange={(e) => { setDxSearch(e.target.value); setDxPage(1); setDxSearchOpen(true); }}
                    onFocus={() => { if (dxSearch) setDxSearchOpen(true); }}
                    onBlur={() => setTimeout(() => setDxSearchOpen(false), 200)}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      padding: "7px 12px",
                      fontSize: 12,
                      width: 220,
                      outline: "none",
                    }}
                  />
                  {dxSearch && dxSearchOpen && filteredDx.length > 0 && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, width: 400,
                      backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: 6,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)", maxHeight: 200, overflowY: "auto", zIndex: 10,
                    }}>
                      {filteredDx.slice(0, 10).map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onMouseDown={() => {
                            const pageNum = Math.floor(filteredDx.findIndex((fd) => fd.id === d.id) / dxRowsPerPage) + 1;
                            setDxPage(pageNum);
                            setDxSearch(d.name);
                            setDxSearchOpen(false);
                          }}
                          style={{
                            display: "block", width: "100%", textAlign: "left",
                            padding: "8px 12px", border: "none", background: "none",
                            fontSize: 12, cursor: "pointer", borderBottom: "1px solid #f3f4f6",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          {d.name} <span style={{ color: "#9ca3af", marginLeft: 4 }}>{d.icd10}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {(["active", "unconfirmed", "resolved", "all"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setDxFilter(f); setDxPage(1); }}
                    style={{
                      backgroundColor: dxFilter === f ? "#1e3a5f" : "#fff",
                      color: dxFilter === f ? "#fff" : "#374151",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      padding: "7px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
                <button
                  type="button"
                  title="Move selected to active"
                  onClick={() => {
                    setDiagnoses((prev) => prev.map((d) => {
                      if (d.confirmed) return { ...d, status: "active", confirmed: false };
                      return d;
                    }));
                    setDxPage(1);
                  }}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    padding: "7px 10px",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  ↻
                </button>
              </div>

              {/* Diagnosis table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} role="table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb" }}>
                        <button
                          type="button"
                          onClick={toggleDxSelectAll}
                          style={{
                            width: 18, height: 18, borderRadius: 3,
                            border: allPagedDxChecked ? "none" : "2px solid #d1d5db",
                            backgroundColor: allPagedDxChecked ? CTH_STATUS.success : "#fff",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                          }}
                          aria-label={allPagedDxChecked ? "Uncheck all" : "Check all"}
                        >
                          {allPagedDxChecked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </button>
                      </th>
                      {([
                        { label: "Diagnosis Name", col: "name" as DxSortCol },
                        { label: "ICD-10", col: "icd10" as DxSortCol },
                        { label: "Status", col: "status" as DxSortCol },
                        { label: "Category", col: "category" as DxSortCol },
                        { label: "Onset Date", col: "onsetDate" as DxSortCol },
                        { label: "Notes", col: "" as const },
                      ]).map((h) => (
                        <th
                          key={h.label}
                          onClick={h.col ? () => toggleDxSort(h.col as DxSortCol) : undefined}
                          style={{
                            textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb",
                            fontSize: 11, fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap",
                            cursor: h.col ? "pointer" : "default", userSelect: "none",
                          }}
                        >
                          {h.label}
                          {h.col && dxSort?.col === h.col ? (dxSort.dir === "asc" ? " ▲" : " ▼") : h.col ? " ⇅" : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedDx.map((dx) => (
                      <tr key={dx.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "8px 10px" }}>
                          <button
                            type="button"
                            onClick={() => toggleDxConfirmed(dx.id)}
                            style={{
                              width: 18, height: 18, borderRadius: 3,
                              border: dx.confirmed ? "none" : "2px solid #d1d5db",
                              backgroundColor: dx.confirmed ? CTH_STATUS.success : "#fff",
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                            }}
                            aria-label={dx.confirmed ? "Unmark as reviewed" : "Mark as reviewed"}
                          >
                            {dx.confirmed && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        </td>
                        <td style={{ padding: "8px 10px", fontWeight: 500, color: "#1f2937", maxWidth: 320 }}>{dx.name}</td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{dx.icd10}</td>
                        <td style={{ padding: "8px 10px" }}>
                          {dx.status ? (
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                              backgroundColor: dx.status === "active" ? "#f3f4f6" : dx.status === "unconfirmed" ? "#fef9c3" : "#f0fdf4",
                              color: dx.status === "active" ? "#374151" : dx.status === "unconfirmed" ? "#a16207" : CTH_STATUS.success,
                              border: "1px solid #e5e7eb", whiteSpace: "nowrap",
                            }}>{dx.status}</span>
                          ) : (
                            <span style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{dx.category || "—"}</td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{dx.onsetDate}</td>
                        <td style={{ padding: "8px 10px" }}>
                          {dx.notes ? (
                            <button
                              type="button"
                              onClick={() => setDxNote(dx.notes)}
                              style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 12, textDecoration: "underline", padding: 0 }}
                            >
                              View
                            </button>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151" }}>
                  <span>Rows per page</span>
                  <select
                    value={dxRowsPerPage}
                    disabled
                    style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 6px", fontSize: 12 }}
                  >
                    <option value={8}>8</option>
                  </select>
                  <span style={{ marginLeft: 8 }}>Go to</span>
                  <input
                    type="number"
                    min={1}
                    max={totalDxPages}
                    value={dxPageSafe}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      if (p >= 1 && p <= totalDxPages) setDxPage(p);
                    }}
                    style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 6px", fontSize: 12, width: 40 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button type="button" onClick={() => setDxPage(1)} disabled={dxPageSafe === 1} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>«</button>
                  <button type="button" onClick={() => setDxPage(Math.max(1, dxPageSafe - 1))} disabled={dxPageSafe === 1} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>‹</button>
                  {Array.from({ length: totalDxPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDxPage(p)}
                      style={{
                        border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer",
                        background: dxPageSafe === p ? "#1e3a5f" : "#fff",
                        color: dxPageSafe === p ? "#fff" : "#374151",
                        fontWeight: dxPageSafe === p ? 700 : 400,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button type="button" onClick={() => setDxPage(Math.min(totalDxPages, dxPageSafe + 1))} disabled={dxPageSafe === totalDxPages} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>›</button>
                  <button type="button" onClick={() => setDxPage(totalDxPages)} disabled={dxPageSafe === totalDxPages} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>»</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Notes Modal */}
      {dxNote !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closeDxNote}
        >
          <div
            ref={dxNotePanelRef}
            style={{ backgroundColor: "#fff", borderRadius: 8, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                backgroundColor: "#1e3a5f", color: "#fff", padding: "10px 16px",
                borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14 }}>Diagnosis Notes</span>
              <button
                type="button"
                onClick={closeDxNote}
                style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px 16px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              {dxNote}
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Reconcile Confirmation Modal */}
      {showDxReconcileConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ backgroundColor: "#fff", borderRadius: 8, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div
              style={{
                backgroundColor: "#1e3a5f", color: "#fff", padding: "10px 16px",
                borderRadius: "8px 8px 0 0", fontSize: 14, fontWeight: 700,
              }}
            >
              Confirm Reconciliation
            </div>
            <div style={{ padding: "20px 16px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              Doing this will move any unchecked to the unconfirmed page. Are you sure you want to complete the diagnosis reconciliation?
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 16px 16px" }}>
              <button
                type="button"
                onClick={() => setShowDxReconcileConfirm(false)}
                style={{
                  backgroundColor: "#fff", color: "#374151", border: "1px solid #d1d5db",
                  borderRadius: 6, padding: "7px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  setDiagnoses((prev) => prev.map((d) =>
                    !d.confirmed && (d.status === "active" || d.status === "") ? { ...d, status: "unconfirmed" } : d
                  ));
                  setDxPage(1);
                  setShowDxReconcileConfirm(false);
                  setShowDxModal(false);
                  setDxReconciled(true);
                }}
                style={{
                  backgroundColor: CTH_STATUS.success, color: "#fff", border: "none",
                  borderRadius: 6, padding: "7px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Labs Review Modal */}
      {showLabsModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 40,
          }}
          onClick={closeLabsModal}
        >
          <div
            ref={labPanelRef}
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              width: 1105,
              maxHeight: "calc(100vh - 80px)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                backgroundColor: "#1e3a5f",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15 }}>Labs Review</span>
              <button
                type="button"
                onClick={closeLabsModal}
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
                Review laboratory results from HIE
              </div>

              {/* Progress bar */}
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "12px 16px",
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Review Progress</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>
                    {labConfirmedCount} of {labTotal} confirmed
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>Completion</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#2563eb" }}>
                    {labTotal > 0 ? ((labConfirmedCount / labTotal) * 100).toFixed(1) : "0.0"}%
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowLabOrderConfirm(true)}
                  style={{
                    backgroundColor: CTH_STATUS.success,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "7px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    marginRight: "auto",
                  }}
                >
                  Order ({labConfirmedCount})
                </button>
                <div style={{ position: "relative", marginRight: "auto" }}>
                  <input
                    type="text"
                    placeholder="Search lab or code..."
                    value={labSearch}
                    onChange={(e) => { setLabSearch(e.target.value); setLabPage(1); setLabSearchOpen(true); }}
                    onFocus={() => { if (labSearch) setLabSearchOpen(true); }}
                    onBlur={() => setTimeout(() => setLabSearchOpen(false), 200)}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      padding: "7px 12px",
                      fontSize: 12,
                      width: 220,
                      outline: "none",
                    }}
                  />
                  {labSearch && labSearchOpen && filteredLabs.length > 0 && (
                    <div style={{
                      position: "absolute", top: "100%", left: 0, width: 400,
                      backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: 6,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)", maxHeight: 200, overflowY: "auto", zIndex: 10,
                    }}>
                      {filteredLabs.slice(0, 10).map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onMouseDown={() => {
                            const pageNum = Math.floor(filteredLabs.findIndex((fl) => fl.id === l.id) / labRowsPerPage) + 1;
                            setLabPage(pageNum);
                            setLabSearch(l.name);
                            setLabSearchOpen(false);
                          }}
                          style={{
                            display: "block", width: "100%", textAlign: "left",
                            padding: "8px 12px", border: "none", background: "none",
                            fontSize: 12, cursor: "pointer", borderBottom: "1px solid #f3f4f6",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          {l.name} {l.code && <span style={{ color: "#9ca3af", marginLeft: 4 }}>{l.code}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {(["All", "Normal", "Abnormal"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setLabFilter(f); setLabPage(1); }}
                    style={{
                      backgroundColor: labFilter === f ? "#1e3a5f" : "#fff",
                      color: labFilter === f ? "#fff" : "#374151",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      padding: "7px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
                <button
                  type="button"
                  title="Reset selections"
                  onClick={() => {
                    setLabs((prev) => prev.map((l) => ({ ...l, confirmed: false })));
                    setLabPage(1);
                  }}
                  style={{
                    backgroundColor: "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    padding: "7px 10px",
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  ↻
                </button>
              </div>

              {/* Labs table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} role="table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb" }}>
                        <button
                          type="button"
                          onClick={toggleLabSelectAll}
                          style={{
                            width: 18, height: 18, borderRadius: 3,
                            border: allPagedLabsChecked ? "none" : "2px solid #d1d5db",
                            backgroundColor: allPagedLabsChecked ? CTH_STATUS.success : "#fff",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                          }}
                          aria-label={allPagedLabsChecked ? "Uncheck all" : "Check all"}
                        >
                          {allPagedLabsChecked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </button>
                      </th>
                      {([
                        { label: "Lab Name", col: "name" as LabSortCol },
                        { label: "Code", col: "code" as LabSortCol },
                        { label: "Category", col: "category" as LabSortCol },
                        { label: "Value", col: "value" as LabSortCol },
                        { label: "Date", col: "date" as LabSortCol },
                        { label: "Source", col: "source" as LabSortCol },
                      ]).map((h) => (
                        <th
                          key={h.label}
                          onClick={() => toggleLabSort(h.col)}
                          style={{
                            textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb",
                            fontSize: 11, fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap",
                            cursor: "pointer", userSelect: "none",
                          }}
                        >
                          {h.label}
                          {labSort?.col === h.col ? (labSort.dir === "asc" ? " ▲" : " ▼") : " ⇅"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedLabs.map((lab) => (
                      <tr key={lab.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "8px 10px" }}>
                          <button
                            type="button"
                            onClick={() => toggleLabConfirmed(lab.id)}
                            style={{
                              width: 18, height: 18, borderRadius: 3,
                              border: lab.confirmed ? "none" : "2px solid #d1d5db",
                              backgroundColor: lab.confirmed ? CTH_STATUS.success : "#fff",
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                            }}
                            aria-label={lab.confirmed ? "Unmark as reviewed" : "Mark as reviewed"}
                          >
                            {lab.confirmed && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        </td>
                        <td style={{ padding: "8px 10px", fontWeight: 500, color: "#1f2937", maxWidth: 380 }}>{lab.name}</td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{lab.code || "—"}</td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{lab.category}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{
                            fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
                            backgroundColor: lab.status === "Normal" ? "#f0fdf4" : "#fef2f2",
                            color: lab.status === "Normal" ? CTH_STATUS.success : "#dc2626",
                            border: "1px solid #e5e7eb", whiteSpace: "nowrap",
                          }}>{lab.value}{lab.unit ? ` ${lab.unit}` : ""}</span>
                          <span style={{ fontSize: 10, color: "#9ca3af", marginLeft: 6, whiteSpace: "nowrap" }}>({lab.refRange})</span>
                        </td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{lab.date || "—"}</td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>
                          <span style={{
                            fontSize: 11, padding: "2px 8px", borderRadius: 4,
                            backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb",
                          }}>{lab.source}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151" }}>
                  <span>Rows per page</span>
                  <select
                    value={labRowsPerPage}
                    disabled
                    style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 6px", fontSize: 12 }}
                  >
                    <option value={8}>8</option>
                  </select>
                  <span style={{ marginLeft: 8 }}>Go to</span>
                  <input
                    type="number"
                    min={1}
                    max={totalLabPages}
                    value={labPageSafe}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      if (p >= 1 && p <= totalLabPages) setLabPage(p);
                    }}
                    style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 6px", fontSize: 12, width: 40 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button type="button" onClick={() => setLabPage(1)} disabled={labPageSafe === 1} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>«</button>
                  <button type="button" onClick={() => setLabPage(Math.max(1, labPageSafe - 1))} disabled={labPageSafe === 1} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>‹</button>
                  {Array.from({ length: totalLabPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setLabPage(p)}
                      style={{
                        border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer",
                        background: labPageSafe === p ? "#1e3a5f" : "#fff",
                        color: labPageSafe === p ? "#fff" : "#374151",
                        fontWeight: labPageSafe === p ? 700 : 400,
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button type="button" onClick={() => setLabPage(Math.min(totalLabPages, labPageSafe + 1))} disabled={labPageSafe === totalLabPages} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>›</button>
                  <button type="button" onClick={() => setLabPage(totalLabPages)} disabled={labPageSafe === totalLabPages} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>»</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEDIS Measures Modal */}
      {showHedisModal && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 20 }}
          onClick={closeHedisModal}
        >
          <div
            ref={hedisPanelRef}
            style={{ backgroundColor: "#fff", borderRadius: 8, width: 1105, maxHeight: "calc(100vh - 40px)", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ backgroundColor: "#1e3a5f", color: "#fff", padding: "12px 20px", borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>HEDIS Measures</span>
              <button type="button" onClick={closeHedisModal} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", lineHeight: 1 }} aria-label="Close">✕</button>
            </div>
            <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
                Identified HEDIS quality measures and gaps in care for this patient
              </div>

              {/* Progress bar — compact */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1f2937" }}>{hedisConfirmedCount} of {hedisTotal} reviewed</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2563eb" }}>{hedisTotal > 0 ? ((hedisConfirmedCount / hedisTotal) * 100).toFixed(1) : "0.0"}%</div>
              </div>

              {/* Action row */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                <div style={{ position: "relative", marginRight: "auto" }}>
                  <input
                    type="text"
                    placeholder="Search measure or code..."
                    value={hedisSearch}
                    onChange={(e) => { setHedisSearch(e.target.value); setHedisPage(1); setHedisSearchOpen(true); }}
                    onFocus={() => { if (hedisSearch) setHedisSearchOpen(true); }}
                    onBlur={() => setTimeout(() => setHedisSearchOpen(false), 200)}
                    style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "7px 12px", fontSize: 12, width: 220, outline: "none" }}
                  />
                  {hedisSearch && hedisSearchOpen && filteredHedis.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, width: 400, backgroundColor: "#fff", border: "1px solid #d1d5db", borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", maxHeight: 200, overflowY: "auto", zIndex: 10 }}>
                      {filteredHedis.slice(0, 10).map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onMouseDown={() => { setHedisPage(Math.floor(filteredHedis.findIndex((fh) => fh.id === h.id) / hedisRowsPerPage) + 1); setHedisSearch(h.measure); setHedisSearchOpen(false); }}
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: "none", fontSize: 12, cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f3f4f6"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                        >
                          {h.measure} <span style={{ color: "#9ca3af", marginLeft: 4 }}>{h.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {(["All", "Open", "Closed"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => { setHedisFilter(f); setHedisPage(1); }}
                    style={{
                      backgroundColor: hedisFilter === f ? "#1e3a5f" : "#fff",
                      color: hedisFilter === f ? "#fff" : "#374151",
                      border: "1px solid #d1d5db", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} role="table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb" }}>
                        <button type="button" onClick={toggleHedisSelectAll} style={{ width: 18, height: 18, borderRadius: 3, border: allPagedHedisChecked ? "none" : "2px solid #d1d5db", backgroundColor: allPagedHedisChecked ? CTH_STATUS.success : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }} aria-label={allPagedHedisChecked ? "Uncheck all" : "Check all"}>
                          {allPagedHedisChecked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </button>
                      </th>
                      {([
                        { label: "Measure", col: "measure" as HedisSortCol },
                        { label: "Code", col: "code" as HedisSortCol },
                        { label: "Category", col: "category" as HedisSortCol },
                        { label: "Status", col: "status" as HedisSortCol },
                        { label: "Due Date", col: "dueDate" as HedisSortCol },
                        { label: "Self-Report", col: "" as const },
                        { label: "Notes", col: "" as const },
                      ]).map((h) => (
                        <th
                          key={h.label}
                          onClick={h.col ? () => toggleHedisSort(h.col as HedisSortCol) : undefined}
                          style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #e5e7eb", fontSize: 11, fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap", cursor: h.col ? "pointer" : "default", userSelect: "none" }}
                        >
                          {h.label}
                          {h.col && hedisSort?.col === h.col ? (hedisSort.dir === "asc" ? " ▲" : " ▼") : h.col ? " ⇅" : ""}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedHedis.map((hm) => (
                      <tr key={hm.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "8px 10px" }}>
                          <button type="button" onClick={() => toggleHedisConfirmed(hm.id)} style={{ width: 18, height: 18, borderRadius: 3, border: hm.confirmed ? "none" : "2px solid #d1d5db", backgroundColor: hm.confirmed ? CTH_STATUS.success : "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }} aria-label={hm.confirmed ? "Unmark" : "Mark as reviewed"}>
                            {hm.confirmed && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </button>
                        </td>
                        <td style={{ padding: "8px 10px", fontWeight: 500, color: "#1f2937", maxWidth: 320 }}>{hm.measure}</td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{hm.code}</td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{hm.category}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, backgroundColor: hm.status === "Open" ? "#fef2f2" : "#f0fdf4", color: hm.status === "Open" ? "#dc2626" : CTH_STATUS.success, border: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{hm.status}</span>
                        </td>
                        <td style={{ padding: "8px 10px", color: "#374151", whiteSpace: "nowrap" }}>{hm.dueDate}</td>
                        <td style={{ padding: "8px 10px" }}>
                          {hm.selfReportAllowed ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              {hm.selfReportValue && (
                                <span style={{ fontSize: 11, color: "#374151" }}>{hm.selfReportValue}</span>
                              )}
                              <button
                                type="button"
                                title="Enter self-reported value"
                                onClick={() => setSelfReportEdit({ id: hm.id, measure: hm.measure, value: hm.selfReportValue })}
                                style={{
                                  background: "none", border: "none", cursor: "pointer", padding: 2,
                                  color: hm.selfReportValue ? "#2563eb" : "#9ca3af",
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ display: "block" }}>
                                  <path d="M12.5 3.5l4 4L6 18H2v-4L12.5 3.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                  <line x1="10.5" y1="5.5" x2="14.5" y2="9.5" stroke="currentColor" strokeWidth="1" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          {hm.notes ? (
                            <button type="button" onClick={() => setHedisNote(hm.notes)} style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 12, textDecoration: "underline", padding: 0 }}>View</button>
                          ) : <span style={{ color: "#9ca3af" }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151" }}>
                  <span>Rows per page</span>
                  <select value={hedisRowsPerPage} disabled style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 6px", fontSize: 12 }}><option value={8}>8</option></select>
                  <span style={{ marginLeft: 8 }}>Go to</span>
                  <input type="number" min={1} max={totalHedisPages} value={hedisPageSafe} onChange={(e) => { const p = Number(e.target.value); if (p >= 1 && p <= totalHedisPages) setHedisPage(p); }} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "2px 6px", fontSize: 12, width: 40 }} />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button type="button" onClick={() => setHedisPage(1)} disabled={hedisPageSafe === 1} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>«</button>
                  <button type="button" onClick={() => setHedisPage(Math.max(1, hedisPageSafe - 1))} disabled={hedisPageSafe === 1} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>‹</button>
                  {Array.from({ length: totalHedisPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
                    <button key={p} type="button" onClick={() => setHedisPage(p)} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer", background: hedisPageSafe === p ? "#1e3a5f" : "#fff", color: hedisPageSafe === p ? "#fff" : "#374151", fontWeight: hedisPageSafe === p ? 700 : 400 }}>{p}</button>
                  ))}
                  <button type="button" onClick={() => setHedisPage(Math.min(totalHedisPages, hedisPageSafe + 1))} disabled={hedisPageSafe === totalHedisPages} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>›</button>
                  <button type="button" onClick={() => setHedisPage(totalHedisPages)} disabled={hedisPageSafe === totalHedisPages} style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", background: "#fff" }}>»</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEDIS Notes Modal */}
      {hedisNote !== null && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={closeHedisNote}>
          <div ref={hedisNotePanelRef} style={{ backgroundColor: "#fff", borderRadius: 8, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ backgroundColor: "#1e3a5f", color: "#fff", padding: "10px 16px", borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Measure Notes</span>
              <button type="button" onClick={closeHedisNote} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", lineHeight: 1 }} aria-label="Close">✕</button>
            </div>
            <div style={{ padding: "20px 16px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{hedisNote}</div>
          </div>
        </div>
      )}

      {/* Self-Report Entry Modal */}
      {selfReportEdit !== null && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setSelfReportEdit(null)}
        >
          <div
            style={{ backgroundColor: "#fff", borderRadius: 8, width: 500, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ backgroundColor: "#1e3a5f", color: "#fff", padding: "10px 16px", borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Self-Reported Value</span>
              <button type="button" onClick={() => setSelfReportEdit(null)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", lineHeight: 1 }} aria-label="Close">✕</button>
            </div>
            <div style={{ padding: "20px 16px" }}>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
                {selfReportEdit.measure}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Patient-reported value</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g., Last mammogram 03/2024, BP 138/82..."
                  value={selfReportEdit.value}
                  onChange={(e) => setSelfReportEdit((prev) => prev ? { ...prev, value: e.target.value } : prev)}
                  style={{
                    border: "1px solid #d1d5db", borderRadius: 6, padding: "8px 12px",
                    fontSize: 13, width: "100%", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setSelfReportEdit(null)}
                  style={{ backgroundColor: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, padding: "7px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selfReportEdit) {
                      setHedisMeasures((prev) => prev.map((h) => h.id === selfReportEdit.id ? { ...h, selfReportValue: selfReportEdit.value } : h));
                      setSelfReportEdit(null);
                    }
                  }}
                  style={{ backgroundColor: CTH_STATUS.success, color: "#fff", border: "none", borderRadius: 6, padding: "7px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lab Order Confirmation Modal */}
      {showLabOrderConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ backgroundColor: "#fff", borderRadius: 8, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div
              style={{
                backgroundColor: "#1e3a5f", color: "#fff", padding: "10px 16px",
                borderRadius: "8px 8px 0 0", fontSize: 14, fontWeight: 700,
              }}
            >
              Confirm Order
            </div>
            <div style={{ padding: "20px 16px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              This will send orders for the labs (tests) selected. Confirm?
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "0 16px 16px" }}>
              <button
                type="button"
                onClick={() => setShowLabOrderConfirm(false)}
                style={{
                  backgroundColor: "#fff", color: "#374151", border: "1px solid #d1d5db",
                  borderRadius: 6, padding: "7px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLabOrderConfirm(false);
                  setShowLabsModal(false);
                  setLabsReviewed(true);
                }}
                style={{
                  backgroundColor: CTH_STATUS.success, color: "#fff", border: "none",
                  borderRadius: 6, padding: "7px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {instructionsModal !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setInstructionsModal(null)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              width: 480,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                backgroundColor: "#1e3a5f",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 14 }}>Instructions</span>
              <button
                type="button"
                onClick={() => setInstructionsModal(null)}
                style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "20px 16px", fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              {instructionsModal}
            </div>
          </div>
        </div>
      )}
      {/* EED Form Modal */}
      {showEEDModal && (
        <EEDFormModal
          onClose={() => setShowEEDModal(false)}
          onSave={() => setEedSubmitted(true)}
        />
      )}
      {/* Emergency (911) Modal */}
      <EmergencyModal
        open={showEmergencyModal}
        onOpenChange={setShowEmergencyModal}
        patient={patientDispatchInfo}
      />
    </MainLayout>
  );
};

export default PatientAppointment;
