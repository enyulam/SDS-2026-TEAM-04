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
  /**
   * The spec §20 source trace for the version this call creates, as JSON
   * text: an array of `{output_section, dimension_code}`. Derived by
   * `deriveSourceMap` from the ACCEPTED panels and the frozen grounding
   * lexicon, so it contains ONLY closed literals — four section names and
   * nine dimension codes — and never user or model text.
   *
   * `"[]"` is a LEGITIMATE value: accepted prose that names none of the nine
   * dimensions in the lexicon's terms has an empty trace. It is written as
   * an empty map, not skipped, so "no dimension was mentioned" and "the map
   * step did not run" are never the same recorded state.
   */
  readonly sourceMapJson: string;
}

export type StoreDraftResult =
  | {
      readonly ok: true;
      readonly status: string;
      readonly lockVersion: number;
      readonly versionId: string;
      readonly revisionNumber: number;
      readonly contentHash: string;
      /** Rows written to `report_source_map` for this version; 0 is legitimate. */
      readonly sourceMapEntries: number;
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
       pg_catalog.set_config('bc.p4',    :'bc_p4',    false),
       pg_catalog.set_config('bc.smap',  :'bc_smap',  false);
DO $trusted$
DECLARE v record; v_map integer; v_code text;
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
    -- SAME TRANSACTION, and SAME subtransaction as the store above: this
    -- one DO block is one psql statement in one session, so the version and
    -- its spec §20 source trace commit together or roll back together. A
    -- source-map failure lands in the handler below and takes the draft
    -- store with it -- the map can never be silently skipped, and a version
    -- can never commit with a half-written trace.
    SELECT x.entries_written INTO v_map
      FROM public.report_store_source_map(
        v.report_version_id,
        pg_catalog.current_setting('bc.smap')::jsonb) AS x;
    RAISE NOTICE 'TRUSTED_STORE_OK %', pg_catalog.json_build_object(
      'status', v.status, 'lock_version', v.lock_version,
      'report_version_id', v.report_version_id,
      'revision_number', v.revision_number, 'content_hash', v.content_hash,
      'source_map_entries', v_map)::text;
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
      "-v", `bc_smap=${request.sourceMapJson}`,
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
              source_map_entries: number;
            };
            resolve({
              ok: true,
              status: row.status,
              lockVersion: row.lock_version,
              versionId: row.report_version_id,
              revisionNumber: row.revision_number,
              contentHash: row.content_hash,
              sourceMapEntries: row.source_map_entries,
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
