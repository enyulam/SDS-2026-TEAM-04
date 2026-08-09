import "server-only";

/**
 * HOSTED trusted draft channel — SERVER-ONLY.
 *
 * ---------------------------------------------------------------------
 * WHY THIS EXISTS, AND WHAT IT DELIBERATELY DOES NOT CHANGE
 * ---------------------------------------------------------------------
 * `report_store_draft` is executable ONLY by its owner, `postgres`. It holds
 * ZERO client EXECUTE (R-27) and that is the architecture, not a gap: the
 * application cannot reach it through PostgREST under any caller's identity.
 *
 * `LocalTrustedDraftStore` bridges that gap with `docker exec` into the local
 * container. On a serverless host there is no Docker and no local container,
 * so that transport simply does not exist there.
 *
 * ⚠️ THIS CLASS CHANGES THE TRANSPORT TO THE PRIVILEGED ROLE AND NOTHING
 * ELSE. The Operator expressly REJECTED the two alternatives:
 *
 *   · granting `service_role` EXECUTE on `report_store_draft` — R-27 names
 *     this explicitly, `service_role` is reachable from ANY server context,
 *     and granting it widens the exact boundary this architecture exists to
 *     demonstrate;
 *   · an Edge Function — a new deployment surface, runtime and auth path,
 *     none of which is built.
 *
 * So: NO new grant. NO `BYPASSRLS`. NO broad table privileges. The ACL model
 * is byte-identical before and after this file — `prove-trusted-store-acl`
 * asserts exactly that, and it is the proof that this file is a transport
 * change rather than a privilege change.
 *
 * ---------------------------------------------------------------------
 * SEMANTIC EQUIVALENCE WITH THE LOCAL CHANNEL
 * ---------------------------------------------------------------------
 * The local channel runs one `DO` block, which is one psql statement in one
 * session, so the draft store and its spec §20 source trace commit together
 * or roll back together. That atomicity is load-bearing: a version must never
 * commit with a half-written trace, and the map must never be silently
 * skipped.
 *
 * This channel reproduces it with an EXPLICIT TRANSACTION. Both calls run
 * inside `sql.begin()`, so a source-map failure aborts the draft store with
 * it. The local channel converts a failure into a `NOTICE` carrying the
 * SQLSTATE; here the driver throws and the SQLSTATE is read from the error's
 * `code`, and the transaction rolls back. Same guarantee, same
 * `{ ok: false, sqlState }` shape.
 *
 * `set_config('request.jwt.claims', …, false)` is issued inside the same
 * transaction, exactly as the local channel does, so the RPC re-derives every
 * relationship from the claims this channel sets rather than trusting a
 * caller-supplied one. `authUserSub` is the VERIFIED `auth.getUser()` id.
 *
 * ---------------------------------------------------------------------
 * INJECTION SAFETY
 * ---------------------------------------------------------------------
 * Every value is a BOUND PARAMETER via postgres.js tagged templates — never
 * interpolated into SQL text. The local channel achieves the same thing with
 * psql `-v` variables consumed through `:'quoted'` expansion.
 *
 * ---------------------------------------------------------------------
 * CREDENTIAL DISCIPLINE
 * ---------------------------------------------------------------------
 * The connection string embeds the database password. It is read from the
 * environment into memory, is NEVER logged, never placed in an error, and
 * never returned. On failure this class surfaces a SQLSTATE and nothing else.
 */

import postgres from "postgres";
import type {
  StoreDraftRequest,
  StoreDraftResult,
  TrustedDraftStore,
} from "@/server/modules/ai-drafting/trusted-store";

/**
 * ⚠️ SERVER-ONLY. Must NEVER carry a `NEXT_PUBLIC_` prefix: that prefix is the
 * only thing that puts a variable into the browser bundle, and this value is
 * an owner-level database credential.
 */
export const HOSTED_DB_URL_VAR = "SUPABASE_DB_POOLED_URL" as const;

/** SQLSTATE used when the channel itself failed rather than the RPC. */
const CHANNEL_FAILURE = "XXCHN";

/**
 * Lazily created, then reused across warm invocations. A serverless instance
 * that opened a fresh pool per request would exhaust the pooler under load.
 */
let cached: postgres.Sql | null = null;

function connection(): postgres.Sql {
  if (cached) return cached;
  const url = process.env[HOSTED_DB_URL_VAR];
  if (typeof url !== "string" || url.trim() === "") {
    // The variable name is named; its value never is.
    throw new Error(`[E_SRV_DB_URL_MISSING] ${HOSTED_DB_URL_VAR} must be present and non-blank`);
  }
  cached = postgres(url.trim(), {
    // ⚠️ REQUIRED for Supabase's TRANSACTION-mode pooler (port 6543), which
    // is the mode a serverless deployment must use. PgBouncer in transaction
    // mode does not support session-level prepared statements, and leaving
    // this on produces intermittent "prepared statement already exists"
    // failures that look like application bugs.
    prepare: false,
    // One connection per serverless instance. The POOLER does the pooling;
    // a large local pool multiplied by every warm instance is what exhausts
    // the upstream limit.
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    // Never let the driver print a connection string or query text.
    onnotice: () => {},
    debug: false,
  });
  return cached;
}

export class HostedTrustedDraftStore implements TrustedDraftStore {
  public readonly database: string;

  constructor(database: string = "postgres") {
    this.database = database;
  }

  async storeDraft(request: StoreDraftRequest): Promise<StoreDraftResult> {
    let sql: postgres.Sql;
    try {
      sql = connection();
    } catch {
      // A missing/blank URL is a configuration failure, not an RPC failure.
      return { ok: false, sqlState: CHANNEL_FAILURE };
    }

    try {
      const claims = JSON.stringify({ sub: request.authUserSub, role: "authenticated" });

      return await sql.begin(async (tx) => {
        // Same transaction as both calls below — the RPC re-derives every
        // relationship from these claims.
        await tx`SELECT pg_catalog.set_config('request.jwt.claims', ${claims}, false)`;

        const stored = await tx`
          SELECT * FROM public.report_store_draft(
            ${request.reportId}::uuid,
            ${request.expectedLockVersion}::integer,
            ${request.observationLockVersion}::integer,
            ${request.overview},
            ${request.strengths},
            ${request.areasForDevelopment},
            ${request.remarks})`;

        const v = stored[0];
        if (!v) throw new Error("the trusted store returned no row");

        // SAME TRANSACTION as the store above: the version and its spec §20
        // source trace commit together or roll back together. A source-map
        // failure aborts the draft store with it, so the map can never be
        // silently skipped and a version can never commit with a half-written
        // trace.
        const mapped = await tx`
          SELECT x.entries_written
            FROM public.report_store_source_map(
              ${v.report_version_id}::uuid,
              ${request.sourceMapJson}::jsonb) AS x`;

        const entries = mapped[0]?.entries_written;
        if (entries === undefined || entries === null) {
          throw new Error("the source map step returned no count");
        }

        return {
          ok: true as const,
          status: String(v.status),
          lockVersion: Number(v.lock_version),
          versionId: String(v.report_version_id),
          revisionNumber: Number(v.revision_number),
          contentHash: String(v.content_hash),
          sourceMapEntries: Number(entries),
        };
      });
    } catch (error: unknown) {
      // SQLSTATE only. The error's message could carry query text or
      // connection detail and is never surfaced.
      const code = (error as { code?: unknown } | null)?.code;
      return {
        ok: false,
        sqlState: typeof code === "string" && /^[A-Z0-9]+$/.test(code) ? code : CHANNEL_FAILURE,
      };
    }
  }
}
