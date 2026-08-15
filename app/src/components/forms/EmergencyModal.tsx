import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CTH_FOCUS, CTH_STATUS, UI_NEUTRAL } from "@/lib/design-tokens";
import { fetchPsap, PsapLookupError, type Psap } from "@/lib/eprcClient";

/**
 * Dispatch-relevant patient info surfaced in the modal. First-draft scaffold —
 * field set is whatever the page already renders in the Patient Info Header;
 * nothing here is fetched.
 */
export interface EmergencyPatientInfo {
  name: string;
  dob: string;
  address: string;
  cityStateZip: string;
  homePhone: string;
  mobilePhone: string;
}

interface EmergencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: EmergencyPatientInfo;
}

/**
 * Local view-state for the PSAP lookup. A discriminated union rather than
 * separate booleans so a given render can only ever be in exactly one of
 * these states — no `loading && error` cross-product to account for.
 */
type PsapViewState =
  | { status: "loading" }
  | { status: "success"; psaps: Psap[] }
  | { status: "empty" }
  | { status: "error" };

/**
 * GL-003 §10.6 focus indicator, scoped to this modal's own net-new
 * interactive elements (the PSAP 24×7 phone links). Authored as a stylesheet
 * — not inline `style` — because `:focus-visible` is a pseudo-class an
 * inline style object cannot express (same rationale as the
 * `DX_FOCUS_CSS` block in PatientAppointment.tsx). Scoped under its own
 * class name rather than reusing `.dx-focusable` so this component doesn't
 * depend on that page's stylesheet actually being mounted.
 */
const PSAP_LINK_FOCUS_CSS = `
.psap-tel-link:focus-visible {
  outline: ${CTH_FOCUS.width} solid ${CTH_FOCUS.ring};
  outline-offset: ${CTH_FOCUS.offset};
}
`;

/**
 * Emergency Services (911) modal.
 *
 * Follows the shadcn Dialog convention shipped in WeightModal.tsx /
 * NotesModal.tsx (open/onOpenChange controlled by the parent). GL-003 Layer C
 * (CareTalk360): the primary action reuses CTH_STATUS.danger (#9B3A31), the
 * same Brick token already ratified for the page's 911 button (GL-003 §10.5,
 * §13.3) — not a new red.
 *
 * PSAP wiring: on open, looks up the dispatch center serving the patient's
 * location via Mack's `/api/eprc/psap` proxy (fetchPsap in eprcClient.ts).
 * No lat/lng is passed yet — the page's patient data is hardcoded demo data
 * with no coordinates, so the server falls back to its configured sandbox
 * default. See eprcClient.ts for the contract.
 */
const EmergencyModal = ({ open, onOpenChange, patient }: EmergencyModalProps) => {
  const [psapState, setPsapState] = useState<PsapViewState>({ status: "loading" });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const controller = new AbortController();

    setPsapState({ status: "loading" });

    fetchPsap({ signal: controller.signal })
      .then((result) => {
        if (cancelled) return;
        setPsapState(
          result.psaps.length > 0
            ? { status: "success", psaps: result.psaps }
            : { status: "empty" },
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (import.meta.env.DEV) {
          const code = err instanceof PsapLookupError ? err.code : "unknown";
          console.warn(`PSAP lookup failed (${code})`, err);
        }
        setPsapState({ status: "error" });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [open]);

  const primaryPsap = psapState.status === "success" ? psapState.psaps[0] : undefined;
  const call911Number =
    primaryPsap?.emergency24 && primaryPsap.emergency24.trim().length > 0
      ? primaryPsap.emergency24
      : "911";

  const handleCall911 = () => {
    window.location.href = `tel:${call911Number}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md flex flex-col p-6 gap-4">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold" style={{ color: CTH_STATUS.danger }}>
            Emergency Services — 911
          </DialogTitle>
        </DialogHeader>

        <div style={{ fontSize: 13, lineHeight: 1.7, color: UI_NEUTRAL.textBody }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: UI_NEUTRAL.textStrong, marginBottom: 4 }}>
            {patient.name}
          </div>
          <div>
            <span style={{ color: UI_NEUTRAL.textMuted }}>DOB:</span> {patient.dob}
          </div>
          <div>{patient.address}</div>
          <div>{patient.cityStateZip}</div>
          <div>
            <span style={{ color: UI_NEUTRAL.textMuted }}>H:</span> {patient.homePhone}
            {"  "}
            <span style={{ color: UI_NEUTRAL.textMuted }}>M:</span> {patient.mobilePhone}
          </div>
        </div>

        <div
          style={{ borderTop: `1px solid ${UI_NEUTRAL.borderSubtle}`, paddingTop: 12 }}
          aria-live="polite"
        >
          <style>{PSAP_LINK_FOCUS_CSS}</style>

          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: UI_NEUTRAL.textMuted,
              marginBottom: 6,
            }}
          >
            Dispatch center
          </div>

          {psapState.status === "loading" && (
            <div className="flex items-center gap-2" role="status">
              <Loader2
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                style={{ color: UI_NEUTRAL.textMuted }}
                aria-hidden="true"
              />
              <span style={{ fontSize: 13, color: UI_NEUTRAL.textMuted }}>
                Locating nearest PSAP…
              </span>
            </div>
          )}

          {psapState.status === "error" && (
            <div style={{ fontSize: 13, color: UI_NEUTRAL.textMuted }} role="status">
              Couldn't reach the emergency directory — dial 911 directly.
            </div>
          )}

          {psapState.status === "empty" && (
            <div style={{ fontSize: 13, color: UI_NEUTRAL.textMuted }} role="status">
              No PSAP found for this location. Dial 911 directly.
            </div>
          )}

          {psapState.status === "success" && (
            <div className="flex flex-col gap-2">
              {psapState.psaps.map((psap, index) => (
                <div
                  // PSAP records have no stable id in the API contract;
                  // name+index is stable for the life of this single lookup
                  // render.
                  key={`${psap.name ?? "psap"}-${index}`}
                  style={{
                    border: `1px solid ${UI_NEUTRAL.borderSubtle}`,
                    borderRadius: 6,
                    padding: "8px 10px",
                    backgroundColor: index === 0 ? CTH_STATUS.dangerSoft : UI_NEUTRAL.divider,
                  }}
                >
                  {psapState.psaps.length > 1 && (
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: UI_NEUTRAL.textMuted,
                        marginBottom: 2,
                      }}
                    >
                      {index === 0 ? "Primary" : "Secondary"}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, fontSize: 13, color: UI_NEUTRAL.textStrong }}>
                    {psap.name ?? "Dispatch center"}
                  </div>
                  <div style={{ fontSize: 13, color: UI_NEUTRAL.textBody }}>
                    {[psap.city, psap.state].filter(Boolean).join(", ") || "—"}
                  </div>
                  {psap.emergency24 && psap.emergency24.trim().length > 0 && (
                    <div style={{ fontSize: 13, marginTop: 2 }}>
                      <span style={{ color: UI_NEUTRAL.textMuted }}>24×7: </span>
                      <a
                        href={`tel:${psap.emergency24}`}
                        className="psap-tel-link"
                        style={{ color: CTH_STATUS.danger, fontWeight: 600, borderRadius: 2 }}
                      >
                        {psap.emergency24}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <button
            type="button"
            aria-label={`Call ${call911Number === "911" ? "911" : `dispatch at ${call911Number}`} emergency services`}
            onClick={handleCall911}
            style={{
              backgroundColor: CTH_STATUS.danger,
              color: "#fff",
              border: "none",
              borderRadius: 4,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Call 911
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyModal;
