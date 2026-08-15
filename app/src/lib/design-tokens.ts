/**
 * CareTalk360 — design token module
 *
 * SSOT for every non-Tailwind color value in this app. Governed by
 * GL-003 Design System v2.3 (Team Knowledge/Guidelines/GL-003-design-system.md).
 * Sections consumed: §10.1, §10.1a, §10.5, §10.6, §13.1, §13.2, §13.3.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 * ---------------------------------------------------------------------------
 * GL-003 §13 places CareTalk360 in "Layer C" — a registered quarantine for hex
 * values that exist because this app replicates the caretalkbeta.com production
 * screen, not because anyone chose them. §13.1(3) requires those borrowed values
 * to live in ONE module the replica imports. Inline hex is not Layer C; it is
 * unregistered drift regardless of intent.
 *
 * A value is only legal in this app if it appears below.
 *
 * ---------------------------------------------------------------------------
 * TWO STYLING CONSUMERS, ONE SOURCE OF TRUTH
 * ---------------------------------------------------------------------------
 * This app has two styling systems and neither is being asked to convert:
 *
 *   1. INLINE STYLES — PatientAppointment.tsx, AppointmentReport.tsx, and the
 *      components/forms/* modals write `style={{ ... }}` objects directly.
 *      They consume this file by importing the constants below.
 *
 *   2. TAILWIND + shadcn — the rest of the app. It consumes semantic color
 *      scales declared in `tailwind.config.ts`, each of which resolves through
 *      an HSL custom property in `index.css`.
 *
 * The bridge between them is deliberately NOT a second Tailwind color scale.
 * Adding `bg-cth-success` alongside the existing `bg-success` would create a
 * parallel vocabulary with two spellings for one color — the exact duplication
 * this module exists to remove. Instead:
 *
 *   - `index.css` `--success` carries the HSL form of CTH_STATUS.success.
 *   - `design-tokens.test.ts` parses `index.css`, converts that HSL back to
 *     hex, and asserts it equals CTH_STATUS.success.
 *
 * So the Tailwind path is the existing `bg-success` / `text-success` utilities,
 * and the two representations cannot silently drift — the test fails first.
 * Any Tailwind consumer needing success-green uses `text-success` / `bg-success`.
 * Raw `text-green-600` / `bg-green-500` are banned (GL-003 §10.5).
 */

/** A 6-digit uppercase hex color. */
export type HexColor = `#${string}`;

/**
 * LAYER B — CTH functional state tokens. GL-003 §10.5.
 *
 * Derived, not chosen: danger stays in the coral family, every status token
 * sits in navy's lightness band, and every one carries white text at AA.
 * These are brand tokens and survive the Layer C exit — they are NOT borrowed.
 */
export const CTH_STATUS = {
  /**
   * Brick. `--cth-status-danger`. 6.90:1 with white — AA all sizes.
   * Destructive and emergency controls: 911/PSAP, delete, revoke, terminate.
   * Never a marketing accent; coral `#E7745E` is the accent and they are never
   * substituted for each other (GL-003 §10.5).
   * Danger is never signalled by color alone — every Brick control also carries
   * a word or glyph stating the consequence.
   */
  danger: "#9B3A31",

  /**
   * Field. `--cth-status-success`. 5.20:1 with white — AA all sizes.
   * Reversible: also 5.20:1 as text on white, so a solid pill and an outlined
   * pill carry the same semantic without a second value.
   *
   * Means CONFIRMED, not merely present. A pill is Field only when the thing
   * it marks is genuinely closed / reconciled / active — never as a decorative
   * "this row exists" tint.
   *
   * Replaces `#16A34A` (3.30:1, FAILS AA), retired by GL-003 §13.3.
   */
  success: "#137D41",

  /** Brick @ 10% — tinted alert banner behind Brick text. GL-003 §10.5. */
  dangerSoft: "rgba(155, 58, 49, 0.1)",

  /** Field @ 10% — tinted chip behind Field text. GL-003 §10.5. */
  successSoft: "rgba(19, 125, 65, 0.1)",
} as const;

/**
 * LAYER B — CTH surface + focus tokens. GL-003 §10.1a, §10.6.
 * Listed for the migration at Layer C exit; not all are wired yet.
 */
export const CTH_SURFACE = {
  /** CTH navy. The resting navy for any CTH-branded control. GL-003 §10.1. */
  navy: "#0658A0",
  /** `--cth-navy-deep`. Hover/pressed step under a navy fill. Never at rest. */
  navyDeep: "#054B88",
  /** `--cth-surface-canvas`. Full-page app ground behind white cards. */
  canvas: "#F3F7FA",
  /** Pale Blue — card/section tint. A tint, never a page ground. */
  paleBlue: "#E6F0F9",
} as const;

/**
 * LAYER B — focus indicator. GL-003 §10.6.
 * 2px solid ring at 2px offset. Never alpha-tinted; never the UA default.
 * Bind to :focus-visible, not :focus.
 */
export const CTH_FOCUS = {
  /** Navy ring for controls on white, Canvas, or Pale Blue. 7.21:1 on white. */
  ring: "#0658A0",
  /** White ring for controls on navy chrome. 7.21:1 on navy. */
  ringInverse: "#FFFFFF",
  width: "2px",
  offset: "2px",
} as const;

/**
 * NEUTRAL RAMP — hoisted, NOT authored. Parked for Iris (OPEN item 6 below).
 *
 * GL-003 Layer B (§10.1) ships exactly two greys — Medium Gray `#505050` for
 * body text and Light Gray `#E6E6E6` for dividers. A data table needs a ramp:
 * a control border, a table rule, a row divider, and three text weights that
 * are distinguishable from each other. Two values cannot express six roles.
 *
 * Every hex below is ALREADY SHIPPED in this app as an inline literal — these
 * are the Tailwind default greys the Lovable export left behind, used verbatim
 * in PatientAppointment.tsx, AppointmentReport.tsx and the components/forms
 * modals. Nothing here is new. This block does one thing: makes them greppable
 * and migratable in one place instead of scattered across seven files, which is
 * what GL-003 §13.1(3) asks of any value that is not a deliberate brand choice.
 *
 * DELIBERATELY NOT in `REPLICA` below — that register is FROZEN (§13.3) and
 * closed to additions without an Iris ruling. DELIBERATELY NOT in `CTH_*` above
 * — that would claim a brand sanction these values do not have.
 *
 * ACCESSIBILITY NOTE, and the reason `#9CA3AF` is absent: the shipped code uses
 * it for the `—` empty-value placeholder, which is 2.54:1 on white and FAILS
 * WCAG AA. GL-003 §13.2 puts contrast above fidelity, so it is not hoisted and
 * not available. Empty-value placeholders use `textMuted` (4.83:1).
 */
export const UI_NEUTRAL = {
  /** Panel and cell ground. */
  surface: "#FFFFFF",
  /** Row separators and hover fill. */
  divider: "#F3F4F6",
  /** Control borders — inputs, buttons, unchecked checkbox. */
  border: "#D1D5DB",
  /** Table rules and card outlines. One step lighter than `border`. */
  borderSubtle: "#E5E7EB",
  /** Helper text, column labels, empty-value `—`. 4.83:1 on white — AA. */
  textMuted: "#6B7280",
  /** Default cell copy. 10.31:1 on white — AAA. */
  textBody: "#374151",
  /** Emphasised copy — row titles, progress figures. 14.68:1 on white — AAA. */
  textStrong: "#1F2937",
} as const;

/**
 * LAYER C — QUARANTINE. GL-003 §13.3 register, CareTalk360 scope.
 *
 * These hexes exist ONLY because this app reconstructs the caretalkbeta.com
 * vendor screen. They are borrowed, not chosen. The register is FROZEN —
 * closed to additions without an Iris ruling.
 *
 * EXIT: when CareTalk360 ships as a CTH-branded product rather than a vendor
 * reconstruction, every value here migrates to its `layerBTarget` below and
 * this whole const is deleted.
 *
 * Fidelity buys chrome color and nothing else (GL-003 §13.2):
 *   - WCAG AA outranks fidelity. A source-screen value that fails AA is not
 *     replicated; it is substituted. `#16A34A` was retired for exactly this.
 *   - Net-new controls are Layer B, never Layer C. A control with no source-
 *     screen counterpart uses CTH_STATUS / CTH_SURFACE above.
 */
export const REPLICA = {
  /**
   * Replica navy. 11.50:1 with white — AA/AAA.
   * Chrome, button borders, vitals card titles, active tab underline.
   * Note this is NOT CTH navy `#0658A0`. It is a third navy, which is precisely
   * the leak Layer C exists to bound and label rather than to bless.
   */
  navy: "#1E3A5F",

  /** Replica blue. 5.17:1 with white — AA. SnapBP buttons, vitals chart glyph. */
  blue: "#2563EB",

  /**
   * Analysis bar-chart fill. 3.82:1 — FAILS AA for text, passes the 3:1
   * non-text bar. CHART FILL ONLY. Never a label on it, never a button fill.
   */
  chartBar: "#4C7DF0",

  /**
   * Systolic BP chart line. 5.44:1 with white — AA.
   * CHART LINE ONLY. Not for controls — that is CTH_STATUS.danger's job, and
   * two reds on one screen with different meanings is the confusion the
   * register exists to prevent.
   */
  chartSystolic: "#C0392B",
} as const;

/**
 * Layer C exit map. Each REPLICA key resolves to the CTH token it becomes when
 * this app stops being a reconstruction. Written now, while the context is
 * fresh, so the migration is a lookup rather than an archaeology project.
 */
export const REPLICA_EXIT_MAP: Readonly<Record<keyof typeof REPLICA, HexColor>> = {
  navy: CTH_SURFACE.navy,
  blue: CTH_SURFACE.navy,
  chartBar: "#5FC7EF",
  chartSystolic: REPLICA.chartSystolic, // chart ramp TBD at exit — GL-003 §13.3
} as const;

/**
 * RETIRED — do not reintroduce.
 *
 * Kept as a named, greppable record so a future contributor who finds one of
 * these in a screenshot, a Lovable export, or a Tailwind default learns why it
 * is gone instead of re-adding it. Nothing imports these values as colors.
 */
export const RETIRED = {
  /** 3.30:1 on white — FAILS WCAG AA. Retired by GL-003 §13.3. → CTH_STATUS.success */
  "#16A34A": "CTH_STATUS.success (#137D41)",
  /** Tailwind green-500. Banned on CTH surfaces by GL-003 §10.5. → CTH_STATUS.success */
  "#22C55E": "CTH_STATUS.success (#137D41)",
  /** Tailwind red-500. Banned on CTH surfaces by GL-003 §10.5. → CTH_STATUS.danger */
  "#EF4444": "CTH_STATUS.danger (#9B3A31)",
  /** Tailwind red-600. Banned on CTH surfaces by GL-003 §10.5. → CTH_STATUS.danger */
  "#DC2626": "CTH_STATUS.danger (#9B3A31)",
  /**
   * Improvised page background. COLLAPSED into `--cth-surface-canvas` under the
   * GL-003 §13.1(5) collapse test (Δ 3/6/3). Never a fidelity requirement.
   * Migrated out of MainLayout.tsx 2026-07-27; the §13.3 register row retires.
   */
  "#F0F1F7": "CTH_SURFACE.canvas (#F3F7FA)",
} as const satisfies Readonly<Record<string, string>>;

/**
 * The exact HSL triple written into `index.css` as `--success`, and the hex it
 * must round-trip to. Asserted in `design-tokens.test.ts`.
 *
 * Derivation of `#137D41`:
 *   rgb(19, 125, 65)
 *   max=125/255=0.490196  min=19/255=0.074510  Δ=0.415686
 *   L = (max+min)/2      = 0.282353  → 28.2353%
 *   S = Δ / (1-|2L-1|)   = 0.736111  → 73.6111%
 *   H = 60·((b-r)/Δ + 2) = 146.0377°   (max channel is green)
 *
 * Truncated to 1dp — `hsl(146 73.6% 28.2%)` — the browser resolves to
 * rgb(18.984, 124.836, 64.853), which rounds to rgb(19, 125, 65) = #137D41 exactly.
 */
export const SUCCESS_HSL_TRIPLE = "146 73.6% 28.2%";

/**
 * ---------------------------------------------------------------------------
 * OPEN — parked for Iris, deliberately NOT improvised here
 * ---------------------------------------------------------------------------
 * 1. No hover/pressed step exists for either status token. GL-003 §10.1a grants
 *    `--cth-navy-deep` for navy only and calls it "the ONLY sanctioned darker
 *    navy". Success/danger hover currently uses a CSS `brightness()` filter,
 *    which darkens without introducing a new hex. Requested: a Field/Brick
 *    pressed step under the same 85%-luminance-scale derivation.
 * 2. No category-hue set exists for Layer B. GL-003 §2.5 covers Layer A only.
 *    AppointmentTypes.tsx carries a 10-hue category palette with no sanctioned
 *    home; routing any of it to CTH_STATUS would mislabel a category as a state.
 * 3. EditClient.tsx uses `#C0392B` on destructive controls with an `#E74C3C`
 *    hover. §13.3 registers `#C0392B` as CHART LINE ONLY and §10.5 assigns
 *    controls to Brick; `#E74C3C` has no sanctioned token at all.
 * 4. AppointmentReport.tsx `PeopleIcon` is stroked in CTH_STATUS.success, but
 *    its toolbar siblings are `#2563EB` (DocIcon) and `#1E293B` (GearIcon) —
 *    three arbitrary hues on a three-icon set. That is a DECORATIVE palette,
 *    not a state system, so the green there means "people", not "confirmed",
 *    and §10.5's "green means confirmed, not merely present" is unsatisfied.
 *    It was `#16A34A` before the sweep, so this is inherited, not introduced —
 *    the sweep made it accessible without making it semantic. The honest fix is
 *    `currentColor` per the §12 O-6 interim icon spec, which is an icon-spec
 *    decision, not a color one. Parked for the O-6 pass.
 * 5. `med.status` badges in PatientAppointment.tsx still use `#DC2626`
 *    (stopped) and `#A16207` (unconfirmed). `#DC2626` is banned by name in
 *    §10.5 and listed in RETIRED above, but "stopped" is not a destructive
 *    CONTROL, so Brick is the wrong target. Genuine warning/info states are
 *    §12 O-10 — undefined and explicitly not to be improvised.
 * 6. Layer B has no NEUTRAL RAMP. §10.1 offers two greys; a data table needs
 *    six roles (control border, table rule, row divider, three text weights).
 *    `UI_NEUTRAL` above hoists the six values already shipped inline rather
 *    than inventing a seventh — but it is a registration surface, not a
 *    ruling. Requested from Iris: a sanctioned Layer B neutral ramp derived
 *    the same way §10.5 and §10.1a were, with a stated contrast floor per
 *    step. When it lands, `UI_NEUTRAL`'s values are replaced in place and
 *    every consumer picks up the change for free.
 *    Related finding, surfaced by the same pass: the `—` empty-value
 *    placeholder in the medication modal is `#9ca3af` = 2.54:1 on white and
 *    FAILS WCAG AA. Diagnostics does not reproduce it (uses `textMuted`).
 *    Back-porting to medications is parked with the other §7.3 med defects.
 */
