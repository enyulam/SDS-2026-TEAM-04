-- =====================================================================
-- B.E.S.T Coach -- Step 7G: relationship authorization (identity/roster)
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> CLAUDE.md (ADR-4, ADR-7; the authorization-sources rule) -> Implementation Plan
--   -> the Step 7G1A authorization baseline audit (P-1 resolution)
--
-- SCOPE OF THIS MIGRATION -- read-only relationship access ONLY:
--   * SELECT grants and SELECT policies for `authenticated` on the 13
--     identity/roster tables: centres, accounts, centre_memberships,
--     trainer_profiles, parent_profiles, students, parent_student_links,
--     class_grades, class_modules, class_sessions, enrolments,
--     class_session_assignments, attendance.
--   * Six STABLE authorization helper functions, EXECUTE for
--     `authenticated` only.
--
-- DELIBERATELY OUT OF SCOPE -- zero grants, zero policies (deny-by-default
-- posture from Step 7E stands untouched):
--   invitations, assessment_dimensions, observations, observation_ratings,
--   reports, report_versions, report_version_ratings,
--   report_version_checklist_progress, report_version_approvals.
--
-- ABSOLUTE RULES ENFORCED BY THIS FILE
--  * All access derives live from auth.uid() -> accounts.auth_user_id ->
--    an ACTIVE centre_memberships row -> the relationship tables.
--    UI visibility and JWT convenience claims are NOT authorization
--    (ADR-4, spec section 21); no custom JWT relationship claim is read.
--  * No INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES or TRIGGER privilege
--    is granted to any client role by this migration.
--  * anon, service_role, authenticator and PUBLIC remain at ZERO table
--    privileges. service_role carries BYPASSRLS, so the ONLY control that
--    constrains it is the absence of a privilege -- nothing here may ever
--    grant to it.
--  * No ownership change, no default-privilege change, no new schema, no
--    view, no trigger, no dynamic SQL, no FORCE ROW LEVEL SECURITY, and
--    RLS is not disabled anywhere.
--  * auth.users is never read by any policy or helper; identity resolves
--    through public.accounts.auth_user_id only.
--  * P-1 (Step 7G1A): the supabase_admin default ACL in schema public
--    would grant ALL to anon/authenticated/service_role on any object it
--    creates. Every object in this migration must therefore be created by
--    `postgres` -- the fail-closed guard below aborts the whole migration
--    under any other role before anything is created or granted.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0/4 -- Execution-role guard (P-1, fail closed)
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Step 7G aborted before any change: this migration must run as postgres, not "%". '
      'Objects created by supabase_admin in schema public would inherit its default ACL '
      '(ALL to anon/authenticated/service_role) -- the exact hazard P-1 exists to prevent.',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- 1/4 -- Authorization helper functions
-- ---------------------------------------------------------------------
-- Six helpers, and no more. Each is:
--   * created and owned by postgres (guard above);
--   * STABLE -- reads only, one snapshot per statement;
--   * SECURITY DEFINER -- required: policies on accounts and
--     centre_memberships call helpers that read those SAME tables. An
--     invoker-rights helper would re-enter the calling table''s RLS and
--     PostgreSQL would raise "infinite recursion detected in policy".
--     Definer-rights under postgres (BYPASSRLS) reads the relationship
--     facts cleanly and returns only a scalar verdict;
--   * pinned to an empty search_path with fully qualified references, so
--     no object on any caller-controlled path can be substituted;
--   * free of dynamic SQL and mutation;
--   * anchored on auth.uid() ONLY. Where a helper takes a membership id,
--     that parameter is the ROW VALUE UNDER TEST (taken from the row the
--     policy is evaluating), never a caller-supplied identity claim: the
--     helper proves that row value belongs to the caller identified by
--     auth.uid(), and returns false for everyone else.
--   * fail-closed: unauthenticated (auth.uid() IS NULL), missing account,
--     deactivated account, missing/pending/deactivated membership and
--     role mismatch all yield NULL/false, never an error and never access.
--
-- Centre-awareness: every helper takes the centre or membership under
-- test as a parameter and evaluates that specific row. Nothing below
-- collapses to "the caller''s single centre", so a future second-centre
-- membership changes no helper contract (ADR-7 keeps multi-centre
-- additive).

-- The caller''s ACTIVE account id, or NULL. The UNIQUE constraint on
-- accounts.auth_user_id makes a second eligible row impossible by
-- construction TODAY -- but this helper must not depend on that staying
-- true. A plain scalar SQL function silently returns the FIRST row of a
-- multi-row result (plan-dependent, arbitrary), so the body instead
-- aggregates and requires EXACTLY one match: zero matches and two-or-more
-- matches both return NULL. Ambiguous identity is treated as no identity.
CREATE FUNCTION public.app_current_account_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT (pg_catalog.array_agg(a.id))[1]
    FROM public.accounts a
   WHERE auth.uid() IS NOT NULL
     AND a.auth_user_id = auth.uid()
     AND a.status = 'active'
  HAVING pg_catalog.count(*) = 1
$$;

COMMENT ON FUNCTION public.app_current_account_id() IS
  'Step 7G authorization helper: resolves auth.uid() to the caller''s ACTIVE public.accounts row id. '
  'Returns NULL when unauthenticated, unlinked or deactivated -- and also when MORE than one active '
  'row matches (HAVING count(*) = 1), so corruption or future schema evolution can never select an '
  'arbitrary identity. SECURITY DEFINER because the accounts SELECT policy itself calls this function '
  '(invoker rights would recurse).';

-- Does the caller hold an ACTIVE membership in this centre? p_role = NULL
-- means "any role"; a non-NULL p_role pins the role. This is the single
-- predicate behind management centre-scope (role = management) and the
-- centre-scoped reference reads (centres, class_grades).
CREATE FUNCTION public.app_has_active_membership(
  p_centre_id uuid,
  p_role      public.centre_membership_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.centre_memberships m
      JOIN public.accounts a ON a.id = m.account_id
     WHERE auth.uid() IS NOT NULL
       AND a.auth_user_id = auth.uid()
       AND a.status = 'active'
       AND m.centre_id = p_centre_id
       AND m.status = 'active'
       AND (p_role IS NULL OR m.role = p_role)
  )
$$;

COMMENT ON FUNCTION public.app_has_active_membership(uuid, public.centre_membership_role) IS
  'Step 7G authorization helper: true when the auth.uid() caller holds an ACTIVE centre_memberships '
  'row in p_centre_id (role-pinned when p_role is not null; any role when null). Centre-parameterised '
  'so a future second-centre membership needs no contract change. SECURITY DEFINER because the '
  'centre_memberships SELECT policies call it (invoker rights would recurse).';

-- Does this membership row belong to the caller? Membership status is
-- deliberately NOT tested: reading one''s OWN membership/profile row --
-- including a pending or deactivated one -- is reading one''s own record
-- and confers no access to anything else.
CREATE FUNCTION public.app_is_own_membership(p_membership_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.centre_memberships m
      JOIN public.accounts a ON a.id = m.account_id
     WHERE auth.uid() IS NOT NULL
       AND a.auth_user_id = auth.uid()
       AND a.status = 'active'
       AND m.id = p_membership_id
  )
$$;

COMMENT ON FUNCTION public.app_is_own_membership(uuid) IS
  'Step 7G authorization helper: true when p_membership_id (the row value under test, not a trusted '
  'claim) belongs to the auth.uid() caller''s ACTIVE account. Membership status intentionally not '
  'tested: own-record visibility only. SECURITY DEFINER to read centre_memberships without re-entering '
  'its own RLS.';

-- Does this membership row belong to the caller, is it ACTIVE, and does
-- it carry exactly this role? This is the anchor predicate for the
-- trainer-assignment and parent-link relationship paths: an inactive,
-- pending or deactivated membership confers nothing here.
CREATE FUNCTION public.app_is_own_active_membership(
  p_membership_id uuid,
  p_role          public.centre_membership_role
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.centre_memberships m
      JOIN public.accounts a ON a.id = m.account_id
     WHERE auth.uid() IS NOT NULL
       AND a.auth_user_id = auth.uid()
       AND a.status = 'active'
       AND m.id = p_membership_id
       AND m.status = 'active'
       AND m.role = p_role
  )
$$;

COMMENT ON FUNCTION public.app_is_own_active_membership(uuid, public.centre_membership_role) IS
  'Step 7G authorization helper: true when p_membership_id (row value under test) is the caller''s '
  'own ACTIVE membership with exactly p_role. NULL p_role yields false (fail closed). The anchor for '
  'trainer-assignment and parent-link reachability. SECURITY DEFINER to avoid RLS recursion.';

-- Can the caller, as a trainer, reach this class session? True only via
-- an ACTIVE class_session_assignments row on this exact session, held
-- through the caller''s ACTIVE trainer membership. Unassigned (inactive)
-- assignment rows confer nothing.
CREATE FUNCTION public.app_trainer_reaches_session(p_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.class_session_assignments sa
      JOIN public.centre_memberships m ON m.id = sa.trainer_membership_id
      JOIN public.accounts a           ON a.id = m.account_id
     WHERE auth.uid() IS NOT NULL
       AND a.auth_user_id = auth.uid()
       AND a.status = 'active'
       AND sa.class_session_id = p_session_id
       AND sa.is_active
       AND m.status = 'active'
       AND m.role = 'trainer'
  )
$$;

COMMENT ON FUNCTION public.app_trainer_reaches_session(uuid) IS
  'Step 7G authorization helper: true when the auth.uid() caller holds an ACTIVE trainer membership '
  'with an ACTIVE assignment to exactly this session. Encapsulates the assignment->membership->account '
  'chain once instead of duplicating it across session and attendance policies. SECURITY DEFINER to '
  'read the relationship tables without nested RLS evaluation.';

-- Can the caller, as a trainer, reach this class module? True only via an
-- ACTIVE assignment to at least one session OF this module, through the
-- caller''s ACTIVE trainer membership. This is what scopes a trainer to
-- their assigned teaching, not the centre-wide catalogue.
CREATE FUNCTION public.app_trainer_reaches_module(p_module_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.class_session_assignments sa
      JOIN public.class_sessions s     ON s.id = sa.class_session_id
      JOIN public.centre_memberships m ON m.id = sa.trainer_membership_id
      JOIN public.accounts a           ON a.id = m.account_id
     WHERE auth.uid() IS NOT NULL
       AND a.auth_user_id = auth.uid()
       AND a.status = 'active'
       AND s.class_module_id = p_module_id
       AND sa.is_active
       AND m.status = 'active'
       AND m.role = 'trainer'
  )
$$;

COMMENT ON FUNCTION public.app_trainer_reaches_module(uuid) IS
  'Step 7G authorization helper: true when the auth.uid() caller holds an ACTIVE trainer membership '
  'with an ACTIVE assignment to at least one session of this module. Used by module, enrolment and '
  'student trainer policies. SECURITY DEFINER to read the relationship chain without nested RLS.';

-- Function privileges: helpers are for authenticated policy evaluation
-- ONLY. The Step 7E default ACL already strips PUBLIC EXECUTE from new
-- postgres-owned functions in public; the revokes below make the posture
-- explicit rather than inherited, per checkpoint instruction. No helper
-- is ever granted to service_role: it bypasses RLS, and these helpers
-- must never become a convenience surface for it.
REVOKE ALL ON FUNCTION public.app_current_account_id()                                          FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.app_has_active_membership(uuid, public.centre_membership_role)    FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.app_is_own_membership(uuid)                                       FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.app_is_own_active_membership(uuid, public.centre_membership_role) FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.app_trainer_reaches_session(uuid)                                 FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.app_trainer_reaches_module(uuid)                                  FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.app_current_account_id()                                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_has_active_membership(uuid, public.centre_membership_role)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_is_own_membership(uuid)                                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_is_own_active_membership(uuid, public.centre_membership_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_trainer_reaches_session(uuid)                                 TO authenticated;
GRANT EXECUTE ON FUNCTION public.app_trainer_reaches_module(uuid)                                  TO authenticated;

-- ---------------------------------------------------------------------
-- 2/4 -- Table privileges: SELECT only, authenticated only
-- ---------------------------------------------------------------------
-- The grant admits the role to the table; the policies below decide the
-- rows. anon, service_role, authenticator and PUBLIC receive nothing --
-- there is deliberately no GRANT to any of them anywhere in this file,
-- and the assertions at the end prove the zero posture survived.
GRANT SELECT ON TABLE public.centres                   TO authenticated;
GRANT SELECT ON TABLE public.accounts                  TO authenticated;
GRANT SELECT ON TABLE public.centre_memberships        TO authenticated;
GRANT SELECT ON TABLE public.trainer_profiles          TO authenticated;
GRANT SELECT ON TABLE public.parent_profiles           TO authenticated;
GRANT SELECT ON TABLE public.students                  TO authenticated;
GRANT SELECT ON TABLE public.parent_student_links      TO authenticated;
GRANT SELECT ON TABLE public.class_grades              TO authenticated;
GRANT SELECT ON TABLE public.class_modules             TO authenticated;
GRANT SELECT ON TABLE public.class_sessions            TO authenticated;
GRANT SELECT ON TABLE public.enrolments                TO authenticated;
GRANT SELECT ON TABLE public.class_session_assignments TO authenticated;
GRANT SELECT ON TABLE public.attendance                TO authenticated;

-- ---------------------------------------------------------------------
-- 3/4 -- Row-level policies (29, all SELECT, all TO authenticated)
-- ---------------------------------------------------------------------
-- Naming: <table>_select_<path>. Management, trainer and parent paths are
-- separate policies wherever their predicates differ materially, so each
-- can be read, reviewed and later revoked on its own. Policies are
-- PERMISSIVE and OR-combined per PostgreSQL semantics; every predicate is
-- fail-closed on its own. No policy uses USING (true), reads auth.users,
-- or trusts a JWT relationship claim.

-- ---------- centres ----------
-- Reference row, centre-scoped: seeded data is NOT globally readable.
-- Reading a centre row requires an ACTIVE membership in THAT centre
-- (management qualifies through the same predicate -- one shared rule,
-- not an opaque merge of different rules).
CREATE POLICY centres_select_active_member
  ON public.centres
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(centres.id, NULL::public.centre_membership_role)
  );

-- ---------- accounts ----------
-- Own identity row. app_current_account_id() is NULL for deactivated
-- accounts, so a deactivated account cannot read even itself.
CREATE POLICY accounts_select_own
  ON public.accounts
  FOR SELECT
  TO authenticated
  USING (
    accounts.id = public.app_current_account_id()
  );

-- Management reads every account that holds a membership -- of any
-- lifecycle status, because administering pending/deactivated people is
-- exactly the management view -- in a centre the caller ACTIVELY manages.
-- accounts has no centre_id; centre attachment is proven through
-- centre_memberships (its policies are helper-only, so this nested read
-- cannot recurse).
CREATE POLICY accounts_select_management
  ON public.accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.centre_memberships m
       WHERE m.account_id = accounts.id
         AND public.app_has_active_membership(m.centre_id, 'management'::public.centre_membership_role)
    )
  );

-- ---------- centre_memberships ----------
-- Own membership rows, any status: one''s own lifecycle state is one''s
-- own record. NULL app_current_account_id() (unauthenticated/deactivated)
-- matches nothing.
CREATE POLICY centre_memberships_select_own
  ON public.centre_memberships
  FOR SELECT
  TO authenticated
  USING (
    centre_memberships.account_id = public.app_current_account_id()
  );

-- Management reads all membership rows of the actively-managed centre,
-- any status (lifecycle administration).
CREATE POLICY centre_memberships_select_management
  ON public.centre_memberships
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(centre_memberships.centre_id, 'management'::public.centre_membership_role)
  );

-- ---------- trainer_profiles ----------
CREATE POLICY trainer_profiles_select_own
  ON public.trainer_profiles
  FOR SELECT
  TO authenticated
  USING (
    public.app_is_own_membership(trainer_profiles.membership_id)
  );

CREATE POLICY trainer_profiles_select_management
  ON public.trainer_profiles
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(trainer_profiles.centre_id, 'management'::public.centre_membership_role)
  );

-- ---------- parent_profiles ----------
-- Trainers receive NO parent-profile path: a trainer must not gain
-- general access to parent identity data (checkpoint section 5).
CREATE POLICY parent_profiles_select_own
  ON public.parent_profiles
  FOR SELECT
  TO authenticated
  USING (
    public.app_is_own_membership(parent_profiles.membership_id)
  );

CREATE POLICY parent_profiles_select_management
  ON public.parent_profiles
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(parent_profiles.centre_id, 'management'::public.centre_membership_role)
  );

-- ---------- students ----------
-- Management: centre-wide, including deactivated students (admin view).
CREATE POLICY students_select_management
  ON public.students
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(students.centre_id, 'management'::public.centre_membership_role)
  );

-- Trainer: only students holding an ACTIVE enrolment in a module the
-- trainer reaches through an ACTIVE assignment. A withdrawn enrolment or
-- an unassigned session confers nothing.
CREATE POLICY students_select_trainer
  ON public.students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.enrolments e
       WHERE e.student_id = students.id
         AND e.is_active
         AND public.app_trainer_reaches_module(e.class_module_id)
    )
  );

-- Parent: only ACTIVELY-linked students, through the caller''s own ACTIVE
-- parent membership. An unlinked child is not readable.
CREATE POLICY students_select_parent
  ON public.students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.parent_student_links l
       WHERE l.student_id = students.id
         AND l.is_active
         AND public.app_is_own_active_membership(l.parent_membership_id, 'parent'::public.centre_membership_role)
    )
  );

-- ---------- parent_student_links ----------
-- Management: centre-wide, including unlinked history (admin view).
CREATE POLICY parent_student_links_select_management
  ON public.parent_student_links
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(parent_student_links.centre_id, 'management'::public.centre_membership_role)
  );

-- Parent: own ACTIVE links only. Trainers receive no link path.
CREATE POLICY parent_student_links_select_parent
  ON public.parent_student_links
  FOR SELECT
  TO authenticated
  USING (
    parent_student_links.is_active
    AND public.app_is_own_active_membership(parent_student_links.parent_membership_id, 'parent'::public.centre_membership_role)
  );

-- ---------- class_grades ----------
-- Centre-scoped reference row: readable by any ACTIVE membership of that
-- centre (management, trainer, parent alike need grade display names),
-- and by nobody without one.
CREATE POLICY class_grades_select_active_member
  ON public.class_grades
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(class_grades.centre_id, NULL::public.centre_membership_role)
  );

-- ---------- class_modules ----------
CREATE POLICY class_modules_select_management
  ON public.class_modules
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(class_modules.centre_id, 'management'::public.centre_membership_role)
  );

-- Trainer: only modules reached through an ACTIVE assignment to one of
-- the module''s sessions -- assigned teaching, not the centre catalogue.
CREATE POLICY class_modules_select_trainer
  ON public.class_modules
  FOR SELECT
  TO authenticated
  USING (
    public.app_trainer_reaches_module(class_modules.id)
  );

-- Parent: only modules where an ACTIVELY-linked student holds an ACTIVE
-- enrolment. Both halves of the chain are written out explicitly, so this
-- predicate stands on its own even before the nested tables'' RLS.
CREATE POLICY class_modules_select_parent
  ON public.class_modules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.enrolments e
       WHERE e.class_module_id = class_modules.id
         AND e.is_active
         AND EXISTS (
           SELECT 1
             FROM public.parent_student_links l
            WHERE l.student_id = e.student_id
              AND l.is_active
              AND public.app_is_own_active_membership(l.parent_membership_id, 'parent'::public.centre_membership_role)
         )
    )
  );

-- ---------- class_sessions ----------
CREATE POLICY class_sessions_select_management
  ON public.class_sessions
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(class_sessions.centre_id, 'management'::public.centre_membership_role)
  );

-- Trainer: exactly the sessions carrying the caller''s ACTIVE assignment.
-- Another trainer''s sessions -- or the caller''s own unassigned ones --
-- do not appear.
CREATE POLICY class_sessions_select_trainer
  ON public.class_sessions
  FOR SELECT
  TO authenticated
  USING (
    public.app_trainer_reaches_session(class_sessions.id)
  );

-- Parent calendar: sessions of modules where the ACTIVELY-linked student
-- holds an ACTIVE enrolment.
CREATE POLICY class_sessions_select_parent
  ON public.class_sessions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.enrolments e
       WHERE e.class_module_id = class_sessions.class_module_id
         AND e.is_active
         AND EXISTS (
           SELECT 1
             FROM public.parent_student_links l
            WHERE l.student_id = e.student_id
              AND l.is_active
              AND public.app_is_own_active_membership(l.parent_membership_id, 'parent'::public.centre_membership_role)
         )
    )
  );

-- ---------- enrolments ----------
-- Management: centre-wide, any status (withdrawn history is admin data).
CREATE POLICY enrolments_select_management
  ON public.enrolments
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(enrolments.centre_id, 'management'::public.centre_membership_role)
  );

-- Trainer: ACTIVE enrolments of reachable modules only.
CREATE POLICY enrolments_select_trainer
  ON public.enrolments
  FOR SELECT
  TO authenticated
  USING (
    enrolments.is_active
    AND public.app_trainer_reaches_module(enrolments.class_module_id)
  );

-- Parent: ACTIVE enrolments of ACTIVELY-linked students only.
CREATE POLICY enrolments_select_parent
  ON public.enrolments
  FOR SELECT
  TO authenticated
  USING (
    enrolments.is_active
    AND EXISTS (
      SELECT 1
        FROM public.parent_student_links l
       WHERE l.student_id = enrolments.student_id
         AND l.is_active
         AND public.app_is_own_active_membership(l.parent_membership_id, 'parent'::public.centre_membership_role)
    )
  );

-- ---------- class_session_assignments ----------
-- Management: centre-wide, including unassigned history (admin view).
CREATE POLICY class_session_assignments_select_management
  ON public.class_session_assignments
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(class_session_assignments.centre_id, 'management'::public.centre_membership_role)
  );

-- Trainer: own ACTIVE assignments only. Parents receive no assignment
-- path in this checkpoint.
CREATE POLICY class_session_assignments_select_trainer
  ON public.class_session_assignments
  FOR SELECT
  TO authenticated
  USING (
    class_session_assignments.is_active
    AND public.app_is_own_active_membership(class_session_assignments.trainer_membership_id, 'trainer'::public.centre_membership_role)
  );

-- ---------- attendance ----------
CREATE POLICY attendance_select_management
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    public.app_has_active_membership(attendance.centre_id, 'management'::public.centre_membership_role)
  );

-- Trainer: attendance of sessions reached through an ACTIVE assignment.
CREATE POLICY attendance_select_trainer
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    public.app_trainer_reaches_session(attendance.class_session_id)
  );

-- Parent: the ACTIVELY-linked student''s attendance rows (the Parent
-- Calendar disables access for absent students, so parents do read
-- attendance status for their own child -- and only their own child).
CREATE POLICY attendance_select_parent
  ON public.attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
        FROM public.parent_student_links l
       WHERE l.student_id = attendance.student_id
         AND l.is_active
         AND public.app_is_own_active_membership(l.parent_membership_id, 'parent'::public.centre_membership_role)
    )
  );

-- ---------------------------------------------------------------------
-- 4/4 -- Fail-closed end-of-migration assertions
-- ---------------------------------------------------------------------
-- Every assertion below re-derives the posture from the live catalogue
-- and raises an authored error on mismatch, so a partially-applied or
-- silently-widened state cannot survive the migration transaction.
-- Counts asserted here are counts of objects THIS project controls (its
-- tables, its policies, its functions, its P-1 default-ACL posture) --
-- no unrelated platform catalogue rows are pinned.
DO $assert$
DECLARE
  v_in_scope  constant text[] := ARRAY[
    'centres','accounts','centre_memberships','trainer_profiles','parent_profiles',
    'students','parent_student_links','class_grades','class_modules','class_sessions',
    'enrolments','class_session_assignments','attendance'];
  v_out_scope constant text[] := ARRAY[
    'invitations','assessment_dimensions','observations','observation_ratings',
    'reports','report_versions','report_version_ratings',
    'report_version_checklist_progress','report_version_approvals'];
  v_helpers   constant text[] := ARRAY[
    'app_current_account_id','app_has_active_membership','app_is_own_membership',
    'app_is_own_active_membership','app_trainer_reaches_session','app_trainer_reaches_module'];
  v_n        integer;
  v_m        integer;
  v_k        integer;
  v_names    text;
  v_table    text;
  v_expected integer;
BEGIN
  -- A1: still running as postgres (P-1).
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'Step 7G assertion A1 failed: current_user is "%", not postgres', current_user;
  END IF;

  -- A2: exactly 22 public tables; RLS enabled on all; FORCE on none.
  SELECT count(*),
         count(*) FILTER (WHERE NOT c.relrowsecurity),
         count(*) FILTER (WHERE c.relforcerowsecurity)
    INTO v_n, v_m, v_k
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 22 OR v_m <> 0 OR v_k <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A2 failed: tables=% rls_disabled=% forced=% (expected 22/0/0)',
      v_n, v_m, v_k;
  END IF;

  -- A3: anon and service_role hold NO privilege of any kind on any of the
  -- 22 tables. service_role has BYPASSRLS -- zero privilege is the only
  -- boundary that holds against it.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace,
         unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) AS p(priv)
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND (   pg_catalog.has_table_privilege('anon',         c.oid, p.priv)
          OR pg_catalog.has_table_privilege('service_role', c.oid, p.priv));
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A3 failed: anon/service_role hold % table privilege grant(s); expected 0', v_n;
  END IF;

  -- A4: authenticator holds no DIRECT table privilege (its memberships
  -- are NOINHERIT, so relacl text is the direct evidence).
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND c.relacl::text LIKE '%authenticator=%';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A4 failed: % table(s) carry a direct authenticator ACL entry; expected 0', v_n;
  END IF;

  -- A5: PUBLIC holds no table ACL entry and no function ACL entry in
  -- schema public (an ACL entry for PUBLIC has an empty grantee name).
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND (c.relacl::text LIKE '{=%' OR c.relacl::text LIKE '%,=%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A5 failed: % table(s) grant to PUBLIC; expected 0', v_n;
  END IF;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc pr
    JOIN pg_catalog.pg_namespace n ON n.oid = pr.pronamespace
   WHERE n.nspname = 'public'
     AND pr.proacl IS NOT NULL
     AND (pr.proacl::text LIKE '{=%' OR pr.proacl::text LIKE '%,=%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A5 failed: % function(s) grant to PUBLIC; expected 0', v_n;
  END IF;

  -- A6: authenticated holds NO write-side privilege anywhere.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace,
         unnest(ARRAY['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) AS p(priv)
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND pg_catalog.has_table_privilege('authenticated', c.oid, p.priv);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A6 failed: authenticated holds % write-side table privilege(s); expected 0', v_n;
  END IF;

  -- A7: authenticated holds SELECT on EXACTLY the 13 in-scope tables --
  -- all 13 present, nothing outside the list.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND pg_catalog.has_table_privilege('authenticated', c.oid, 'SELECT')
     AND c.relname = ANY (v_in_scope);
  IF v_n <> 13 THEN
    RAISE EXCEPTION 'Step 7G assertion A7 failed: authenticated has SELECT on % of the 13 in-scope tables', v_n;
  END IF;
  SELECT count(*), pg_catalog.string_agg(c.relname, ', ') INTO v_n, v_names
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND pg_catalog.has_table_privilege('authenticated', c.oid, 'SELECT')
     AND NOT (c.relname = ANY (v_in_scope));
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A7 failed: authenticated has SELECT outside the in-scope set: %', v_names;
  END IF;

  -- A8: every out-of-scope table has NO authenticated privilege at all.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace,
         unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) AS p(priv)
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND c.relname = ANY (v_out_scope)
     AND pg_catalog.has_table_privilege('authenticated', c.oid, p.priv);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A8 failed: authenticated holds % privilege(s) on out-of-scope tables; expected 0', v_n;
  END IF;

  -- A9: schema public contains EXACTLY the six authored helper functions,
  -- and nothing else (there were zero functions before this migration).
  SELECT count(*), pg_catalog.string_agg(pr.proname, ', ' ORDER BY pr.proname) INTO v_n, v_names
    FROM pg_catalog.pg_proc pr
    JOIN pg_catalog.pg_namespace n ON n.oid = pr.pronamespace
   WHERE n.nspname = 'public';
  IF v_n <> 6 THEN
    RAISE EXCEPTION 'Step 7G assertion A9 failed: schema public holds % function(s) [%]; expected exactly the 6 helpers', v_n, v_names;
  END IF;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc pr
    JOIN pg_catalog.pg_namespace n ON n.oid = pr.pronamespace
   WHERE n.nspname = 'public' AND NOT (pr.proname = ANY (v_helpers));
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A9 failed: % unexpected function(s) exist in public', v_n;
  END IF;

  -- A10: every helper is STABLE, SECURITY DEFINER, search_path-pinned;
  -- authenticated may EXECUTE each; anon/service_role/authenticator may not.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc pr
    JOIN pg_catalog.pg_namespace n ON n.oid = pr.pronamespace
   WHERE n.nspname = 'public'
     AND (   pr.provolatile <> 's'
          OR NOT pr.prosecdef
          OR pr.proconfig IS NULL
          OR NOT (pr.proconfig::text LIKE '%search_path=%'));
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A10 failed: % helper(s) are not STABLE SECURITY DEFINER with a pinned search_path', v_n;
  END IF;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc pr
    JOIN pg_catalog.pg_namespace n ON n.oid = pr.pronamespace
   WHERE n.nspname = 'public'
     AND (   NOT pg_catalog.has_function_privilege('authenticated', pr.oid, 'EXECUTE')
          OR pg_catalog.has_function_privilege('anon',          pr.oid, 'EXECUTE')
          OR pg_catalog.has_function_privilege('service_role',  pr.oid, 'EXECUTE')
          OR pg_catalog.has_function_privilege('authenticator', pr.oid, 'EXECUTE'));
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A10 failed: % helper(s) have a wrong EXECUTE posture (authenticated only)', v_n;
  END IF;

  -- A11: no policy exists on any out-of-scope table.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_policies pol
   WHERE pol.schemaname = 'public' AND pol.tablename = ANY (v_out_scope);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A11 failed: % policy(ies) exist on out-of-scope tables; expected 0', v_n;
  END IF;

  -- A12: exactly 29 policies, distributed exactly as designed.
  SELECT count(*) INTO v_n FROM pg_catalog.pg_policies pol WHERE pol.schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Step 7G assertion A12 failed: % policies exist in public; expected 29', v_n;
  END IF;
  FOR v_table, v_expected IN
    SELECT * FROM (VALUES
      ('centres', 1), ('accounts', 2), ('centre_memberships', 2),
      ('trainer_profiles', 2), ('parent_profiles', 2), ('students', 3),
      ('parent_student_links', 2), ('class_grades', 1), ('class_modules', 3),
      ('class_sessions', 3), ('enrolments', 3), ('class_session_assignments', 2),
      ('attendance', 3)) AS expected(tbl, cnt)
  LOOP
    SELECT count(*) INTO v_n
      FROM pg_catalog.pg_policies pol
     WHERE pol.schemaname = 'public' AND pol.tablename = v_table;
    IF v_n <> v_expected THEN
      RAISE EXCEPTION 'Step 7G assertion A12 failed: table % has % policy(ies); expected %', v_table, v_n, v_expected;
    END IF;
  END LOOP;

  -- A13: every policy is PERMISSIVE, SELECT-only, and scoped to exactly
  -- {authenticated} -- no mutation policy and no wider audience exists.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_policies pol
   WHERE pol.schemaname = 'public'
     AND (   pol.permissive <> 'PERMISSIVE'
          OR pol.cmd <> 'SELECT'
          OR pol.roles <> ARRAY['authenticated']::name[]);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7G assertion A13 failed: % policy(ies) are not SELECT-only TO authenticated', v_n;
  END IF;

  -- A14: the P-1 default-ACL posture is unchanged. postgres in public
  -- still defaults new tables/sequences/functions to owner-only...
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_default_acl d
    JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
   WHERE pg_catalog.pg_get_userbyid(d.defaclrole) = 'postgres'
     AND n.nspname = 'public'
     AND (   (d.defaclobjtype = 'r' AND d.defaclacl::text = '{postgres=arwdDxtm/postgres}')
          OR (d.defaclobjtype = 'S' AND d.defaclacl::text = '{postgres=rwU/postgres}')
          OR (d.defaclobjtype = 'f' AND d.defaclacl::text = '{postgres=X/postgres}'));
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7G assertion A14 failed: the postgres default-ACL posture in public changed (% of 3 expected rows)', v_n;
  END IF;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_default_acl d
    JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
   WHERE pg_catalog.pg_get_userbyid(d.defaclrole) = 'postgres' AND n.nspname = 'public';
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7G assertion A14 failed: % postgres default-ACL row(s) in public; expected 3', v_n;
  END IF;
  -- ...and the pre-existing supabase_admin rows were not altered by this
  -- migration (they still carry their platform-issued client grants; this
  -- project simply never creates objects as supabase_admin -- the guard
  -- at the top is what enforces that).
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_default_acl d
    JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
   WHERE pg_catalog.pg_get_userbyid(d.defaclrole) = 'supabase_admin'
     AND n.nspname = 'public'
     AND d.defaclacl::text LIKE '%anon=%'
     AND d.defaclacl::text LIKE '%authenticated=%'
     AND d.defaclacl::text LIKE '%service_role=%';
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7G assertion A14 failed: the supabase_admin default-ACL rows in public look altered (% of 3 expected rows)', v_n;
  END IF;

  RAISE NOTICE 'Step 7G relationship authorization: 6 helpers, 13 SELECT grants, 29 policies; zero-privilege posture for anon/service_role/authenticator/PUBLIC intact.';
END;
$assert$;
