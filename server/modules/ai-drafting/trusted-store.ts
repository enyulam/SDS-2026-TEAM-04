/**
 * The trusted generation-completion channel (B-7I-5) — the ONLY path to
 * `report_store_draft` (RPC-4), which holds ZERO client EXECUTE and must
 * stay that way (R-27; CLAUDE.md §12 stop-and-ask).
 *
 * WHY THIS SHAPE. The function is executable only by its owner, `postgres`.
 * The request-scoped client is the `authenticated` role and the elevated
 * client is `service_role` — which holds zero EXECUTE by standing rule
 * ("nothing may ever grant to it") — so NEITHER API client can reach RPC-4,
 * and that is the design, not a gap. The trusted channel therefore executes
 * inside the LOCAL database container as `postgres` via `docker exec`,
 * which authenticates by container-local trust — no password, connection
 * string or secret is read, held or transmitted by this module. This is a
 * LOCAL-STACK channel for the physical-test slice; a deployed environment
 * would replace the transport (e.g. a dedicated definer chain), never the
 * posture.
 *
 * AUTHORITY IS NOT ADDED HERE. The channel sets `request.jwt.claims` to the
 * VERIFIED caller identity (the `sub` returned by `auth.getUser()`, never a
 * value from the request body), and `report_store_draft` then re-derives
 * and re-proves the live trainer/session relationship itself, exactly as it
 * would for any caller. Running as `postgres` grants transport, not
 * authorization.
 *
 * INJECTION SAFETY. Values travel as argv elements to `docker exec` (no
 * shell), then as psql `-v` variables consumed with `:'quoted'` expansion
 * outside any dollar-quoted body, then as GUCs read back with
 * `current_setting()` inside the DO block. At no point is user text
 * concatenated into SQL.
 */

import { spawn } from "node:child_process";

const CONTAINER = "supabase_db_best-coach-mvp";

export interface StoreDraftRequest {
  /** The VERIFIED auth user id (auth.getUser().user.id) — never client-supplied. */
  readonly authUserSub: string;
  readonly reportId: string;
  readonly expectedLockVersion: number;
  readonly observationLockVersion: number;
  readonly overview: string;
  readonly strengths: string;
  readonly areasForDevelopment: string;
  readonly remarks: string;
}

export type StoreDraftResult =
  | {
      readonly ok: true;
      readonly status: string;
      readonly lockVersion: number;
      readonly versionId: string;
      readonly revisionNumber: number;
      readonly contentHash: string;
    }
  | { readonly ok: false; readonly sqlState: string };

export interface TrustedDraftStore {
  storeDraft(request: StoreDraftRequest): Promise<StoreDraftResult>;
  /** Injectable for tests: the database the channel talks to (default: the live local database). */
  readonly database: string;
}

const SQL = `
\\set ON_ERROR_STOP on
SELECT pg_catalog.set_config('request.jwt.claims',
         pg_catalog.json_build_object('sub', :'bc_sub', 'role', 'authenticated')::text, false),
       pg_catalog.set_config('bc.rid',   :'bc_rid',   false),
       pg_catalog.set_config('bc.lock',  :'bc_lock',  false),
       pg_catalog.set_config('bc.olock', :'bc_olock', false),
       pg_catalog.set_config('bc.p1',    :'bc_p1',    false),
       pg_catalog.set_config('bc.p2',    :'bc_p2',    false),
       pg_catalog.set_config('bc.p3',    :'bc_p3',    false),
       pg_catalog.set_config('bc.p4',    :'bc_p4',    false);
DO $trusted$
DECLARE v record; v_code text;
BEGIN
  BEGIN
    SELECT * INTO v FROM public.report_store_draft(
      pg_catalog.current_setting('bc.rid')::uuid,
      pg_catalog.current_setting('bc.lock')::integer,
      pg_catalog.current_setting('bc.olock')::integer,
      pg_catalog.current_setting('bc.p1'),
      pg_catalog.current_setting('bc.p2'),
      pg_catalog.current_setting('bc.p3'),
      pg_catalog.current_setting('bc.p4'));
    RAISE NOTICE 'TRUSTED_STORE_OK %', pg_catalog.json_build_object(
      'status', v.status, 'lock_version', v.lock_version,
      'report_version_id', v.report_version_id,
      'revision_number', v.revision_number, 'content_hash', v.content_hash)::text;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_code = RETURNED_SQLSTATE;
    RAISE NOTICE 'TRUSTED_STORE_ERR %', v_code;
  END;
END $trusted$;
`;

export class LocalTrustedDraftStore implements TrustedDraftStore {
  // Assigned explicitly (no TS parameter property) so Node's erasable-syntax
  // type stripping can execute this module in the integration suite.
  public readonly database: string;

  constructor(database: string = "postgres") {
    this.database = database;
  }

  storeDraft(request: StoreDraftRequest): Promise<StoreDraftResult> {
    const args = [
      "exec", "-i", CONTAINER, "psql", "--no-psqlrc", "--username=postgres",
      `--dbname=${this.database}`, "--quiet",
      "-v", `bc_sub=${request.authUserSub}`,
      "-v", `bc_rid=${request.reportId}`,
      "-v", `bc_lock=${String(request.expectedLockVersion)}`,
      "-v", `bc_olock=${String(request.observationLockVersion)}`,
      "-v", `bc_p1=${request.overview}`,
      "-v", `bc_p2=${request.strengths}`,
      "-v", `bc_p3=${request.areasForDevelopment}`,
      "-v", `bc_p4=${request.remarks}`,
    ];
    return new Promise((resolve) => {
      const child = spawn("docker", args, { stdio: ["pipe", "pipe", "pipe"] });
      let err = "";
      child.stderr.on("data", (d) => { err += d; });
      child.stdout.on("data", () => { /* no stdout is consumed */ });
      child.on("close", () => {
        const ok = /TRUSTED_STORE_OK (\{.*\})/.exec(err);
        if (ok) {
          try {
            const row = JSON.parse(ok[1]) as {
              status: string; lock_version: number; report_version_id: string;
              revision_number: number; content_hash: string;
            };
            resolve({
              ok: true,
              status: row.status,
              lockVersion: row.lock_version,
              versionId: row.report_version_id,
              revisionNumber: row.revision_number,
              contentHash: row.content_hash,
            });
            return;
          } catch {
            resolve({ ok: false, sqlState: "XXCHN" });
            return;
          }
        }
        const failed = /TRUSTED_STORE_ERR ([A-Z0-9]+)/.exec(err);
        resolve({ ok: false, sqlState: failed ? failed[1] : "XXCHN" });
      });
      child.stdin.end(SQL);
    });
  }
}
