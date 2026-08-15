import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { CTH_STATUS, SUCCESS_HSL_TRIPLE } from "./design-tokens";

const SRC_ROOT = path.resolve(__dirname, "..");
const INDEX_CSS = path.join(SRC_ROOT, "index.css");

/** hsl() -> #RRGGBB, matching the browser's float-then-round-to-8-bit behaviour. */
function hslTripleToHex(triple: string): string {
  const match = triple.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!match) throw new Error(`Not an HSL triple: "${triple}"`);
  const h = Number(match[1]);
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = l - c / 2;

  let rgb: [number, number, number];
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];

  return (
    "#" +
    rgb
      .map((v) =>
        Math.round((v + m) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
      .toUpperCase()
  );
}

/** WCAG 2.x relative-luminance contrast ratio between two #RRGGBB colors. */
function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(full);
  }
  return out;
}

describe("design tokens — SSOT bridge to the Tailwind theme", () => {
  it("index.css --success round-trips to CTH_STATUS.success", () => {
    // The Tailwind theme resolves `bg-success` / `text-success` through
    // hsl(var(--success)). This is the one place the hex is re-expressed, so
    // it is the one place that can drift. It cannot drift past this assertion.
    expect(hslTripleToHex(SUCCESS_HSL_TRIPLE)).toBe(CTH_STATUS.success);

    const css = readFileSync(INDEX_CSS, "utf8");
    const declarations = [...css.matchAll(/--success:\s*([^;]+);/g)].map((m) => m[1]);

    expect(declarations.length).toBeGreaterThan(0);
    for (const declaration of declarations) {
      expect(hslTripleToHex(declaration)).toBe(CTH_STATUS.success);
    }
  });
});

describe("design tokens — WCAG AA floors (GL-003 §10.5, §13.2)", () => {
  it("CTH_STATUS.success clears AA against white in both directions", () => {
    // Reversible token: same ratio as a white-on-fill pill and as text on white.
    expect(contrast(CTH_STATUS.success, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("CTH_STATUS.danger clears AA against white", () => {
    expect(contrast(CTH_STATUS.danger, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("the retired green would have failed — this is why it is retired", () => {
    expect(contrast("#16A34A", "#FFFFFF")).toBeLessThan(4.5);
  });
});

describe("design tokens — retired values do not come back", () => {
  // GL-003 §13.3 retired #16A34A everywhere. One documented exception survives:
  // AppointmentTypes.tsx renders it as a CATEGORY swatch keyed to the
  // "Follow-Up" appointment type, alongside nine other category hues, and
  // prints the hex string as visible text. Routing a category hue to
  // --cth-status-success would mislabel a category as "confirmed".
  // Layer B has no category-hue set — parked for Iris.
  const CATEGORY_HUE_EXCEPTION = path.join(SRC_ROOT, "pages", "AppointmentTypes.tsx");
  const TOKEN_MODULE = path.join(SRC_ROOT, "lib", "design-tokens.ts");
  const THIS_TEST = path.join(SRC_ROOT, "lib", "design-tokens.test.ts");

  it("#16A34A appears nowhere outside the documented category-swatch exception", () => {
    const offenders = walk(SRC_ROOT)
      .filter((f) => ![CATEGORY_HUE_EXCEPTION, TOKEN_MODULE, THIS_TEST].includes(f))
      .filter((f) => /#16a34a/i.test(readFileSync(f, "utf8")))
      .map((f) => path.relative(SRC_ROOT, f));

    expect(offenders).toEqual([]);
  });

  // Scoped deliberately to green-500 (#22C55E) and green-600 (#16A34A) — the two
  // values GL-003 §10.5 bans by name, and the two that carry a success meaning.
  //
  // NOT asserted here: the green-50/100/200/700/800 tint scale still used for
  // category chips and status badges in PreviousAppointmentsTab.tsx,
  // MedicationReviewModal.tsx and DiagnosisReviewModal.tsx. Those are off-palette
  // but they are not the AA failure this sweep addressed — text-green-800 on
  // bg-green-100 is 6.49:1 and text-green-700 on bg-green-100 is 4.57:1, both AA.
  // Layer B has no soft-tint category scale to route them to; parked for Iris.
  // Widen this regex the moment that ruling lands.
  it("the banned success greens (green-500 / green-600) are not used", () => {
    const offenders = walk(SRC_ROOT)
      .filter((f) => ![THIS_TEST, TOKEN_MODULE].includes(f))
      .filter((f) => /\b(?:text|bg|border|ring|fill|stroke)-green-[56]00\b/.test(readFileSync(f, "utf8")))
      .map((f) => path.relative(SRC_ROOT, f));

    expect(offenders).toEqual([]);
  });
});
