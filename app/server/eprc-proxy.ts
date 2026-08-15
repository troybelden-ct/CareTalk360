/**
 * NENA EPRC (Emergency Provisioning Registry Configuration) PSAP-lookup proxy.
 *
 * Vite dev-server middleware plugin. Keeps GeoComm sandbox credentials
 * server-side only — the browser never sees username/password or the
 * ArcGIS token. Exposes one clean local endpoint:
 *
 *   GET /api/eprc/psap?lat=<lat>&lng=<lng>
 *
 * See docs/20251126 EPRC Sandbox API v.11 3/ for the upstream spec
 * (docx + eprc_samples.postman_collection.json).
 *
 * Owner: Mack (Automation Specialist). Do not wire this into a client
 * bundle — server-side only.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

interface EprcConfig {
  username: string;
  password: string;
  tokenUrl: string;
  queryUrl: string;
  defaultLat: number;
  defaultLng: number;
  tokenExpirationMinutes: number;
}

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}

type ErrorKind = "bad_request" | "us_only" | "token" | "upstream" | "server_misconfigured";

class EprcError extends Error {
  kind: ErrorKind;
  constructor(kind: ErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

// Token cache is module-scoped — survives across requests within the same
// dev-server process. Refreshed on expiry or on an upstream auth error.
let cachedToken: CachedToken | null = null;

const TOKEN_SAFETY_MARGIN_MS = 2 * 60 * 1000; // refresh 2 min before real expiry
const RETRY_ATTEMPTS = 2; // total tries = RETRY_ATTEMPTS + 1
const RETRY_BASE_DELAY_MS = 300;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maskToken(token: string): string {
  if (!token) return "";
  return token.length <= 8 ? "***" : `${token.slice(0, 4)}...${token.slice(-4)}`;
}

/**
 * Strips known secrets (token, password, username) out of a string, plus a
 * catch-all for any other long opaque token-shaped substring. Applied to
 * every upstream-sourced error string before it's logged or (in the rare
 * case it's used internally) surfaced anywhere. The query endpoint carries
 * the ArcGIS token as a URL query param — if ArcGIS ever echoes the request
 * URL back in an error body, this keeps that token from propagating.
 */
function redactSecrets(text: string, ...secrets: (string | undefined)[]): string {
  let out = text;
  for (const secret of secrets) {
    if (secret) out = out.split(secret).join("[REDACTED]");
  }
  return out.replace(/[A-Za-z0-9_-]{24,}/g, "[REDACTED]");
}

/**
 * Fixed, safe messages returned to the browser for upstream-sourced error
 * kinds. We deliberately never forward `data.error.message` from ArcGIS to
 * the client — only use it server-side (redacted) for logging/diagnostics.
 * `bad_request` and `server_misconfigured` are self-authored (never
 * upstream-sourced) so they're safe to keep specific and actionable.
 */
const CLIENT_SAFE_MESSAGE: Record<ErrorKind, string> = {
  bad_request: "lat and lng must be numeric.",
  us_only: "PSAP lookup requests must originate from within the United States.",
  token: "Unable to authenticate with the PSAP lookup service right now. Please try again shortly.",
  upstream: "The PSAP lookup service is temporarily unavailable. Please try again shortly.",
  server_misconfigured: "PSAP lookup is not configured on this server.",
};

function log(event: string, data: Record<string, unknown> = {}): void {
  // Structured, single-line JSON logs. NEVER include credentials or the raw
  // token here — only masked previews.
  console.log(
    JSON.stringify({
      service: "eprc-proxy",
      event,
      timestamp: new Date().toISOString(),
      ...data,
    })
  );
}

/** Retries idempotent GETs/POSTs on network failure or 5xx with exponential backoff. */
async function fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status >= 500 && attempt < RETRY_ATTEMPTS) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < RETRY_ATTEMPTS) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
        continue;
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("EPRC upstream request failed");
}

function readEnvConfig(env: Record<string, string>): EprcConfig {
  const username = env.EPRC_USERNAME;
  const password = env.EPRC_PASSWORD;

  if (!username || !password) {
    throw new EprcError(
      "server_misconfigured",
      "EPRC_USERNAME and EPRC_PASSWORD are not set. Copy .env.example to .env and fill in credentials."
    );
  }

  const tokenUrl =
    env.EPRC_TOKEN_URL || "https://host1-gis-content-1.geocomm.cloud/arcgis/tokens/generateToken";
  const queryUrl =
    env.EPRC_QUERY_URL ||
    "https://host1-gis-content-1.geocomm.cloud/arcgis/rest/services/sandbox/NENA_EPRC_SAMPLE/FeatureServer/0/query";
  const defaultLat = Number(env.EPRC_DEFAULT_LAT ?? "33.80321");
  const defaultLng = Number(env.EPRC_DEFAULT_LNG ?? "-118.153234");
  const tokenExpirationMinutes = Number(env.EPRC_TOKEN_EXPIRATION_MINUTES ?? "1440");

  return { username, password, tokenUrl, queryUrl, defaultLat, defaultLng, tokenExpirationMinutes };
}

async function fetchNewToken(config: EprcConfig): Promise<CachedToken> {
  const body = new URLSearchParams({
    username: config.username,
    password: config.password,
    client: "requestip",
    expiration: String(config.tokenExpirationMinutes),
    f: "json",
  });

  let res: Response;
  try {
    res = await fetchWithRetry(config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch (err) {
    throw new EprcError(
      "upstream",
      redactSecrets(`EPRC token request failed: ${(err as Error).message}`, config.password, config.username)
    );
  }

  if (!res.ok) {
    throw new EprcError("upstream", `EPRC token request returned HTTP ${res.status}`);
  }

  const data = (await res.json()) as { token?: string; error?: { code?: number; message?: string } };

  if (data.error || !data.token) {
    throw new EprcError(
      "token",
      redactSecrets(data.error?.message || "EPRC token response missing token field", config.password, config.username)
    );
  }

  const expiresAt = Date.now() + config.tokenExpirationMinutes * 60 * 1000;
  log("token_generated", {
    expiresInMinutes: config.tokenExpirationMinutes,
    tokenPreview: maskToken(data.token),
  });

  return { token: data.token, expiresAt };
}

async function getToken(config: EprcConfig, forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedToken && cachedToken.expiresAt - TOKEN_SAFETY_MARGIN_MS > now) {
    return cachedToken.token;
  }
  cachedToken = await fetchNewToken(config);
  return cachedToken.token;
}

// The upstream FeatureServer echoes attribute keys in lowercase
// (psap_name, city, state, num24_emergency) regardless of the casing sent
// in outFields — confirmed against the live sandbox 2026-08-14. Normalize
// case-insensitively so a casing change upstream doesn't silently null out
// every field.
interface ArcGisFeature {
  attributes?: Record<string, string | null>;
}

function pickField(attributes: Record<string, string | null> | undefined, ...names: string[]): string | null {
  if (!attributes) return null;
  const lowerMap = new Map(Object.keys(attributes).map((k) => [k.toLowerCase(), k]));
  for (const name of names) {
    const key = lowerMap.get(name.toLowerCase());
    if (key !== undefined && attributes[key] !== undefined) return attributes[key];
  }
  return null;
}

interface ArcGisQueryResponse {
  features?: ArcGisFeature[];
  error?: { code?: number; message?: string; details?: string[] };
}

async function queryPsapRaw(
  config: EprcConfig,
  lat: number,
  lng: number,
  token: string
): Promise<ArcGisQueryResponse> {
  const geometry = JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } });
  const params = new URLSearchParams({
    geometry,
    geometryType: "esriGeometryPoint",
    outFields: "PSAP_NAME,City,State,Num24_emergency",
    returnGeometry: "false",
    f: "pjson",
    token,
  });

  let res: Response;
  try {
    res = await fetchWithRetry(`${config.queryUrl}?${params.toString()}`, { method: "POST" });
  } catch (err) {
    throw new EprcError("upstream", redactSecrets(`EPRC PSAP query failed: ${(err as Error).message}`, token));
  }

  if (!res.ok) {
    throw new EprcError("upstream", `EPRC PSAP query returned HTTP ${res.status}`);
  }

  return (await res.json()) as ArcGisQueryResponse;
}

/** ArcGIS invalid/expired token error codes. */
function isTokenError(data: ArcGisQueryResponse): boolean {
  return !!data.error && [498, 499, 403].includes(data.error.code ?? 0);
}

/** Best-effort detection of the "requests must originate in the US" rejection. */
function isUsRejection(data: ArcGisQueryResponse): boolean {
  if (!data.error) return false;
  const message = `${data.error.message ?? ""} ${(data.error.details ?? []).join(" ")}`.toLowerCase();
  return message.includes("united states") || message.includes("us only") || message.includes("origin");
}

export interface NormalizedPsap {
  name: string | null;
  city: string | null;
  state: string | null;
  emergency24: string | null;
}

async function lookupPsap(
  config: EprcConfig,
  lat: number,
  lng: number,
  retryOnTokenError = true
): Promise<NormalizedPsap[]> {
  const token = await getToken(config);
  const data = await queryPsapRaw(config, lat, lng, token);

  if (isTokenError(data)) {
    if (retryOnTokenError) {
      log("token_expired_refreshing");
      cachedToken = null;
      await getToken(config, true);
      return lookupPsap(config, lat, lng, false);
    }
    throw new EprcError(
      "token",
      redactSecrets(data.error?.message || "EPRC token invalid after refresh", token)
    );
  }

  if (isUsRejection(data)) {
    throw new EprcError(
      "us_only",
      redactSecrets(data.error?.message || "Location must be within the United States.", token)
    );
  }

  if (data.error) {
    throw new EprcError("upstream", redactSecrets(data.error.message || "EPRC returned an error.", token));
  }

  const features = Array.isArray(data.features) ? data.features : [];
  return features.map((f) => ({
    name: pickField(f.attributes, "PSAP_NAME"),
    city: pickField(f.attributes, "City"),
    state: pickField(f.attributes, "State"),
    emergency24: pickField(f.attributes, "Num24_emergency"),
  }));
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function statusForKind(kind: ErrorKind): number {
  switch (kind) {
    case "bad_request":
      return 400;
    case "us_only":
      return 422;
    case "token":
      return 502;
    case "upstream":
      return 502;
    case "server_misconfigured":
      return 500;
    default:
      return 500;
  }
}

/**
 * Vite plugin factory. `env` should be the fully-loaded env map (via
 * `loadEnv(mode, process.cwd(), "")` in vite.config.ts) so server-only vars
 * without a VITE_ prefix are visible here without ever reaching the client
 * bundle.
 */
export function eprcProxyPlugin(env: Record<string, string>): Plugin {
  return {
    name: "eprc-psap-proxy",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/eprc/psap", async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== "GET") {
          sendJson(res, 405, { error: "method_not_allowed", message: "Use GET." });
          return;
        }

        let config: EprcConfig;
        try {
          config = readEnvConfig(env);
        } catch (err) {
          const e = err as EprcError;
          log("config_error", { message: e.message });
          sendJson(res, statusForKind(e.kind), { error: e.kind, message: CLIENT_SAFE_MESSAGE[e.kind] });
          return;
        }

        const url = new URL(req.url ?? "", "http://localhost");
        const latParam = url.searchParams.get("lat");
        const lngParam = url.searchParams.get("lng");

        const lat = latParam !== null ? Number(latParam) : config.defaultLat;
        const lng = lngParam !== null ? Number(lngParam) : config.defaultLng;

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          sendJson(res, 400, {
            error: "bad_request",
            message: "lat and lng must be numeric.",
          });
          return;
        }

        try {
          const psaps = await lookupPsap(config, lat, lng);
          sendJson(res, 200, { psaps });
        } catch (err) {
          const e =
            err instanceof EprcError
              ? err
              : new EprcError("upstream", redactSecrets((err as Error).message));
          // e.message is the redacted, server-only diagnostic detail — logged
          // here, but NEVER sent to the client. The client always gets the
          // fixed CLIENT_SAFE_MESSAGE for its kind.
          log("request_failed", { kind: e.kind, message: e.message, lat, lng });
          sendJson(res, statusForKind(e.kind), { error: e.kind, message: CLIENT_SAFE_MESSAGE[e.kind] });
        }
      });
    },
  };
}
