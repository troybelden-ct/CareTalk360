/**
 * Typed client for the local EPRC PSAP-lookup proxy (`server/eprc-proxy.ts`).
 * The browser only ever talks to this same-origin endpoint — GeoComm
 * credentials and the ArcGIS token never leave the server.
 *
 * Backs the 911 "Emergency Services" modal. Modal wiring is Felix's — this
 * file is just fetch + types.
 */

export interface Psap {
  name: string | null;
  city: string | null;
  state: string | null;
  emergency24: string | null;
}

export interface PsapLookupResult {
  psaps: Psap[];
}

export interface PsapLookupErrorBody {
  error: "bad_request" | "us_only" | "token" | "upstream" | "server_misconfigured" | string;
  message: string;
}

export class PsapLookupError extends Error {
  status: number;
  code: string;
  constructor(status: number, body: PsapLookupErrorBody) {
    super(body.message);
    this.status = status;
    this.code = body.error;
  }
}

export interface FetchPsapOptions {
  lat?: number;
  lng?: number;
  signal?: AbortSignal;
}

/**
 * Looks up the PSAP(s) serving a lat/lng via the local `/api/eprc/psap`
 * proxy. Omit lat/lng to use the server's configured sandbox default
 * (useful for smoke-testing the flow before real patient coordinates are
 * wired in).
 */
export async function fetchPsap(options: FetchPsapOptions = {}): Promise<PsapLookupResult> {
  const params = new URLSearchParams();
  if (options.lat !== undefined) params.set("lat", String(options.lat));
  if (options.lng !== undefined) params.set("lng", String(options.lng));

  const qs = params.toString();
  const res = await fetch(`/api/eprc/psap${qs ? `?${qs}` : ""}`, {
    method: "GET",
    signal: options.signal,
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new PsapLookupError(res.status, {
      error: "upstream",
      message: "PSAP lookup returned a non-JSON response.",
    });
  }

  if (!res.ok) {
    throw new PsapLookupError(res.status, body as PsapLookupErrorBody);
  }

  return body as PsapLookupResult;
}
