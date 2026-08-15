import React, { useState } from "react";
import { CTH_STATUS } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EEDTab = "self-report" | "order-exam" | "cannot-complete";

type ExamType = "dilated" | "retinal-photo" | "other";
type ProviderType = "ophthalmologist" | "optometrist";
type ExamResult = "normal" | "abnormal";
type CannotCompleteReason = "refused" | "own-doctor" | "already-scheduled";

interface SelfReportData {
  examDate: string;
  examType: ExamType | "";
  providerName: string;
  providerType: ProviderType | "";
  result: ExamResult | "";
  resultDetails: string;
}

interface OrderExamData {
  orderPlaced: boolean;
  preferredProvider: string;
  referralDate: string;
  notes: string;
}

interface CannotCompleteData {
  reason: CannotCompleteReason | "";
}

export interface EEDFormResult {
  tab: EEDTab;
  selfReport?: SelfReportData;
  orderExam?: OrderExamData;
  cannotComplete?: CannotCompleteData;
}

interface EEDFormModalProps {
  onClose: () => void;
  onSave?: (result: EEDFormResult) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS: { key: EEDTab; label: string }[] = [
  { key: "self-report", label: "Self-Report" },
  { key: "order-exam", label: "Order Exam" },
  { key: "cannot-complete", label: "Cannot Complete" },
];

const EXAM_TYPE_OPTIONS: { value: ExamType; label: string }[] = [
  { value: "dilated", label: "Dilated retinal exam" },
  { value: "retinal-photo", label: "Retinal photography / teleretinal" },
  { value: "other", label: "Other" },
];

const PROVIDER_TYPE_OPTIONS: { value: ProviderType; label: string }[] = [
  { value: "ophthalmologist", label: "Ophthalmologist" },
  { value: "optometrist", label: "Optometrist" },
];

const RESULT_OPTIONS: { value: ExamResult; label: string }[] = [
  { value: "normal", label: "Normal (no retinopathy)" },
  { value: "abnormal", label: "Abnormal (retinopathy detected)" },
];

const CANNOT_COMPLETE_OPTIONS: { value: CannotCompleteReason; label: string }[] = [
  { value: "refused", label: "Refused" },
  { value: "own-doctor", label: "Will see own doctor" },
  { value: "already-scheduled", label: "Already scheduled" },
];

// ---------------------------------------------------------------------------
// Shared inline style fragments
// ---------------------------------------------------------------------------

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  display: "block",
  marginBottom: 4,
};

const INPUT_STYLE: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 13,
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  minHeight: 72,
  resize: "vertical",
  fontFamily: "inherit",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Whether a prior-year abnormal result triggers the inline warning. */
function isPriorYearAbnormal(examDate: string, result: ExamResult | ""): boolean {
  if (!examDate || result !== "abnormal") return false;
  const year = new Date(examDate).getFullYear();
  const currentYear = new Date().getFullYear();
  return year < currentYear;
}

/** Whether the Self-Report tab has all required fields filled. */
function isSelfReportValid(data: SelfReportData): boolean {
  return (
    data.examDate !== "" &&
    data.examType !== "" &&
    data.providerName.trim() !== "" &&
    data.providerType !== "" &&
    data.result !== ""
  );
}

/** Whether the Cannot Complete tab has a reason selected. */
function isCannotCompleteValid(data: CannotCompleteData): boolean {
  return data.reason !== "";
}

// ---------------------------------------------------------------------------
// Styled radio button (matches the green checkbox pattern from the table modals)
// ---------------------------------------------------------------------------

function RadioCircle({
  selected,
  onClick,
  label,
  name,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  name: string;
}): React.ReactElement {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 0",
        fontSize: 13,
        color: "#374151",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: selected ? "none" : "2px solid #d1d5db",
          backgroundColor: selected ? CTH_STATUS.success : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {selected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <circle cx="5" cy="5" r="3" fill="#fff" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const EEDFormModal: React.FC<EEDFormModalProps> = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<EEDTab>("self-report");

  // Self-Report state
  const [selfReport, setSelfReport] = useState<SelfReportData>({
    examDate: "",
    examType: "",
    providerName: "",
    providerType: "",
    result: "",
    resultDetails: "",
  });

  // Order Exam state
  const [orderExam, setOrderExam] = useState<OrderExamData>({
    orderPlaced: false,
    preferredProvider: "",
    referralDate: "",
    notes: "",
  });

  // Cannot Complete state
  const [cannotComplete, setCannotComplete] = useState<CannotCompleteData>({
    reason: "",
  });

  const handleSave = () => {
    const result: EEDFormResult = { tab: activeTab };
    if (activeTab === "self-report") {
      result.selfReport = selfReport;
    } else if (activeTab === "order-exam") {
      result.orderExam = orderExam;
    } else {
      result.cannotComplete = cannotComplete;
    }
    onSave?.(result);
    onClose();
  };

  const isSaveDisabled = (): boolean => {
    if (activeTab === "self-report") return !isSelfReportValid(selfReport);
    if (activeTab === "cannot-complete") return !isCannotCompleteValid(cannotComplete);
    return false; // Order Exam has no required fields
  };

  return (
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
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Eye Exam for Patients with Diabetes"
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          width: 560,
          maxHeight: "90vh",
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
            padding: "10px 16px",
            borderRadius: "8px 8px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            Eye Exam for Patients with Diabetes (EED)
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            &#10005;
          </button>
        </div>

        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="EED form paths"
          style={{
            display: "flex",
            borderBottom: "1px solid #d1d5db",
            flexShrink: 0,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`eed-panel-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: "10px 12px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #1e3a5f" : "2px solid transparent",
                backgroundColor: activeTab === tab.key ? "#1e3a5f" : "#fff",
                color: activeTab === tab.key ? "#fff" : "#374151",
                transition: "background-color 0.15s, color 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: "20px 16px", overflowY: "auto", flex: "1 1 auto" }}>

          {/* Path A: Self-Report */}
          {activeTab === "self-report" && (
            <div
              id="eed-panel-self-report"
              role="tabpanel"
              aria-label="Self-Report"
            >
              {/* Exam date */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="eed-exam-date" style={LABEL_STYLE}>
                  Exam date <span style={{ color: CTH_STATUS.danger }}>*</span>
                </label>
                <input
                  id="eed-exam-date"
                  type="date"
                  value={selfReport.examDate}
                  onChange={(e) =>
                    setSelfReport((prev) => ({ ...prev, examDate: e.target.value }))
                  }
                  style={INPUT_STYLE}
                />
              </div>

              {/* Exam type */}
              <div style={{ marginBottom: 16 }}>
                <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                  <legend style={{ ...LABEL_STYLE, marginBottom: 8 }}>
                    Exam type <span style={{ color: CTH_STATUS.danger }}>*</span>
                  </legend>
                  <div
                    role="radiogroup"
                    aria-label="Exam type"
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {EXAM_TYPE_OPTIONS.map((opt) => (
                      <RadioCircle
                        key={opt.value}
                        name="examType"
                        selected={selfReport.examType === opt.value}
                        onClick={() =>
                          setSelfReport((prev) => ({ ...prev, examType: opt.value }))
                        }
                        label={opt.label}
                      />
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Provider name */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="eed-provider-name" style={LABEL_STYLE}>
                  Provider name <span style={{ color: CTH_STATUS.danger }}>*</span>
                </label>
                <input
                  id="eed-provider-name"
                  type="text"
                  placeholder="Ophthalmologist or optometrist who performed the exam"
                  value={selfReport.providerName}
                  onChange={(e) =>
                    setSelfReport((prev) => ({ ...prev, providerName: e.target.value }))
                  }
                  style={INPUT_STYLE}
                />
              </div>

              {/* Provider type */}
              <div style={{ marginBottom: 16 }}>
                <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                  <legend style={{ ...LABEL_STYLE, marginBottom: 8 }}>
                    Provider type <span style={{ color: CTH_STATUS.danger }}>*</span>
                  </legend>
                  <div
                    role="radiogroup"
                    aria-label="Provider type"
                    style={{ display: "flex", gap: 16 }}
                  >
                    {PROVIDER_TYPE_OPTIONS.map((opt) => (
                      <RadioCircle
                        key={opt.value}
                        name="providerType"
                        selected={selfReport.providerType === opt.value}
                        onClick={() =>
                          setSelfReport((prev) => ({ ...prev, providerType: opt.value }))
                        }
                        label={opt.label}
                      />
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Result */}
              <div style={{ marginBottom: 16 }}>
                <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                  <legend style={{ ...LABEL_STYLE, marginBottom: 8 }}>
                    Result <span style={{ color: CTH_STATUS.danger }}>*</span>
                  </legend>
                  <div
                    role="radiogroup"
                    aria-label="Exam result"
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    {RESULT_OPTIONS.map((opt) => (
                      <RadioCircle
                        key={opt.value}
                        name="result"
                        selected={selfReport.result === opt.value}
                        onClick={() =>
                          setSelfReport((prev) => ({ ...prev, result: opt.value }))
                        }
                        label={opt.label}
                      />
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Prior-year abnormal warning */}
              {isPriorYearAbnormal(selfReport.examDate, selfReport.result) && (
                <div
                  role="alert"
                  style={{
                    backgroundColor: CTH_STATUS.dangerSoft,
                    border: `1px solid ${CTH_STATUS.danger}`,
                    borderRadius: 6,
                    padding: "10px 12px",
                    fontSize: 12,
                    color: CTH_STATUS.danger,
                    marginBottom: 16,
                    lineHeight: 1.5,
                  }}
                >
                  Prior-year abnormal result does not close current-year gap. A current-year exam is needed.
                </div>
              )}

              {/* Result details (abnormal only) */}
              {selfReport.result === "abnormal" && (
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="eed-result-details" style={LABEL_STYLE}>
                    Result details
                  </label>
                  <textarea
                    id="eed-result-details"
                    placeholder="Describe retinopathy findings..."
                    value={selfReport.resultDetails}
                    onChange={(e) =>
                      setSelfReport((prev) => ({
                        ...prev,
                        resultDetails: e.target.value,
                      }))
                    }
                    style={TEXTAREA_STYLE}
                  />
                </div>
              )}
            </div>
          )}

          {/* Path B: Order Exam */}
          {activeTab === "order-exam" && (
            <div
              id="eed-panel-order-exam"
              role="tabpanel"
              aria-label="Order Exam"
            >
              {/* Order placed checkbox */}
              <div style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={orderExam.orderPlaced}
                  onClick={() =>
                    setOrderExam((prev) => ({
                      ...prev,
                      orderPlaced: !prev.orderPlaced,
                    }))
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0",
                    fontSize: 13,
                    color: "#374151",
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 3,
                      border: orderExam.orderPlaced
                        ? "none"
                        : "2px solid #d1d5db",
                      backgroundColor: orderExam.orderPlaced
                        ? CTH_STATUS.success
                        : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {orderExam.orderPlaced && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 3.5"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  Order placed
                </button>
              </div>

              {/* Preferred provider */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="eed-preferred-provider" style={LABEL_STYLE}>
                  Preferred provider / location
                </label>
                <input
                  id="eed-preferred-provider"
                  type="text"
                  placeholder="Provider name or clinic"
                  value={orderExam.preferredProvider}
                  onChange={(e) =>
                    setOrderExam((prev) => ({
                      ...prev,
                      preferredProvider: e.target.value,
                    }))
                  }
                  style={INPUT_STYLE}
                />
              </div>

              {/* Referral date */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="eed-referral-date" style={LABEL_STYLE}>
                  Referral date
                </label>
                <input
                  id="eed-referral-date"
                  type="date"
                  value={orderExam.referralDate}
                  onChange={(e) =>
                    setOrderExam((prev) => ({
                      ...prev,
                      referralDate: e.target.value,
                    }))
                  }
                  style={INPUT_STYLE}
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="eed-order-notes" style={LABEL_STYLE}>
                  Notes
                </label>
                <textarea
                  id="eed-order-notes"
                  placeholder="Additional notes..."
                  value={orderExam.notes}
                  onChange={(e) =>
                    setOrderExam((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  style={TEXTAREA_STYLE}
                />
              </div>
            </div>
          )}

          {/* Path C: Cannot Complete */}
          {activeTab === "cannot-complete" && (
            <div
              id="eed-panel-cannot-complete"
              role="tabpanel"
              aria-label="Cannot Complete"
            >
              <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
                <legend style={{ ...LABEL_STYLE, marginBottom: 8 }}>
                  Reason <span style={{ color: CTH_STATUS.danger }}>*</span>
                </legend>
                <div
                  role="radiogroup"
                  aria-label="Cannot complete reason"
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {CANNOT_COMPLETE_OPTIONS.map((opt) => (
                    <RadioCircle
                      key={opt.value}
                      name="cannotCompleteReason"
                      selected={cannotComplete.reason === opt.value}
                      onClick={() =>
                        setCannotComplete({ reason: opt.value })
                      }
                      label={opt.label}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 16px",
            borderTop: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
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
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaveDisabled()}
            style={{
              backgroundColor: isSaveDisabled() ? "#d1d5db" : CTH_STATUS.success,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "7px 20px",
              fontSize: 13,
              fontWeight: 600,
              cursor: isSaveDisabled() ? "not-allowed" : "pointer",
              opacity: isSaveDisabled() ? 0.6 : 1,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EEDFormModal;
