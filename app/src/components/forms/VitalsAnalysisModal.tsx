import React, { useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  LabelList,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { REPLICA } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Palette
//
// The four replica values are GL-003 §13.3 Layer C register rows — borrowed
// from the caretalkbeta.com screen, not chosen. They are imported rather than
// re-declared so the register has exactly one home (§13.1(3)).
//
// REPLICA.chartBar is 3.82:1 — chart fill only, never a label painted on it.
// REPLICA.chartSystolic is chart line only; destructive controls use
// CTH_STATUS.danger instead. Two reds with different meanings on one screen is
// the confusion the register exists to prevent.
// ---------------------------------------------------------------------------

const NAVY = REPLICA.navy;
const BAR_BLUE = REPLICA.chartBar;
const SYSTOLIC_RED = REPLICA.chartSystolic;
const DIASTOLIC_NAVY = REPLICA.navy;
const GRID_GRAY = "#e5e7eb";
const AXIS_GRAY = "#6b7280";
const LABEL_DARK = "#1f2937";
const PANEL_BORDER = "#e5e7eb";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VitalKey = "weight" | "bmi" | "bp" | "heartRate";

interface BarPoint {
  date: string;
  value: number;
}

interface BloodPressurePoint {
  date: string;
  systolic: number | null;
  diastolic: number | null;
}

interface BarVitalConfig {
  kind: "bar";
  /** Bold title rendered above the chart panel. */
  chartTitle: string;
  /** Legend entry / tooltip series name. */
  seriesName: string;
  unit: string;
  data: BarPoint[];
  formatValue: (value: number) => string;
}

interface BloodPressureVitalConfig {
  kind: "bloodPressure";
  chartTitle: string;
  data: BloodPressurePoint[];
}

type VitalConfig = BarVitalConfig | BloodPressureVitalConfig;

// ---------------------------------------------------------------------------
// Mock history — one shared set of date buckets across the three bar vitals so
// they read as a single longitudinal record. BMI is derived from the weight
// series at a fixed height (1.799 m) so the two series stay consistent, and the
// most recent point lands on the value shown on the vitals card (27.81 kg/m2).
// ---------------------------------------------------------------------------

const WEIGHT_HISTORY: BarPoint[] = [
  { date: "Nov 1999", value: 86 },
  { date: "Apr 2000", value: 88 },
  { date: "Sep 2011", value: 88 },
  { date: "Sep 2012", value: 86 },
  { date: "May 2017", value: 72.5 },
  { date: "Feb 2020", value: 64 },
  { date: "Sep 2023", value: 90 },
];

const BMI_HISTORY: BarPoint[] = [
  { date: "Nov 1999", value: 26.57 },
  { date: "Apr 2000", value: 27.19 },
  { date: "Sep 2011", value: 27.19 },
  { date: "Sep 2012", value: 26.57 },
  { date: "May 2017", value: 22.4 },
  { date: "Feb 2020", value: 19.78 },
  { date: "Sep 2023", value: 27.81 },
];

const HEART_RATE_HISTORY: BarPoint[] = [
  { date: "Nov 1999", value: 74 },
  { date: "Apr 2000", value: 76 },
  { date: "Sep 2011", value: 72 },
  { date: "Sep 2012", value: 74 },
  { date: "May 2017", value: 70 },
  { date: "Feb 2020", value: 66 },
  { date: "Sep 2023", value: 68 },
];

// Diastolic genuinely starts late — the first two readings are systolic-only.
// Nulls are preserved so recharts breaks the navy line rather than inventing
// values that were never recorded.
const BLOOD_PRESSURE_HISTORY: BloodPressurePoint[] = [
  { date: "Nov 1999", systolic: 132, diastolic: null },
  { date: "Apr 2000", systolic: 145, diastolic: null },
  { date: "Sep 2011", systolic: 128, diastolic: 80 },
  { date: "Sep 2012", systolic: 132, diastolic: 88 },
  { date: "May 2017", systolic: 130, diastolic: 88 },
  { date: "Sep 2023", systolic: 160, diastolic: 78 },
  { date: "Oct 2023", systolic: 160, diastolic: 78 },
];

const trimDecimals = (value: number, places: number): string => {
  const fixed = value.toFixed(places);
  return fixed.replace(/\.?0+$/, "");
};

const VITAL_CONFIGS: Record<VitalKey, VitalConfig> = {
  weight: {
    kind: "bar",
    chartTitle: "Body weight",
    seriesName: "Body weight",
    unit: "kg",
    data: WEIGHT_HISTORY,
    formatValue: (value) => trimDecimals(value, 1),
  },
  bmi: {
    kind: "bar",
    chartTitle: "Body mass index (BMI)",
    seriesName: "Body mass index (BMI)",
    unit: "kg/m2",
    data: BMI_HISTORY,
    formatValue: (value) => value.toFixed(2),
  },
  heartRate: {
    kind: "bar",
    chartTitle: "Heart rate",
    seriesName: "Heart rate",
    unit: "/min",
    data: HEART_RATE_HISTORY,
    formatValue: (value) => trimDecimals(value, 0),
  },
  bp: {
    kind: "bloodPressure",
    chartTitle: "Blood Pressure History",
    data: BLOOD_PRESSURE_HISTORY,
  },
};

// ---------------------------------------------------------------------------
// Y-axis scaling for the bar charts
//
// The data label sits on top of each bar, so the tallest bar must never reach
// the top of the plot area or the label clips. We buy that room in the DOMAIN
// (a "nice" ceiling at least 6% above the tallest bar, rounded up to a clean
// tick step) rather than by letting the label overflow — plus a top margin on
// the chart as a second line of defence.
// ---------------------------------------------------------------------------

interface AxisScale {
  domain: [number, number];
  ticks: number[];
}

const buildBarAxis = (values: number[]): AxisScale => {
  const max = values.length > 0 ? Math.max(...values) : 1;
  const target = max * 1.06;
  const rawStep = target / 6;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? 10 * magnitude;
  const ceiling = Math.ceil(target / step) * step;
  const ticks: number[] = [];
  for (let tick = 0; tick <= ceiling + 1e-9; tick += step) {
    ticks.push(Number(tick.toFixed(4)));
  }
  return { domain: [0, ceiling], ticks };
};

// ---------------------------------------------------------------------------
// Blood-pressure data labels
//
// Systolic labels are placed ABOVE its line and diastolic BELOW its line, so
// the two series can never collide with each other — including on the flat
// repeated Sep 2023 / Oct 2023 segment where both series hold the same value
// across adjacent x positions. Null diastolic points render no label at all.
// ---------------------------------------------------------------------------

interface SeriesLabelProps {
  x?: number | string;
  y?: number | string;
  value?: number | string | null;
  fill?: string;
  placement?: "above" | "below";
}

const SeriesLabel: React.FC<SeriesLabelProps> = ({ x, y, value, fill, placement }) => {
  if (value === null || value === undefined || value === "") return null;
  const cx = typeof x === "number" ? x : Number(x);
  const cy = typeof y === "number" ? y : Number(y);
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  return (
    <text
      x={cx}
      y={placement === "below" ? cy + 17 : cy - 9}
      fill={fill}
      fontSize={11}
      fontWeight={600}
      textAnchor="middle"
    >
      {value}
    </text>
  );
};

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

const EmptyState: React.FC = () => (
  <div
    style={{
      height: 400,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      color: AXIS_GRAY,
      fontStyle: "italic",
    }}
  >
    No history recorded for this vital.
  </div>
);

const BarVitalChart: React.FC<{ config: BarVitalConfig }> = ({ config }) => {
  if (config.data.length === 0) return <EmptyState />;
  const axis = buildBarAxis(config.data.map((point) => point.value));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={config.data}
        margin={{ top: 24, right: 24, left: 0, bottom: 4 }}
        barCategoryGap="66%"
      >
        <CartesianGrid stroke={GRID_GRAY} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: AXIS_GRAY }}
          axisLine={{ stroke: GRID_GRAY }}
          tickLine={false}
        />
        <YAxis
          domain={axis.domain}
          ticks={axis.ticks}
          tick={{ fontSize: 11, fill: AXIS_GRAY }}
          axisLine={{ stroke: GRID_GRAY }}
          tickLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ fill: "rgba(76,125,240,0.08)" }}
          contentStyle={{
            backgroundColor: LABEL_DARK,
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            padding: "8px 10px",
          }}
          labelStyle={{ color: "#fff", fontWeight: 700, marginBottom: 2 }}
          itemStyle={{ color: "#fff" }}
          formatter={(value: number | string) => [
            `${config.formatValue(Number(value))} ${config.unit}`,
            config.seriesName,
          ]}
        />
        <Legend
          verticalAlign="top"
          align="center"
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, color: LABEL_DARK, paddingBottom: 12 }}
        />
        <Bar dataKey="value" name={config.seriesName} fill={BAR_BLUE} maxBarSize={44}>
          <LabelList
            dataKey="value"
            position="top"
            offset={6}
            fill={LABEL_DARK}
            fontSize={11}
            fontWeight={600}
            formatter={(value: number | string) => config.formatValue(Number(value))}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const BloodPressureChart: React.FC<{ config: BloodPressureVitalConfig }> = ({ config }) => {
  if (config.data.length === 0) return <EmptyState />;

  return (
    <ResponsiveContainer width="100%" height={400}>
      {/* Domain deliberately starts at 70, not 0 — a zero-based axis is wrong
          for blood pressure. The systolic peak sits on the domain ceiling
          (160), so the top margin, not the domain, provides room for its
          label. */}
      <LineChart data={config.data} margin={{ top: 28, right: 28, left: 0, bottom: 4 }}>
        <CartesianGrid stroke={GRID_GRAY} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: AXIS_GRAY }}
          axisLine={{ stroke: GRID_GRAY }}
          tickLine={false}
        />
        <YAxis
          domain={[70, 160]}
          ticks={[70, 80, 90, 100, 110, 120, 130, 140, 150, 160]}
          tick={{ fontSize: 11, fill: AXIS_GRAY }}
          axisLine={{ stroke: GRID_GRAY }}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: LABEL_DARK,
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            padding: "8px 10px",
          }}
          labelStyle={{ color: "#fff", fontWeight: 700, marginBottom: 2 }}
          itemStyle={{ color: "#fff" }}
          formatter={(value: number | string, name: string) => [`${value} mm[Hg]`, name]}
        />
        <Legend
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={9}
          wrapperStyle={{ fontSize: 12, color: LABEL_DARK, paddingTop: 8 }}
        />
        <Line
          type="monotone"
          dataKey="systolic"
          name="Systolic"
          stroke={SYSTOLIC_RED}
          strokeWidth={2}
          dot={{ r: 4, fill: SYSTOLIC_RED, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          connectNulls={false}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="systolic"
            content={<SeriesLabel placement="above" fill={SYSTOLIC_RED} />}
          />
        </Line>
        <Line
          type="monotone"
          dataKey="diastolic"
          name="Diastolic"
          stroke={DIASTOLIC_NAVY}
          strokeWidth={2}
          dot={{ r: 4, fill: DIASTOLIC_NAVY, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          connectNulls={false}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="diastolic"
            content={<SeriesLabel placement="below" fill={DIASTOLIC_NAVY} />}
          />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
};

// ---------------------------------------------------------------------------
// Modal shell — one component, driven by which vital was clicked.
// Overlay / backdrop-click behaviour matches the Medication Review modal in
// PatientAppointment.tsx; header chrome follows the Analysis screenshots.
// ---------------------------------------------------------------------------

export interface VitalsAnalysisModalProps {
  /** Which vital to chart. `null` closes the modal (nothing is mounted). */
  vital: VitalKey | null;
  onClose: () => void;
}

const TITLE_ID = "vitals-analysis-title";

/** Natively focusable descendants, in DOM order. */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const VitalsAnalysisModal: React.FC<VitalsAnalysisModalProps> = ({ vital, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // `onClose` is routinely passed as an inline arrow. Reading it through a ref
  // keeps the effect below keyed on `vital` alone, so no parent re-render can
  // tear the listener down and yank focus back to the close button mid-interaction.
  // The call site should still memoise it; this makes the component correct
  // regardless of what any consumer passes.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!vital) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const focusableElements = (): HTMLElement[] => {
      const root = dialogRef.current;
      if (!root) return [];
      return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      // Focus trap: Tab and Shift+Tab cycle within the dialog rather than
      // escaping to the page behind the scrim.
      const focusable = focusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !dialogRef.current?.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
    // Intentionally keyed on `vital` only — see `onCloseRef` above.
  }, [vital]);

  if (!vital) return null;
  const config = VITAL_CONFIGS[vital];

  return (
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
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        style={{
          backgroundColor: "#fff",
          borderRadius: 8,
          width: 920,
          maxWidth: "calc(100vw - 32px)",
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
            backgroundColor: NAVY,
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px 8px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span id={TITLE_ID} style={{ fontWeight: 700, fontSize: 15 }}>
            Analysis
          </span>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Close analysis"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px 20px", overflowY: "auto", flex: 1 }}>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: LABEL_DARK,
              margin: "0 0 10px",
            }}
          >
            {config.chartTitle}
          </h3>
          <div
            style={{
              border: `1px solid ${PANEL_BORDER}`,
              borderRadius: 8,
              padding: "12px 12px 8px",
              backgroundColor: "#fff",
            }}
          >
            {config.kind === "bar" ? (
              <BarVitalChart config={config} />
            ) : (
              <BloodPressureChart config={config} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalsAnalysisModal;
