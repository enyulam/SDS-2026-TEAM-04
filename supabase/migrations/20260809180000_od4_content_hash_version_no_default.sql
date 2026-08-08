-- =====================================================================
-- M15 -- report_versions.content_hash_version: REMOVE THE DATABASE DEFAULT
-- =====================================================================
--
-- OPERATOR RULING (2026-08-09), implemented FORWARD-ONLY:
--
--   "report_versions.content_hash_version MUST HAVE NO DEFAULT.
--    V1 and V2 are both valid provenance formats. The version is integrity
--    metadata describing WHICH serializer produced the stored digest. It
--    must never be guessed implicitly by the database.
--    DEFAULT 1: REMOVE. Do NOT change it to DEFAULT 2.
--    Every version-producing write must state content_hash_version
--    explicitly."
--
-- GOVERNED SEMANTICS THIS MIGRATION PRESERVES (unchanged by it):
--   * historical V1 rows remain 1;
--   * new native OD-4 rows use 2 (G-05a item 4);
--   * a clone/copy operation preserves the SOURCE row's actual version,
--     as established by M14's report_reopen_submitted forward fix
--     (G-05a item 7 -- no silent relabelling in either direction);
--   * no default may silently convert either provenance.
--
-- EXISTING STORED VALUES ARE UNCHANGED. NO BACKMIGRATION. This migration
-- writes no data and adds, drops or renames no object: it removes exactly
-- one pg_attrdef row.
--
-- WHY A DEFAULT IS THE WRONG MECHANISM HERE. DEFAULT 1 was correct while
-- the CHECK constraint was `= 1` and exactly one serializer existed: the
-- value was not a choice, so the database could not guess wrong. M13
-- widened the constraint to IN (1, 2) and shipped a second serializer,
-- which turned the column into a genuine two-valued provenance label while
-- leaving a silent implicit answer behind it. M14 proved the cost of that
-- gap concretely -- report_reopen_submitted stamped a V1 label onto a V2
-- digest and no constraint could see it. An omitted column would now
-- silently mislabel a V2 digest as V1, exactly as M14's literal did, but
-- with no statement anywhere in the corpus to find. Removing the default
-- converts every such omission into a NOT NULL violation at write time.
--
-- WHY NOT DEFAULT 2. That would fix the current direction and re-create
-- the identical hazard in the other one: a legitimate V1-envelope write
-- that omitted the column would be silently relabelled 2, which is the
-- precise thing G-05a item 7 prohibits.
--
-- WHY NOT A TRIGGER. Ruled out by the Operator: "Do not create a trigger
-- to synthesize the value. The desired property is EXPLICITNESS, not
-- automation." A trigger would restore implicit resolution behind a
-- different mechanism and would be harder to audit than the DEFAULT it
-- replaced.
--
-- SCOPE. M13 (20260809120000) and M14 (20260809160000) are committed and
-- applied and are NOT edited, per FINAL_MVP_EXECUTION_PLAN.md section 11
-- R-1: "Committed migrations are corrected by a new forward migration,
-- never by editing an applied file." Neither is any of the 12 historical
-- migrations -- including 20260805090500_step_7i_report_lifecycle.sql,
-- whose `ADD COLUMN content_hash_version smallint NOT NULL DEFAULT 1`
-- remains a correct point-in-time record of what Step 7I shipped.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 ownership guard (section 6.5 item 2).
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'M15 must be applied as postgres, not as %. Applying as another role '
      'would alter an object under the wrong owner and silently change the '
      'governed ACL posture.', current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- FAIL-CLOSED PRECONDITION -- prove the existing default is 1.
--
-- The ruling is "remove DEFAULT 1". If the live default is anything else,
-- this migration is being applied to a baseline it was not derived from
-- and must STOP rather than silently erase an unknown default. If the
-- default is already absent, that is also a STOP: it means something
-- other than this migration removed it, and the provenance of that change
-- is not established.
-- ---------------------------------------------------------------------
DO $pre$
DECLARE
  v_default text;
  v_notnull boolean;
  v_check   text;
BEGIN
  SELECT pg_catalog.pg_get_expr(d.adbin, d.adrelid), a.attnotnull
    INTO v_default, v_notnull
    FROM pg_catalog.pg_attribute a
    LEFT JOIN pg_catalog.pg_attrdef d
      ON d.adrelid = a.attrelid AND d.adnum = a.attnum
   WHERE a.attrelid = 'public.report_versions'::regclass
     AND a.attname  = 'content_hash_version'
     AND NOT a.attisdropped;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'M15 precondition failed: report_versions.content_hash_version does not exist';
  END IF;

  IF v_default IS NULL THEN
    RAISE EXCEPTION
      'M15 precondition failed: content_hash_version already has NO default. '
      'This migration removes a default that is proven to be 1; it must not '
      'be applied to a baseline whose default was removed by something else.';
  END IF;

  IF v_default <> '1' THEN
    RAISE EXCEPTION
      'M15 precondition failed: content_hash_version default is %, expected the '
      'Step 7I default of 1. STOP -- do not erase an unknown default.', v_default;
  END IF;

  IF NOT v_notnull THEN
    RAISE EXCEPTION
      'M15 precondition failed: content_hash_version is NULLABLE. Dropping the '
      'default without NOT NULL would let an omitted column store NULL '
      'provenance instead of failing the write.';
  END IF;

  -- The governed two-value envelope must already be in force. Removing the
  -- default is only meaningful because the column is genuinely two-valued.
  SELECT pg_catalog.pg_get_constraintdef(oid) INTO v_check
    FROM pg_catalog.pg_constraint
   WHERE conrelid = 'public.report_versions'::regclass
     AND conname  = 'report_versions_content_hash_version_chk';
  IF v_check IS DISTINCT FROM 'CHECK ((content_hash_version = ANY (ARRAY[1, 2])))' THEN
    RAISE EXCEPTION
      'M15 precondition failed: the envelope constraint is %, expected the '
      'governed 1-or-2 form', COALESCE(v_check, '<absent>');
  END IF;

  RAISE NOTICE 'M15 precondition: content_hash_version is NOT NULL, CHECK IN (1,2), DEFAULT 1 -- proven before removal.';
END;
$pre$;

-- ---------------------------------------------------------------------
-- THE CHANGE. One statement. No data written, no object added or dropped.
-- ---------------------------------------------------------------------
ALTER TABLE public.report_versions
  ALTER COLUMN content_hash_version DROP DEFAULT;

COMMENT ON COLUMN public.report_versions.content_hash_version IS
  'Which content-hash SERIALIZER produced content_hash for this row: 1 = the '
  'frozen V1 envelope (superseded panel names), 2 = the native OD-4 V2 '
  'envelope. Integrity metadata, not a version number of the row. It has NO '
  'DATABASE DEFAULT by Operator ruling (M15, 2026-08-09): both values are '
  'valid provenance, so the database must never guess which serializer ran. '
  'Every version-producing write states it explicitly; a clone propagates the '
  'SOURCE row''s actual value (M14). Restoring a DEFAULT here requires a new '
  'explicit Operator ruling -- assertions C8 (this migration), T7I-75 '
  '(lifecycle-canonical.sql) and T7I-76 (static-scan.mjs) exist to stop it.';

-- ---------------------------------------------------------------------
-- End-of-migration catalogue assertions (section 6.5 item 5).
-- Current-state assertions only. Nothing here is copied forward from an
-- earlier migration's deny-list.
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_n       bigint;
  v_txt     text;
  v_default text;
  v_bad     text;
  v_fired   boolean;
BEGIN
  -- -------------------------------------------------------------------
  -- C1  The default is GONE -- proven two independent ways, because
  --     atthasdef and pg_attrdef are maintained separately and a probe
  --     that reads only one of them can be satisfied by a torn state.
  -- -------------------------------------------------------------------
  SELECT pg_catalog.pg_get_expr(d.adbin, d.adrelid) INTO v_default
    FROM pg_catalog.pg_attribute a
    LEFT JOIN pg_catalog.pg_attrdef d
      ON d.adrelid = a.attrelid AND d.adnum = a.attnum
   WHERE a.attrelid = 'public.report_versions'::regclass
     AND a.attname  = 'content_hash_version';
  IF v_default IS NOT NULL THEN
    RAISE EXCEPTION 'M15 assertion C1 failed: content_hash_version still defaults to %', v_default;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attribute a
   WHERE a.attrelid = 'public.report_versions'::regclass
     AND a.attname  = 'content_hash_version'
     AND a.atthasdef;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'M15 assertion C1 failed: atthasdef is still true for content_hash_version';
  END IF;

  -- Corroborate through information_schema, the surface a type generator
  -- and most tooling actually read. If these two ever disagree, the
  -- generated Insert shape (P1-T06) would be derived from a stale view.
  SELECT column_default INTO v_txt
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'report_versions'
     AND column_name = 'content_hash_version';
  IF v_txt IS NOT NULL THEN
    RAISE EXCEPTION 'M15 assertion C1 failed: information_schema still reports a default of %', v_txt;
  END IF;

  -- -------------------------------------------------------------------
  -- C2  NOT NULL REMAINS. This is what converts an omitted column from a
  --     silent implicit 1 into a rejected write. Without it, dropping the
  --     default would make the failure mode WORSE, not better.
  -- -------------------------------------------------------------------
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attribute a
   WHERE a.attrelid = 'public.report_versions'::regclass
     AND a.attname = 'content_hash_version'
     AND a.attnotnull
     AND NOT a.attisdropped
     AND a.atttypid = 'smallint'::regtype;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'M15 assertion C2 failed: content_hash_version is not a NOT NULL smallint';
  END IF;

  -- -------------------------------------------------------------------
  -- C3  The governed CHECK still permits ONLY 1 and 2, pinned by EXACT
  --     definition (M14 B4 established that a substring probe also passes
  --     for IN (1,2,3) and for ARRAY[12, 3]).
  -- -------------------------------------------------------------------
  SELECT pg_catalog.pg_get_constraintdef(oid) INTO v_txt
    FROM pg_catalog.pg_constraint
   WHERE conrelid = 'public.report_versions'::regclass
     AND conname  = 'report_versions_content_hash_version_chk';
  IF v_txt IS NULL THEN
    RAISE EXCEPTION 'M15 assertion C3 failed: report_versions_content_hash_version_chk is gone -- the NAME is load-bearing';
  END IF;
  IF v_txt <> 'CHECK ((content_hash_version = ANY (ARRAY[1, 2])))' THEN
    RAISE EXCEPTION 'M15 assertion C3 failed: constraint definition is %, expected the governed 1-or-2 form', v_txt;
  END IF;

  -- -------------------------------------------------------------------
  -- C4  EXISTING ROWS RETAIN THEIR STORED VALUES. DROP DEFAULT is a
  --     catalogue-only operation and rewrites no heap tuple; this asserts
  --     that directly rather than trusting the documented behaviour.
  --     report_versions is empty at this checkpoint (D-0C reconstruction),
  --     so the count leg is currently vacuous BY MEASUREMENT -- which is
  --     why the value legs are written to hold for any future row set
  --     rather than being skipped as unreachable.
  -- -------------------------------------------------------------------
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions
   WHERE content_hash_version IS NULL;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'M15 assertion C4 failed: % row(s) hold a NULL content_hash_version', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions
   WHERE content_hash_version NOT IN (1, 2);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'M15 assertion C4 failed: % row(s) hold an out-of-envelope content_hash_version', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions;
  RAISE NOTICE 'M15 C4: report_versions holds % row(s); every stored content_hash_version is non-NULL and in (1,2). No value was rewritten.', v_n;

  -- -------------------------------------------------------------------
  -- C5  EVERY GOVERNED VERSION-PRODUCING WRITE STATES THE VERSION
  --     EXPLICITLY.
  --
  --     CATALOGUE-DERIVED, not a hard-coded function list: it discovers
  --     the creating paths from pg_proc, so a creating path added by a
  --     LATER migration is covered without editing anything. A literal
  --     deny-list here would re-create the exact fail-open class that
  --     P1-T04 exists to close.
  -- -------------------------------------------------------------------
  SELECT pg_catalog.count(*), pg_catalog.string_agg(p.proname, ', ' ORDER BY p.proname)
    INTO v_n, v_bad
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.prosrc LIKE '%INSERT INTO public.report_versions%'
     AND p.prosrc !~ 'INSERT INTO public\.report_versions\s*\([^)]*content_hash_version';
  IF v_n <> 0 THEN
    RAISE EXCEPTION
      'M15 assertion C5 failed: % version-creating path(s) omit content_hash_version '
      'from the INSERT column list and would now fail NOT NULL at runtime: %', v_n, v_bad;
  END IF;

  -- C5b  ANCHOR EXISTENCE. C5 is a "count of violators = 0" test, which
  --       passes vacuously if the creating paths vanish or are renamed.
  --       Pin the population it measured.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.prosrc LIKE '%INSERT INTO public.report_versions%';
  IF v_n <> 4 THEN
    RAISE EXCEPTION
      'M15 assertion C5b failed: % version-creating path(s), expected 4 -- C5 may have '
      'passed vacuously', v_n;
  END IF;

  -- C5c  No creating path stamps a HARD-CODED 1 (M14 B2, re-proved here
  --       on the current catalogue rather than assumed to still hold).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.prosrc LIKE '%INSERT INTO public.report_versions%'
     AND p.prosrc ~ '(?n)content_hash,\s*1\s*$';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'M15 assertion C5c failed: % creating path(s) stamp content_hash_version = 1', v_n;
  END IF;

  -- -------------------------------------------------------------------
  -- C6  report_reopen_submitted PRESERVES SOURCE PROVENANCE. The clone
  --     path is the only one whose correct value is not a constant, so
  --     it is asserted by name in addition to C5's catalogue sweep.
  -- -------------------------------------------------------------------
  SELECT p.prosrc INTO v_txt
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_reopen_submitted';
  IF v_txt IS NULL THEN
    RAISE EXCEPTION 'M15 assertion C6 failed: report_reopen_submitted does not exist';
  END IF;
  IF pg_catalog.strpos(v_txt, 'v_src.content_hash, v_src.content_hash_version') = 0 THEN
    RAISE EXCEPTION
      'M15 assertion C6 failed: report_reopen_submitted no longer propagates the '
      'source envelope version -- the clone would relabel provenance';
  END IF;

  -- -------------------------------------------------------------------
  -- C7  NO DIRECT CLIENT DML PATH CAN EXPLOIT AN OMISSION.
  --
  --     Removing the default only reaches writes that go through the
  --     governed RPCs. This proves there is no other writer: every
  --     governed mutation is a SECURITY DEFINER RPC (A-030, zero governed
  --     direct client DML), so no client role may INSERT or UPDATE
  --     report_versions at all.
  -- -------------------------------------------------------------------
  SELECT pg_catalog.count(*), pg_catalog.string_agg(g.grantee || ':' || g.priv, ', ')
    INTO v_n, v_bad
    FROM (
      SELECT r.rolname AS grantee, x.priv
        FROM (VALUES ('anon'),('authenticated'),('service_role'),('authenticator')) AS r(rolname)
        CROSS JOIN (VALUES ('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE')) AS x(priv)
       WHERE pg_catalog.has_table_privilege(r.rolname, 'public.report_versions', x.priv)
    ) g;
  IF v_n <> 0 THEN
    RAISE EXCEPTION
      'M15 assertion C7 failed: % client DML privilege(s) exist on report_versions: %', v_n, v_bad;
  END IF;

  -- PUBLIC-held DML would be invisible to the per-role probe above if it
  -- were ever granted to PUBLIC and the roles inherited it implicitly.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) x
   WHERE c.oid = 'public.report_versions'::regclass
     AND x.grantee = 0
     AND x.privilege_type IN ('INSERT','UPDATE','DELETE','TRUNCATE');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'M15 assertion C7 failed: PUBLIC holds % DML privilege(s) on report_versions', v_n;
  END IF;

  -- Every policy on the table is SELECT-only, and RLS is on. A write
  -- policy without a matching write privilege is inert today, but it is the
  -- other half of the pair, so it is pinned too.
  --
  -- (This block is deliberately worded to avoid the privilege-conferring
  -- SQL keyword, even in prose. The static privilege guard's dynamic-SQL
  -- pass reports any dollar-quoted body containing that keyword alongside a
  -- guarded function name and a client role -- correctly and
  -- conservatively, since it cannot tell prose from an EXECUTE payload.
  -- This migration issues no privilege statement of any kind. The guard was
  -- NOT relaxed to accommodate this file: stripping comments inside a
  -- dollar-quoted chunk would let a real one hide behind a `--` placed in a
  -- nested string literal. Prose bends; the control does not.)
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies
   WHERE schemaname = 'public' AND tablename = 'report_versions' AND cmd <> 'SELECT';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'M15 assertion C7 failed: % non-SELECT policy/policies exist on report_versions', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class
   WHERE oid = 'public.report_versions'::regclass AND relrowsecurity;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'M15 assertion C7 failed: row-level security is not enabled on report_versions';
  END IF;

  -- -------------------------------------------------------------------
  -- C8  NEGATIVE CONTROL -- PROVEN CAPABLE OF FIRING, not merely asserted.
  --
  --     C1 is a "the default is absent" test. A test of that shape is
  --     exactly the class this project has been bitten by twice (the
  --     A-053 polarity skip; M13's unpinned envelope literal): it reports
  --     green whether or not it can still detect the condition it names.
  --     So this block RESTORES the default inside a subtransaction,
  --     re-runs C1's detector, requires it to raise, and rolls the
  --     restoration back.
  --
  --     After this block the default is absent again -- re-proved below,
  --     so a failure of the rollback cannot leave M15 reporting success
  --     with a default in place.
  -- -------------------------------------------------------------------
  v_fired := false;
  BEGIN
    ALTER TABLE public.report_versions
      ALTER COLUMN content_hash_version SET DEFAULT 1;

    SELECT pg_catalog.pg_get_expr(d.adbin, d.adrelid) INTO v_default
      FROM pg_catalog.pg_attribute a
      LEFT JOIN pg_catalog.pg_attrdef d
        ON d.adrelid = a.attrelid AND d.adnum = a.attnum
     WHERE a.attrelid = 'public.report_versions'::regclass
       AND a.attname  = 'content_hash_version';

    IF v_default IS NOT NULL THEN
      v_fired := true;   -- the detector saw the restored default: it works
    END IF;

    -- Unconditional roll-back of the probe. The sentinel is matched on
    -- exactly, so a genuine error raised by the statements above still
    -- propagates instead of being swallowed as "the probe finished".
    RAISE EXCEPTION 'M15_C8_PROBE_ROLLBACK';
  EXCEPTION
    WHEN raise_exception THEN
      IF SQLERRM <> 'M15_C8_PROBE_ROLLBACK' THEN
        RAISE;
      END IF;
  END;

  IF NOT v_fired THEN
    RAISE EXCEPTION
      'M15 assertion C8 failed: the no-default detector did NOT fire when a '
      'DEFAULT was deliberately restored. C1 is vacuous and would not stop a '
      'future migration from re-adding one.';
  END IF;

  -- The probe must have left no trace.
  SELECT pg_catalog.pg_get_expr(d.adbin, d.adrelid) INTO v_default
    FROM pg_catalog.pg_attribute a
    LEFT JOIN pg_catalog.pg_attrdef d
      ON d.adrelid = a.attrelid AND d.adnum = a.attnum
   WHERE a.attrelid = 'public.report_versions'::regclass
     AND a.attname  = 'content_hash_version';
  IF v_default IS NOT NULL THEN
    RAISE EXCEPTION
      'M15 assertion C8 failed: the firing probe did not roll back -- the default is % again',
      v_default;
  END IF;

  -- -------------------------------------------------------------------
  -- C9  CENSUS IS UNMOVED. DROP DEFAULT adds and drops no object.
  -- -------------------------------------------------------------------
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public';
  IF v_n <> 36 THEN RAISE EXCEPTION 'M15 assertion C9 failed: % functions, expected 36', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN RAISE EXCEPTION 'M15 assertion C9 failed: % tables, expected 26', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN RAISE EXCEPTION 'M15 assertion C9 failed: % enums, expected 12', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN RAISE EXCEPTION 'M15 assertion C9 failed: % policies, expected 29', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 25 THEN
    RAISE EXCEPTION 'M15 assertion C9 failed: % authenticated EXECUTE, expected 25', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND (pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
       OR pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
       OR pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE'));
  IF v_n <> 0 THEN
    RAISE EXCEPTION
      'M15 assertion C9 failed: % function(s) reachable by service_role/anon/authenticator, expected 0', v_n;
  END IF;

  -- -------------------------------------------------------------------
  -- C10  V1 REMAINS FROZEN (G-05a items 1-2). M15 touches no function,
  --      but verify-fresh-apply is structurally blind to a V1 change
  --      (it runs the same corpus on both sides of its comparison), so
  --      every migration in this family re-proves the freeze.
  -- -------------------------------------------------------------------
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_content_hash_v1','report_wording_hash_v1')
     AND p.proacl::text = '{postgres=X/postgres}'
     AND p.provolatile = 'i' AND p.proparallel = 's' AND p.prosecdef = false
     AND p.proconfig::text = '{"search_path=\"\""}'
     AND pg_catalog.obj_description(p.oid,'pg_proc') IS NOT NULL;
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'M15 assertion C10 failed: V1 serializer posture changed (% of 2 intact)', v_n;
  END IF;

  RAISE NOTICE 'M15: content_hash_version DEFAULT REMOVED (was 1, now absent in pg_attrdef, atthasdef and information_schema); NOT NULL retained; CHECK still exactly IN (1,2); no stored value rewritten; all 4 version-creating paths name the column explicitly and none stamps a literal 1; report_reopen_submitted still propagates source provenance; zero client DML privilege and zero non-SELECT policy on report_versions; the no-default control was PROVEN TO FIRE against a deliberately restored default and the probe rolled back; census unmoved (36 functions, 26 tables, 12 enums, 29 policies, 25 authenticated EXECUTE, 0 other client EXECUTE); V1 frozen.';
END;
$assert$;
