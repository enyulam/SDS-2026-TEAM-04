-- =====================================================================
-- B.E.S.T Coach — Step 7E: first governed core migration
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> CLAUDE.md -> Implementation Plan
--
-- This migration creates EXACTLY the boundary ratified in Amendment 003
-- A-031: 10 enum types, 22 application tables and 13 deterministic seed
-- rows -- no more and no fewer.
--
-- Deliberately NOT created here (Amendment 003 A-032), each assigned to
-- its owning checkpoint:
--   * RLS policies and client grants ............... Step 7G
--   * synthetic Auth users and domain fixtures ..... Step 7F
--   * audit objects and the hash chain ............. Step 7H
--   * read/mutation RPCs and server-action proof ... Step 7I
--   * committed generated database types ........... Step 7J
--   * AI schema .................................... later AI work
--   * evidence schema .............................. later evidence work
--   * session-lifecycle enum ....................... deferred (values unratified)
--   * private helper schema ........................ only when a helper is authorized
--   * views, RPCs, helper functions, triggers ...... absent from Step 7E entirely
--
-- No extension is installed: PostgreSQL 17 provides gen_random_uuid().
-- No placeholder or dangling column exists: every column here has meaning
-- in this migration, and no foreign key points at a table that does not
-- yet exist.
--
-- Security posture at the end of this migration (A-030): RLS is ENABLED on
-- all 22 tables with ZERO policies and ZERO client privileges. Nothing
-- becomes client-reachable merely because this migration ran.
-- =====================================================================

BEGIN;

-- =====================================================================
-- SECTION 0 -- Schema-level privilege hardening (A-030)
-- =====================================================================
-- Privilege (GRANT) and policy (RLS) are separate authorization layers.
-- A missing grant must never be misdiagnosed as an RLS failure.

REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- Migration-owner default privileges: anything this role creates in
-- `public` from now on starts unreachable by every client role.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated, service_role;

-- =====================================================================
-- SECTION 1 -- Enum types (exactly 10) (A-026)
-- =====================================================================
-- Enums are used where the value set is closed, security- or
-- workflow-bearing, and must not be editable at runtime.

-- 1. Centre-scoped role. Sole role authority lives on centre_memberships.
--    Teaching Assistant is excluded (A-014 defers the TA flow).
CREATE TYPE public.centre_membership_role AS ENUM (
  'management',
  'trainer',
  'parent'
);

-- 2. Global, centre-independent account lifecycle. Two values only.
CREATE TYPE public.account_status AS ENUM (
  'active',
  'deactivated'
);

-- 3. Centre-scoped membership lifecycle. A status, not a boolean:
--    "invited but not yet activated" and "deliberately revoked" differ.
CREATE TYPE public.centre_membership_status AS ENUM (
  'pending',
  'active',
  'deactivated'
);

-- 4. Closed Class Grade code set (A-016). A fourth grade is not creatable.
CREATE TYPE public.class_grade_code AS ENUM (
  'beginner',
  'intermediate',
  'advanced'
);

-- 5. The nine B.E.S.T dimensions (A-017). All nine are mandatory for every
--    assessment; there is no Quick-4 representation anywhere.
CREATE TYPE public.dimension_code AS ENUM (
  'body',
  'emotion',
  'speech',
  'tonality',
  'eye_contact',
  'vocal_projection',
  'emotional_expression',
  'sentence_flow',
  'audience_awareness'
);

-- 6. The two dimension layers.
CREATE TYPE public.dimension_group AS ENUM (
  'competency',
  'speech_linguistics'
);

-- 7. The four-level rating scale (spec v3 3.3 rubric anchors).
CREATE TYPE public.competency_rating AS ENUM (
  'emerging',
  'developing',
  'secure',
  'advanced'
);

-- 8. Attendance (A-018). Present by default; no third value.
CREATE TYPE public.attendance_status AS ENUM (
  'present',
  'absent'
);

-- 9. Invitation lifecycle (A-027).
CREATE TYPE public.invitation_status AS ENUM (
  'pending',
  'accepted',
  'expired',
  'revoked'
);

-- 10. Report aggregate status (A-028). Exactly seven values.
--     'Evidence Pending' is NOT a stored status: evidence scope and its
--     uploader are unresolved (A-014), so no enum value is invented for an
--     unratified workflow. This deletes no evidence safeguard.
CREATE TYPE public.report_status AS ENUM (
  'incomplete',
  'observation_saved',
  'drafting',
  'draft_ready',
  'needs_edit',
  'approved',
  'submitted'
);

-- =====================================================================
-- SECTION 2 -- Centre and global reference data
-- =====================================================================

-- Table 1/22 -- centres
-- The academy's branches. The MVP operates for exactly one seeded centre
-- (A-015), but the entity and its relationships stay real so multi-centre
-- support remains additive rather than a redesign.
CREATE TABLE public.centres (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text        NOT NULL,
  display_name  text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT centres_code_unique          UNIQUE (code),
  CONSTRAINT centres_code_normalized_chk  CHECK (code = lower(btrim(code)) AND length(code) > 0),
  CONSTRAINT centres_display_name_chk     CHECK (length(btrim(display_name)) > 0)
);

-- Table 2/22 -- assessment_dimensions
-- GLOBAL, migration-controlled reference data (A-026). The nine dimensions
-- are the B.E.S.T framework itself, not a per-centre configuration, so this
-- table is deliberately NOT centre-scoped.
CREATE TABLE public.assessment_dimensions (
  id            uuid                   PRIMARY KEY,
  code          public.dimension_code  NOT NULL,
  display_name  text                   NOT NULL,
  group_code    public.dimension_group NOT NULL,
  sort_order    smallint               NOT NULL,
  created_at    timestamptz            NOT NULL DEFAULT now(),
  CONSTRAINT assessment_dimensions_code_unique         UNIQUE (code),
  CONSTRAINT assessment_dimensions_display_name_unique UNIQUE (display_name),
  CONSTRAINT assessment_dimensions_sort_order_unique   UNIQUE (sort_order),
  CONSTRAINT assessment_dimensions_sort_order_chk      CHECK (sort_order BETWEEN 1 AND 9)
);

-- =====================================================================
-- SECTION 3 -- Identity, membership and role-extension profiles (A-025)
-- =====================================================================

-- Table 3/22 -- accounts
-- Identity is CENTRE-INDEPENDENT. An account is a person in this system,
-- not a person's position in a centre.
--
-- There is deliberately NO centre_id and NO role column here. Because
-- auth_user_id is unique, a centre-bound account would make a second-centre
-- relationship impossible without duplicating an identity or breaking
-- uniqueness -- centre-independence is structural, not stylistic.
--
-- display_name lives here because management has no profile table and A-015
-- requires "one named management account" -- a single, named, individually
-- attributable identity that audit attribution depends on.
--
-- normalized_email is a LOOKUP AND CONTACT SNAPSHOT ONLY. It exists so an
-- existing person can be found and their account REUSED when they are later
-- invited to a second centre (A-027), which is exactly what a unique
-- auth_user_id would otherwise make impossible before activation.
--
-- It is deliberately NOT an ongoing authorization source: after linkage,
-- authority flows from auth_user_id plus live memberships, never from a
-- stored email string (A-027). Nothing in this schema derives access from
-- this column.
CREATE TABLE public.accounts (
  id                uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id      uuid                  NULL,
  display_name      text                  NOT NULL,
  normalized_email  text                  NOT NULL,
  status            public.account_status NOT NULL DEFAULT 'active',
  created_at        timestamptz           NOT NULL DEFAULT now(),
  updated_at        timestamptz           NOT NULL DEFAULT now(),
  deactivated_at    timestamptz           NULL,
  CONSTRAINT accounts_auth_user_id_unique UNIQUE (auth_user_id),
  CONSTRAINT accounts_auth_user_id_fk
    FOREIGN KEY (auth_user_id) REFERENCES auth.users (id) ON DELETE SET NULL,
  CONSTRAINT accounts_display_name_chk CHECK (length(btrim(display_name)) > 0),
  CONSTRAINT accounts_normalized_email_chk
    CHECK (normalized_email = lower(btrim(normalized_email))
           AND length(normalized_email) > 2
           AND position('@' IN normalized_email) > 1),
  -- Lifecycle timestamp consistency.
  CONSTRAINT accounts_status_timestamp_chk
    CHECK ((status = 'deactivated') = (deactivated_at IS NOT NULL)),
  CONSTRAINT accounts_deactivated_after_created_chk
    CHECK (deactivated_at IS NULL OR deactivated_at >= created_at)
);

-- Table 4/22 -- centre_memberships
-- The SOLE authority for role and for centre-scoped lifecycle. There is no
-- second place a role may be read from; dual role authority is prohibited.
--
-- A role change deactivates the existing membership and creates a new one.
-- A role value is never overwritten on a live row, because the historical
-- record of what authority a person held at the time of a governed action
-- must survive the change.
CREATE TABLE public.centre_memberships (
  id              uuid                             PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      uuid                             NOT NULL,
  centre_id       uuid                             NOT NULL,
  role            public.centre_membership_role    NOT NULL,
  status          public.centre_membership_status  NOT NULL DEFAULT 'pending',
  created_at      timestamptz                      NOT NULL DEFAULT now(),
  updated_at      timestamptz                      NOT NULL DEFAULT now(),
  activated_at    timestamptz                      NULL,
  deactivated_at  timestamptz                      NULL,
  CONSTRAINT centre_memberships_account_fk
    FOREIGN KEY (account_id) REFERENCES public.accounts (id) ON DELETE RESTRICT,
  CONSTRAINT centre_memberships_centre_fk
    FOREIGN KEY (centre_id) REFERENCES public.centres (id) ON DELETE RESTRICT,
  -- Composite candidate keys. These exist so dependent tables can prove
  -- same-centre and correct-role agreement through composite foreign keys
  -- rather than through a cross-table CHECK (which cannot read another table).
  CONSTRAINT centre_memberships_id_centre_key      UNIQUE (id, centre_id),
  CONSTRAINT centre_memberships_id_role_key        UNIQUE (id, role),
  CONSTRAINT centre_memberships_id_centre_role_key UNIQUE (id, centre_id, role),
  -- Lifecycle timestamp consistency.
  CONSTRAINT centre_memberships_pending_chk
    CHECK (status <> 'pending' OR (activated_at IS NULL AND deactivated_at IS NULL)),
  CONSTRAINT centre_memberships_active_chk
    CHECK (status <> 'active' OR (activated_at IS NOT NULL AND deactivated_at IS NULL)),
  CONSTRAINT centre_memberships_deactivated_chk
    CHECK ((status = 'deactivated') = (deactivated_at IS NOT NULL)),
  CONSTRAINT centre_memberships_activated_after_created_chk
    CHECK (activated_at IS NULL OR activated_at >= created_at),
  CONSTRAINT centre_memberships_deactivated_after_activated_chk
    CHECK (deactivated_at IS NULL OR activated_at IS NULL OR deactivated_at >= activated_at)
);

-- Table 5/22 -- trainer_profiles
-- Role-extension of a TRAINER membership. Pinned to the correct role through
-- a composite foreign key: the row cannot attach to a parent or management
-- membership. Field inventory beyond the relationship is UNRESOLVED
-- (Amendment 002 U-03) and is deliberately not invented here.
CREATE TABLE public.trainer_profiles (
  membership_id    uuid                          PRIMARY KEY,
  centre_id        uuid                          NOT NULL,
  membership_role  public.centre_membership_role NOT NULL DEFAULT 'trainer',
  created_at       timestamptz                   NOT NULL DEFAULT now(),
  updated_at       timestamptz                   NOT NULL DEFAULT now(),
  CONSTRAINT trainer_profiles_role_pinned_chk CHECK (membership_role = 'trainer'),
  CONSTRAINT trainer_profiles_membership_fk
    FOREIGN KEY (membership_id, centre_id, membership_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  CONSTRAINT trainer_profiles_membership_centre_key UNIQUE (membership_id, centre_id)
);

-- Table 6/22 -- parent_profiles
-- Role-extension of a PARENT membership, pinned the same way.
-- Field inventory is UNRESOLVED (Amendment 002 U-05).
CREATE TABLE public.parent_profiles (
  membership_id    uuid                          PRIMARY KEY,
  centre_id        uuid                          NOT NULL,
  membership_role  public.centre_membership_role NOT NULL DEFAULT 'parent',
  created_at       timestamptz                   NOT NULL DEFAULT now(),
  updated_at       timestamptz                   NOT NULL DEFAULT now(),
  CONSTRAINT parent_profiles_role_pinned_chk CHECK (membership_role = 'parent'),
  CONSTRAINT parent_profiles_membership_fk
    FOREIGN KEY (membership_id, centre_id, membership_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  CONSTRAINT parent_profiles_membership_centre_key UNIQUE (membership_id, centre_id)
);

-- NOTE: there is deliberately NO management_profiles table. Management needs
-- no role-extension attributes, and A-025 places role authority on the
-- membership row itself.

-- =====================================================================
-- SECTION 4 -- Students and parent linkage
-- =====================================================================

-- Table 7/22 -- students
-- A student is a domain subject, never a login. There is deliberately NO
-- auth_user_id and NO account linkage on this table, which makes a student
-- login structurally impossible rather than merely unimplemented.
-- Field inventory beyond the relationship is UNRESOLVED (Amendment 002 U-04).
CREATE TABLE public.students (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id       uuid        NOT NULL,
  full_name       text        NOT NULL,
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deactivated_at  timestamptz NULL,
  CONSTRAINT students_centre_fk
    FOREIGN KEY (centre_id) REFERENCES public.centres (id) ON DELETE RESTRICT,
  CONSTRAINT students_id_centre_key UNIQUE (id, centre_id),
  CONSTRAINT students_full_name_chk CHECK (length(btrim(full_name)) > 0),
  CONSTRAINT students_active_timestamp_chk
    CHECK ((NOT is_active) = (deactivated_at IS NOT NULL)),
  CONSTRAINT students_deactivated_after_created_chk
    CHECK (deactivated_at IS NULL OR deactivated_at >= created_at)
);

-- Table 8/22 -- parent_student_links
-- The live source of parent access. Rows are lifecycle EPISODES: ending a
-- link deactivates its row and a later re-link inserts a new row, so the
-- history of who could see what, when, survives.
CREATE TABLE public.parent_student_links (
  id                    uuid                          PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id             uuid                          NOT NULL,
  parent_membership_id  uuid                          NOT NULL,
  parent_role           public.centre_membership_role NOT NULL DEFAULT 'parent',
  student_id            uuid                          NOT NULL,
  is_active             boolean                       NOT NULL DEFAULT true,
  linked_at             timestamptz                   NOT NULL DEFAULT now(),
  unlinked_at           timestamptz                   NULL,
  created_at            timestamptz                   NOT NULL DEFAULT now(),
  CONSTRAINT parent_student_links_role_pinned_chk CHECK (parent_role = 'parent'),
  CONSTRAINT parent_student_links_parent_fk
    FOREIGN KEY (parent_membership_id, centre_id, parent_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  CONSTRAINT parent_student_links_student_fk
    FOREIGN KEY (student_id, centre_id)
    REFERENCES public.students (id, centre_id) ON DELETE RESTRICT,
  CONSTRAINT parent_student_links_active_timestamp_chk
    CHECK ((NOT is_active) = (unlinked_at IS NOT NULL)),
  CONSTRAINT parent_student_links_unlinked_after_linked_chk
    CHECK (unlinked_at IS NULL OR unlinked_at >= linked_at)
);

-- =====================================================================
-- SECTION 5 -- Academic hierarchy (A-016)
--   Centre -> Class Grade -> Class Module -> Class Session
-- No hidden `classes` entity exists between Class Grade and Class Module.
-- =====================================================================

-- Table 9/22 -- class_grades
-- Centre-owned rows constrained by the closed class_grade_code enum, so a
-- Class Grade can carry a real foreign key, an ordering and a display label
-- while remaining impossible to extend to a fourth value at runtime.
CREATE TABLE public.class_grades (
  id            uuid                     PRIMARY KEY,
  centre_id     uuid                     NOT NULL,
  code          public.class_grade_code  NOT NULL,
  display_name  text                     NOT NULL,
  sort_order    smallint                 NOT NULL,
  created_at    timestamptz              NOT NULL DEFAULT now(),
  updated_at    timestamptz              NOT NULL DEFAULT now(),
  CONSTRAINT class_grades_centre_fk
    FOREIGN KEY (centre_id) REFERENCES public.centres (id) ON DELETE RESTRICT,
  CONSTRAINT class_grades_centre_code_key       UNIQUE (centre_id, code),
  CONSTRAINT class_grades_centre_sort_order_key UNIQUE (centre_id, sort_order),
  CONSTRAINT class_grades_id_centre_key         UNIQUE (id, centre_id),
  CONSTRAINT class_grades_sort_order_chk        CHECK (sort_order BETWEEN 1 AND 3),
  CONSTRAINT class_grades_display_name_chk      CHECK (length(btrim(display_name)) > 0)
);

-- Table 10/22 -- class_modules
-- The persisted academic entity created by the "Create Class" UI action,
-- under a selected Class Grade. Its exact field inventory is UNRESOLVED
-- (Amendment 002 U-02); only the relationship model is fixed here, which is
-- what Step 7E is scoped to.
CREATE TABLE public.class_modules (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id       uuid        NOT NULL,
  class_grade_id  uuid        NOT NULL,
  title           text        NOT NULL,
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deactivated_at  timestamptz NULL,
  CONSTRAINT class_modules_grade_fk
    FOREIGN KEY (class_grade_id, centre_id)
    REFERENCES public.class_grades (id, centre_id) ON DELETE RESTRICT,
  CONSTRAINT class_modules_id_centre_key    UNIQUE (id, centre_id),
  CONSTRAINT class_modules_title_chk        CHECK (length(btrim(title)) > 0),
  CONSTRAINT class_modules_active_timestamp_chk
    CHECK ((NOT is_active) = (deactivated_at IS NOT NULL))
);

-- Table 11/22 -- class_sessions
-- The ONLY calendar source. Management and trainer calendars are projections
-- of these rows and their live assignments -- there is deliberately no
-- separate calendar-events table and no duplicated event record.
--
-- There is no session-lifecycle status column: that vocabulary is DEFERRED
-- because its exact values are not yet ratified, and no placeholder enum may
-- be invented (A-026).
CREATE TABLE public.class_sessions (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id        uuid        NOT NULL,
  class_module_id  uuid        NOT NULL,
  session_date     date        NOT NULL,
  starts_at        time        NULL,
  ends_at          time        NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT class_sessions_module_fk
    FOREIGN KEY (class_module_id, centre_id)
    REFERENCES public.class_modules (id, centre_id) ON DELETE RESTRICT,
  -- Composite candidate keys: downstream rows prove centre agreement and
  -- module agreement without repeating a join in application code.
  CONSTRAINT class_sessions_id_centre_key UNIQUE (id, centre_id),
  CONSTRAINT class_sessions_id_module_key UNIQUE (id, class_module_id),
  CONSTRAINT class_sessions_time_order_chk
    CHECK (starts_at IS NULL OR ends_at IS NULL OR ends_at > starts_at)
);

-- Table 12/22 -- enrolments
-- Students enrol at CLASS MODULE level (A-016). Rows are lifecycle episodes:
-- a withdrawal deactivates its row rather than being reactivated later.
CREATE TABLE public.enrolments (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id        uuid        NOT NULL,
  class_module_id  uuid        NOT NULL,
  student_id       uuid        NOT NULL,
  is_active        boolean     NOT NULL DEFAULT true,
  enrolled_at      timestamptz NOT NULL DEFAULT now(),
  withdrawn_at     timestamptz NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT enrolments_module_fk
    FOREIGN KEY (class_module_id, centre_id)
    REFERENCES public.class_modules (id, centre_id) ON DELETE RESTRICT,
  CONSTRAINT enrolments_student_fk
    FOREIGN KEY (student_id, centre_id)
    REFERENCES public.students (id, centre_id) ON DELETE RESTRICT,
  -- Composite candidate key: downstream rows reference an enrolment and, in
  -- the same constraint, prove it is the enrolment for THIS module and THIS
  -- student. This is what makes "assessment requires a valid enrolment"
  -- structural rather than advisory.
  CONSTRAINT enrolments_id_module_student_key UNIQUE (id, class_module_id, student_id),
  CONSTRAINT enrolments_id_centre_key         UNIQUE (id, centre_id),
  CONSTRAINT enrolments_active_timestamp_chk
    CHECK ((NOT is_active) = (withdrawn_at IS NOT NULL)),
  CONSTRAINT enrolments_withdrawn_after_enrolled_chk
    CHECK (withdrawn_at IS NULL OR withdrawn_at >= enrolled_at)
);

-- Table 13/22 -- class_session_assignments
-- Trainer assignment is authoritative at CLASS SESSION level (A-016).
-- Rows are lifecycle episodes; at most one may be active per session.
CREATE TABLE public.class_session_assignments (
  id                     uuid                          PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id              uuid                          NOT NULL,
  class_session_id       uuid                          NOT NULL,
  trainer_membership_id  uuid                          NOT NULL,
  trainer_role           public.centre_membership_role NOT NULL DEFAULT 'trainer',
  is_active              boolean                       NOT NULL DEFAULT true,
  assigned_at            timestamptz                   NOT NULL DEFAULT now(),
  unassigned_at          timestamptz                   NULL,
  created_at             timestamptz                   NOT NULL DEFAULT now(),
  CONSTRAINT class_session_assignments_role_pinned_chk CHECK (trainer_role = 'trainer'),
  CONSTRAINT class_session_assignments_session_fk
    FOREIGN KEY (class_session_id, centre_id)
    REFERENCES public.class_sessions (id, centre_id) ON DELETE RESTRICT,
  CONSTRAINT class_session_assignments_trainer_fk
    FOREIGN KEY (trainer_membership_id, centre_id, trainer_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  CONSTRAINT class_session_assignments_active_timestamp_chk
    CHECK ((NOT is_active) = (unassigned_at IS NOT NULL)),
  CONSTRAINT class_session_assignments_unassigned_after_assigned_chk
    CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at)
);

-- =====================================================================
-- SECTION 6 -- Attendance (A-018)
-- =====================================================================

-- Table 14/22 -- attendance
-- One row per student per class session. Defaults to 'present' on roster
-- initialization; the trainer may toggle an individual student to 'absent'.
--
-- The two composite foreign keys below force full agreement: the session
-- must belong to the recorded module, and the enrolment must be THAT
-- module's enrolment for THAT student. Attendance for a student who was
-- never enrolled in the session's module is therefore unrepresentable.
CREATE TABLE public.attendance (
  id                          uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id                   uuid                     NOT NULL,
  class_session_id            uuid                     NOT NULL,
  class_module_id             uuid                     NOT NULL,
  student_id                  uuid                     NOT NULL,
  enrolment_id                uuid                     NOT NULL,
  status                      public.attendance_status NOT NULL DEFAULT 'present',
  -- Attendance is recorded by the TRAINER: "The trainer may toggle an
  -- individual student to Absent" (A-018). The actor is therefore role-pinned
  -- to 'trainer', not merely centre-pinned. Optional, because a roster is
  -- initialised Present by default before any trainer touches it.
  recorded_by_membership_id   uuid                     NULL,
  recorded_by_role            public.centre_membership_role NULL,
  created_at                  timestamptz              NOT NULL DEFAULT now(),
  updated_at                  timestamptz              NOT NULL DEFAULT now(),
  CONSTRAINT attendance_recorded_by_pair_chk
    CHECK ((recorded_by_membership_id IS NULL) = (recorded_by_role IS NULL)),
  CONSTRAINT attendance_recorded_by_role_pinned_chk
    CHECK (recorded_by_role IS NULL OR recorded_by_role = 'trainer'),
  CONSTRAINT attendance_session_centre_fk
    FOREIGN KEY (class_session_id, centre_id)
    REFERENCES public.class_sessions (id, centre_id) ON DELETE RESTRICT,
  CONSTRAINT attendance_session_module_fk
    FOREIGN KEY (class_session_id, class_module_id)
    REFERENCES public.class_sessions (id, class_module_id) ON DELETE RESTRICT,
  CONSTRAINT attendance_enrolment_fk
    FOREIGN KEY (enrolment_id, class_module_id, student_id)
    REFERENCES public.enrolments (id, class_module_id, student_id) ON DELETE RESTRICT,
  CONSTRAINT attendance_recorded_by_fk
    FOREIGN KEY (recorded_by_membership_id, centre_id, recorded_by_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  CONSTRAINT attendance_session_student_key UNIQUE (class_session_id, student_id)
);

-- =====================================================================
-- SECTION 7 -- Invitations (A-027)
-- =====================================================================

-- Table 15/22 -- invitations
-- Supabase Auth owns EVERY authentication secret. This table therefore has
-- NO raw token, OTP, password, access token, refresh token, secret hash or
-- service credential column -- the prohibition is enforced by the ABSENCE of
-- any column capable of holding one, not by convention.
--
-- An invitation targets a PENDING centre membership; it does not float free
-- of the relationship it is creating. The normalized email is acceptance-time
-- proof only: after linkage, authority flows from accounts.auth_user_id plus
-- live memberships, never from a stored email string.
--
-- Effective expiry is stored status combined with expires_at, evaluated
-- TRANSACTIONALLY at acceptance (Step 7I). It is deliberately not encoded in
-- the index predicate below, because a partial unique index requires an
-- IMMUTABLE predicate and therefore cannot reference now().
CREATE TABLE public.invitations (
  id                            uuid                          PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id                     uuid                          NOT NULL,
  membership_id                 uuid                          NOT NULL,
  invited_by_membership_id      uuid                          NOT NULL,
  invited_by_role               public.centre_membership_role NOT NULL DEFAULT 'management',
  email_normalized              text                          NOT NULL,
  status                        public.invitation_status      NOT NULL DEFAULT 'pending',
  expires_at                    timestamptz                   NOT NULL,
  superseded_by_invitation_id   uuid                          NULL,
  created_at                    timestamptz                   NOT NULL DEFAULT now(),
  accepted_at                   timestamptz                   NULL,
  revoked_at                    timestamptz                   NULL,
  expired_at                    timestamptz                   NULL,
  CONSTRAINT invitations_inviter_role_pinned_chk CHECK (invited_by_role = 'management'),
  CONSTRAINT invitations_membership_fk
    FOREIGN KEY (membership_id, centre_id)
    REFERENCES public.centre_memberships (id, centre_id) ON DELETE RESTRICT,
  CONSTRAINT invitations_invited_by_fk
    FOREIGN KEY (invited_by_membership_id, centre_id, invited_by_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  CONSTRAINT invitations_superseded_by_fk
    FOREIGN KEY (superseded_by_invitation_id)
    REFERENCES public.invitations (id) ON DELETE RESTRICT,
  CONSTRAINT invitations_email_normalized_chk
    CHECK (email_normalized = lower(btrim(email_normalized))
           AND length(email_normalized) > 2
           AND position('@' IN email_normalized) > 1),
  CONSTRAINT invitations_expires_after_created_chk CHECK (expires_at > created_at),
  CONSTRAINT invitations_accepted_timestamp_chk
    CHECK ((status = 'accepted') = (accepted_at IS NOT NULL)),
  CONSTRAINT invitations_revoked_timestamp_chk
    CHECK ((status = 'revoked') = (revoked_at IS NOT NULL)),
  CONSTRAINT invitations_expired_timestamp_chk
    CHECK ((status = 'expired') = (expired_at IS NOT NULL)),
  CONSTRAINT invitations_pending_has_no_terminal_timestamp_chk
    CHECK (status <> 'pending'
           OR (accepted_at IS NULL AND revoked_at IS NULL AND expired_at IS NULL)),
  CONSTRAINT invitations_not_superseded_by_self_chk
    CHECK (superseded_by_invitation_id IS NULL OR superseded_by_invitation_id <> id)
);

-- =====================================================================
-- SECTION 8 -- Observation capture
-- =====================================================================

-- Table 16/22 -- observations
-- The factual source of truth for one student in one class session.
--
-- There is deliberately NO `mode` column: all nine dimensions are mandatory
-- for every assessment and there is no four-dimension completion path and no
-- four-dimension fallback (A-017).
--
-- lock_version powers optimistic concurrency and AI-draft idempotency; the
-- guarded compare-and-set transitions that consume it are Step 7I.
CREATE TABLE public.observations (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id              uuid        NOT NULL,
  class_session_id       uuid        NOT NULL,
  class_module_id        uuid        NOT NULL,
  student_id             uuid        NOT NULL,
  enrolment_id           uuid        NOT NULL,
  trainer_membership_id  uuid        NOT NULL,
  trainer_role           public.centre_membership_role NOT NULL DEFAULT 'trainer',
  strength_chips         text[]      NOT NULL DEFAULT '{}',
  focus_chips            text[]      NOT NULL DEFAULT '{}',
  observation_notes      text        NULL,
  follow_up_notes        text        NULL,
  term_evidence_notes    text        NULL,
  lock_version           integer     NOT NULL DEFAULT 1,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT observations_trainer_role_pinned_chk CHECK (trainer_role = 'trainer'),
  CONSTRAINT observations_session_centre_fk
    FOREIGN KEY (class_session_id, centre_id)
    REFERENCES public.class_sessions (id, centre_id) ON DELETE RESTRICT,
  CONSTRAINT observations_session_module_fk
    FOREIGN KEY (class_session_id, class_module_id)
    REFERENCES public.class_sessions (id, class_module_id) ON DELETE RESTRICT,
  CONSTRAINT observations_enrolment_fk
    FOREIGN KEY (enrolment_id, class_module_id, student_id)
    REFERENCES public.enrolments (id, class_module_id, student_id) ON DELETE RESTRICT,
  CONSTRAINT observations_trainer_fk
    FOREIGN KEY (trainer_membership_id, centre_id, trainer_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  CONSTRAINT observations_session_student_key    UNIQUE (class_session_id, student_id),
  CONSTRAINT observations_id_session_student_key UNIQUE (id, class_session_id, student_id),
  CONSTRAINT observations_id_centre_key          UNIQUE (id, centre_id),
  CONSTRAINT observations_lock_version_chk       CHECK (lock_version >= 1)
);

-- Table 17/22 -- observation_ratings
-- Normalised per-dimension ratings. Exactly one row per dimension per
-- observation is enforced here; the "all nine must be present before the
-- observation may progress" rule is a Step 7I transition guard, not a
-- constraint this table can express on its own.
CREATE TABLE public.observation_ratings (
  id              uuid                      PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id  uuid                      NOT NULL,
  dimension_code  public.dimension_code     NOT NULL,
  rating          public.competency_rating  NOT NULL,
  created_at      timestamptz               NOT NULL DEFAULT now(),
  updated_at      timestamptz               NOT NULL DEFAULT now(),
  CONSTRAINT observation_ratings_observation_fk
    FOREIGN KEY (observation_id) REFERENCES public.observations (id) ON DELETE CASCADE,
  CONSTRAINT observation_ratings_dimension_fk
    FOREIGN KEY (dimension_code)
    REFERENCES public.assessment_dimensions (code) ON DELETE RESTRICT,
  CONSTRAINT observation_ratings_observation_dimension_key
    UNIQUE (observation_id, dimension_code)
);

-- =====================================================================
-- SECTION 9 -- Report aggregate and self-contained versions (A-028)
-- =====================================================================

-- Table 18/22 -- reports
-- ONE aggregate per class session and student. The aggregate owns the single
-- current-cycle status; report_versions own content.
--
-- There is deliberately NO approver column here: approval evidence is
-- version-scoped and lives in report_version_approvals, so approving a later
-- version cannot retroactively rewrite the evidence attached to an earlier
-- one. Spec v3 20's `approver_id` on `reports` is superseded by A-028.
--
-- The two version pointers are created as plain columns here and gain their
-- composite foreign keys in SECTION 10, after report_versions exists. This
-- resolves the reports <-> report_versions circularity by ORDERING rather
-- than by deferrable constraints.
CREATE TABLE public.reports (
  id                           uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id                    uuid                  NOT NULL,
  class_session_id             uuid                  NOT NULL,
  class_module_id              uuid                  NOT NULL,
  student_id                   uuid                  NOT NULL,
  enrolment_id                 uuid                  NOT NULL,
  observation_id               uuid                  NULL,
  status                       public.report_status  NOT NULL DEFAULT 'incomplete',
  lock_version                 integer               NOT NULL DEFAULT 1,
  current_cycle_version_id     uuid                  NULL,
  latest_submitted_version_id  uuid                  NULL,
  created_at                   timestamptz           NOT NULL DEFAULT now(),
  updated_at                   timestamptz           NOT NULL DEFAULT now(),
  CONSTRAINT reports_session_centre_fk
    FOREIGN KEY (class_session_id, centre_id)
    REFERENCES public.class_sessions (id, centre_id) ON DELETE RESTRICT,
  CONSTRAINT reports_session_module_fk
    FOREIGN KEY (class_session_id, class_module_id)
    REFERENCES public.class_sessions (id, class_module_id) ON DELETE RESTRICT,
  CONSTRAINT reports_enrolment_fk
    FOREIGN KEY (enrolment_id, class_module_id, student_id)
    REFERENCES public.enrolments (id, class_module_id, student_id) ON DELETE RESTRICT,
  -- The report's observation, when present, must be the observation for the
  -- SAME session and student.
  CONSTRAINT reports_observation_fk
    FOREIGN KEY (observation_id, class_session_id, student_id)
    REFERENCES public.observations (id, class_session_id, student_id) ON DELETE RESTRICT,
  CONSTRAINT reports_session_student_key UNIQUE (class_session_id, student_id),
  CONSTRAINT reports_observation_key     UNIQUE (observation_id),
  CONSTRAINT reports_id_centre_key       UNIQUE (id, centre_id),
  CONSTRAINT reports_lock_version_chk    CHECK (lock_version >= 1)
);

-- Table 19/22 -- report_versions
-- A version is SELF-CONTAINED: its content and its nine rating snapshots
-- travel together, so a reader never reconstructs an approved report by
-- joining against mutable working data.
--
-- Content fields are exactly the four parent panels named in Specification
-- v3 8 (Parent Feedback Report) and confirmed by CLAUDE.md 6 as the
-- authoritative content baseline until the canonical Figma Design 2 report
-- frame is supplied (Amendment 002 U-06). No new report format is invented.
--
-- There is deliberately NO version-kind enum or column and NO audience
-- column: canonicity comes from the aggregate's latest_submitted_version_id
-- pointer, and audience comes from authorization, never from an attribute on
-- the row. There is also no approved_at here -- the approval record is the
-- sole authority for approval.
--
-- content_hash is deliberately ABSENT, and this is an adjudication, not an
-- oversight. Specification v3 20 lists content_hash on report_versions and
-- A-028 does not supersede it, so it remains a live data-model requirement.
-- But 23 -- "Approval provenance. An approval event captures the
-- content_hash of the approved version" -- is the clause that gives it its
-- meaning, which makes it AUDIT-PROVENANCE data. A-032 states: "Step 7E
-- creates no AI, evidence, audit, or hash-chain column -- including no
-- 'reserved for later' column ... A column arrives with the checkpoint that
-- gives it meaning." Nothing in Step 7E produces or consumes it, and the
-- hash application, algorithm and canonical serialization are explicitly NOT
-- ratified (A-029; Amendment 002 U-14). Creating the column now would mean
-- either a semantically undefined column or selecting an algorithm that no
-- clause has ratified. It therefore arrives with Step 7H.
--
-- submitted_at / submitted_by_membership_id are write-once PUBLICATION
-- metadata. They record that publication happened; they do not perform the
-- freeze. Approval freezes (A-028), and that enforcement is Step 7I.
--
-- Both actors are role-pinned to 'trainer', not merely centre-pinned:
--   * authoring/editing a version is trainer-only -- A-021 gives Trainer
--     "view AND edit within the governed report workflow" while Management
--     and Parent are "view only" and "never edit reports" (A-028);
--   * submission is trainer-only -- "Approve & Submit is one user action
--     performing two transitions ... the server performs both the approve and
--     publish transitions in sequence within the same server action"
--     (CLAUDE.md 6), and approval is trainer-only, so the publisher is the
--     approving trainer.
-- Making these Parent- or Management-referencable would leave a
-- database-enforceable role invariant to be re-checked in application code.
CREATE TABLE public.report_versions (
  id                         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id                  uuid        NOT NULL,
  centre_id                  uuid        NOT NULL,
  revision_number            integer     NOT NULL,
  todays_strength            text        NULL,
  next_focus                 text        NULL,
  practice_suggestion        text        NULL,
  session_takeaway           text        NULL,
  authored_by_membership_id  uuid        NULL,
  authored_by_role           public.centre_membership_role NULL,
  derived_from_version_id    uuid        NULL,
  submitted_at               timestamptz NULL,
  submitted_by_membership_id uuid        NULL,
  submitted_by_role          public.centre_membership_role NULL,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT report_versions_authored_by_pair_chk
    CHECK ((authored_by_membership_id IS NULL) = (authored_by_role IS NULL)),
  CONSTRAINT report_versions_authored_by_role_pinned_chk
    CHECK (authored_by_role IS NULL OR authored_by_role = 'trainer'),
  CONSTRAINT report_versions_submitted_by_pair_chk
    CHECK ((submitted_by_membership_id IS NULL) = (submitted_by_role IS NULL)),
  CONSTRAINT report_versions_submitted_by_role_pinned_chk
    CHECK (submitted_by_role IS NULL OR submitted_by_role = 'trainer'),
  CONSTRAINT report_versions_report_fk
    FOREIGN KEY (report_id, centre_id)
    REFERENCES public.reports (id, centre_id) ON DELETE RESTRICT,
  CONSTRAINT report_versions_authored_by_fk
    FOREIGN KEY (authored_by_membership_id, centre_id, authored_by_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  CONSTRAINT report_versions_submitted_by_fk
    FOREIGN KEY (submitted_by_membership_id, centre_id, submitted_by_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  -- A cloned version must derive from a version of the SAME report.
  CONSTRAINT report_versions_derived_from_fk
    FOREIGN KEY (derived_from_version_id, report_id)
    REFERENCES public.report_versions (id, report_id) ON DELETE RESTRICT,
  CONSTRAINT report_versions_report_revision_key UNIQUE (report_id, revision_number),
  -- Composite candidate keys: aggregate pointers and version children prove
  -- same-report context structurally.
  CONSTRAINT report_versions_id_report_key UNIQUE (id, report_id),
  CONSTRAINT report_versions_id_centre_key UNIQUE (id, centre_id),
  CONSTRAINT report_versions_revision_number_chk CHECK (revision_number >= 1),
  CONSTRAINT report_versions_submitted_pair_chk
    CHECK ((submitted_at IS NULL) = (submitted_by_membership_id IS NULL)),
  CONSTRAINT report_versions_not_derived_from_self_chk
    CHECK (derived_from_version_id IS NULL OR derived_from_version_id <> id)
);

-- Table 20/22 -- report_version_ratings
-- The version's immutable rating snapshots. Exactly one row per dimension
-- per version is enforced here; "exactly nine present before approval" is a
-- Step 7I transition guard.
CREATE TABLE public.report_version_ratings (
  id                 uuid                      PRIMARY KEY DEFAULT gen_random_uuid(),
  report_version_id  uuid                      NOT NULL,
  report_id          uuid                      NOT NULL,
  dimension_code     public.dimension_code     NOT NULL,
  rating             public.competency_rating  NOT NULL,
  created_at         timestamptz               NOT NULL DEFAULT now(),
  CONSTRAINT report_version_ratings_version_fk
    FOREIGN KEY (report_version_id, report_id)
    REFERENCES public.report_versions (id, report_id) ON DELETE CASCADE,
  CONSTRAINT report_version_ratings_dimension_fk
    FOREIGN KEY (dimension_code)
    REFERENCES public.assessment_dimensions (code) ON DELETE RESTRICT,
  CONSTRAINT report_version_ratings_version_dimension_key
    UNIQUE (report_version_id, dimension_code)
);

-- Table 21/22 -- report_version_checklist_progress
-- MUTABLE, version-scoped quality-checklist progress. The checklist attests
-- to THIS exact version's text, which is why it is version-scoped rather
-- than columns on the aggregate. Clearing it on edit, and requiring all
-- three before approval, are Step 7I transition rules.
CREATE TABLE public.report_version_checklist_progress (
  report_version_id   uuid        PRIMARY KEY,
  report_id           uuid        NOT NULL,
  evidence_confirmed  boolean     NOT NULL DEFAULT false,
  ai_draft_reviewed   boolean     NOT NULL DEFAULT false,
  privacy_checked     boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT report_version_checklist_progress_version_fk
    FOREIGN KEY (report_version_id, report_id)
    REFERENCES public.report_versions (id, report_id) ON DELETE CASCADE,
  CONSTRAINT report_version_checklist_progress_version_report_key
    UNIQUE (report_version_id, report_id)
);

-- Table 22/22 -- report_version_approvals
-- IMMUTABLE, version-scoped approval evidence. Exactly one approval row may
-- exist per version, and its presence -- not a column on the version -- is
-- the sole authority for "this version is approved".
--
-- The checklist snapshot is copied here at approval time and constrained to
-- have been fully satisfied, so the evidence of the gate survives even
-- though the working checklist stays mutable.
CREATE TABLE public.report_version_approvals (
  report_version_id             uuid                          PRIMARY KEY,
  report_id                     uuid                          NOT NULL,
  centre_id                     uuid                          NOT NULL,
  approved_by_membership_id     uuid                          NOT NULL,
  approver_role                 public.centre_membership_role NOT NULL DEFAULT 'trainer',
  approved_at                   timestamptz                   NOT NULL DEFAULT now(),
  checklist_evidence_confirmed  boolean                       NOT NULL,
  checklist_ai_draft_reviewed   boolean                       NOT NULL,
  checklist_privacy_checked     boolean                       NOT NULL,
  CONSTRAINT report_version_approvals_approver_role_pinned_chk
    CHECK (approver_role = 'trainer'),
  CONSTRAINT report_version_approvals_version_fk
    FOREIGN KEY (report_version_id, report_id)
    REFERENCES public.report_versions (id, report_id) ON DELETE RESTRICT,
  CONSTRAINT report_version_approvals_version_centre_fk
    FOREIGN KEY (report_version_id, centre_id)
    REFERENCES public.report_versions (id, centre_id) ON DELETE RESTRICT,
  CONSTRAINT report_version_approvals_approver_fk
    FOREIGN KEY (approved_by_membership_id, centre_id, approver_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  -- AI drafts. Trainer approves. An approval row cannot exist unless every
  -- checklist item was satisfied for this exact version.
  CONSTRAINT report_version_approvals_checklist_complete_chk
    CHECK (checklist_evidence_confirmed
       AND checklist_ai_draft_reviewed
       AND checklist_privacy_checked)
);

-- =====================================================================
-- SECTION 10 -- Deferred circular pointer foreign keys
-- =====================================================================
-- Added only now that BOTH reports and report_versions exist. Each pointer
-- includes the report's own id in the composite reference, which makes it
-- structurally impossible for an aggregate to point at a version belonging
-- to a different report. No deferrable constraint is used.

ALTER TABLE public.reports
  ADD CONSTRAINT reports_current_cycle_version_fk
  FOREIGN KEY (current_cycle_version_id, id)
  REFERENCES public.report_versions (id, report_id) ON DELETE RESTRICT;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_latest_submitted_version_fk
  FOREIGN KEY (latest_submitted_version_id, id)
  REFERENCES public.report_versions (id, report_id) ON DELETE RESTRICT;

-- =====================================================================
-- SECTION 11 -- Partial unique indexes (cardinality on ACTIVE rows only)
-- =====================================================================
-- Every predicate below is IMMUTABLE: none references now(). Restricting to
-- active rows is deliberate -- deactivated history must never block a
-- legitimate replacement.

-- At most one ACTIVE account per normalized email.
-- Restricted to active accounts so that many DEACTIVATED historical accounts
-- may share an email -- the person's history survives -- while two live
-- identities for the same email remain impossible. This is a uniqueness rule
-- only; it is not an authorization source (A-027).
CREATE UNIQUE INDEX accounts_one_active_per_normalized_email_idx
  ON public.accounts (normalized_email)
  WHERE status = 'active';

-- At most one ACTIVE membership per (account, centre).
CREATE UNIQUE INDEX centre_memberships_one_active_per_account_centre_idx
  ON public.centre_memberships (account_id, centre_id)
  WHERE status = 'active';

-- At most one ACTIVE management membership per centre.
-- This is the physical enforcement of A-015's "one named management account".
CREATE UNIQUE INDEX centre_memberships_one_active_management_per_centre_idx
  ON public.centre_memberships (centre_id)
  WHERE role = 'management' AND status = 'active';

-- At most one ACTIVE parent-student link per (parent membership, student).
CREATE UNIQUE INDEX parent_student_links_one_active_idx
  ON public.parent_student_links (parent_membership_id, student_id)
  WHERE is_active;

-- At most one ACTIVE enrolment per (module, student).
CREATE UNIQUE INDEX enrolments_one_active_per_module_student_idx
  ON public.enrolments (class_module_id, student_id)
  WHERE is_active;

-- At most one ACTIVE trainer assignment per class session.
CREATE UNIQUE INDEX class_session_assignments_one_active_per_session_idx
  ON public.class_session_assignments (class_session_id)
  WHERE is_active;

-- At most one PENDING invitation per targeted membership.
CREATE UNIQUE INDEX invitations_one_pending_per_membership_idx
  ON public.invitations (membership_id)
  WHERE status = 'pending';

-- At most one PENDING invitation per (centre, normalized email).
-- A pending invitation must be revoked or superseded before a replacement is
-- issued; reissue explicitly vacates this slot rather than relying on time.
CREATE UNIQUE INDEX invitations_one_pending_per_centre_email_idx
  ON public.invitations (centre_id, email_normalized)
  WHERE status = 'pending';

-- =====================================================================
-- SECTION 12 -- Supporting (non-unique) foreign-key indexes
-- =====================================================================

CREATE INDEX centre_memberships_account_idx           ON public.centre_memberships (account_id);
CREATE INDEX centre_memberships_centre_role_idx       ON public.centre_memberships (centre_id, role);
CREATE INDEX students_centre_idx                      ON public.students (centre_id);
CREATE INDEX parent_student_links_student_idx         ON public.parent_student_links (student_id);
CREATE INDEX parent_student_links_parent_idx          ON public.parent_student_links (parent_membership_id);
CREATE INDEX class_grades_centre_idx                  ON public.class_grades (centre_id);
CREATE INDEX class_modules_grade_idx                  ON public.class_modules (class_grade_id);
CREATE INDEX class_sessions_module_date_idx           ON public.class_sessions (class_module_id, session_date);
CREATE INDEX class_sessions_centre_date_idx           ON public.class_sessions (centre_id, session_date);
CREATE INDEX enrolments_student_idx                   ON public.enrolments (student_id);
CREATE INDEX enrolments_module_idx                    ON public.enrolments (class_module_id);
CREATE INDEX class_session_assignments_trainer_idx    ON public.class_session_assignments (trainer_membership_id);
CREATE INDEX class_session_assignments_session_idx    ON public.class_session_assignments (class_session_id);
CREATE INDEX attendance_student_idx                   ON public.attendance (student_id);
CREATE INDEX attendance_enrolment_idx                 ON public.attendance (enrolment_id);
CREATE INDEX invitations_membership_idx               ON public.invitations (membership_id);
CREATE INDEX invitations_centre_status_idx            ON public.invitations (centre_id, status);
CREATE INDEX invitations_superseded_by_idx            ON public.invitations (superseded_by_invitation_id);
CREATE INDEX observations_student_idx                 ON public.observations (student_id);
CREATE INDEX observations_trainer_idx                 ON public.observations (trainer_membership_id);
CREATE INDEX observations_enrolment_idx               ON public.observations (enrolment_id);
CREATE INDEX observation_ratings_dimension_idx        ON public.observation_ratings (dimension_code);
CREATE INDEX reports_student_idx                      ON public.reports (student_id);
CREATE INDEX reports_centre_status_idx                ON public.reports (centre_id, status);
CREATE INDEX reports_enrolment_idx                    ON public.reports (enrolment_id);
CREATE INDEX reports_current_cycle_version_idx        ON public.reports (current_cycle_version_id);
CREATE INDEX reports_latest_submitted_version_idx     ON public.reports (latest_submitted_version_id);
CREATE INDEX report_versions_report_idx               ON public.report_versions (report_id);
CREATE INDEX report_versions_authored_by_idx          ON public.report_versions (authored_by_membership_id);
CREATE INDEX report_versions_submitted_by_idx         ON public.report_versions (submitted_by_membership_id);
CREATE INDEX report_versions_derived_from_idx         ON public.report_versions (derived_from_version_id);
CREATE INDEX report_version_ratings_report_idx        ON public.report_version_ratings (report_id);
CREATE INDEX report_version_ratings_dimension_idx     ON public.report_version_ratings (dimension_code);
CREATE INDEX report_version_approvals_approver_idx    ON public.report_version_approvals (approved_by_membership_id);
CREATE INDEX report_version_approvals_report_idx      ON public.report_version_approvals (report_id);

-- =====================================================================
-- SECTION 13 -- Deterministic seed data (exactly 13 rows) (A-031)
-- =====================================================================
-- Seed UUIDs are FIXED LITERALS, identical in every environment: reference
-- data is not environment-specific, and a report or observation must mean
-- the same thing in local, staging and production.
--
-- These are plain INSERTs, never an upsert and never a do-nothing conflict
-- clause. The tables are created in this same transaction, so a pre-existing
-- divergent row cannot be silently absorbed; SECTION 14 then asserts the
-- exact expected values and counts and aborts the migration on any mismatch.

-- 1 centre.
INSERT INTO public.centres (id, code, display_name) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'ispeak', 'iSpeak Academy');

-- 3 centre-owned Class Grades.
INSERT INTO public.class_grades (id, centre_id, code, display_name, sort_order) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'beginner',     'Beginner',     1),
  ('b1000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'intermediate', 'Intermediate', 2),
  ('b1000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'advanced',     'Advanced',     3);

-- 9 GLOBAL assessment dimensions (not centre-scoped).
INSERT INTO public.assessment_dimensions (id, code, display_name, group_code, sort_order) VALUES
  ('b2000000-0000-4000-8000-000000000001', 'body',                 'Body',                 'competency',         1),
  ('b2000000-0000-4000-8000-000000000002', 'emotion',              'Emotion',              'competency',         2),
  ('b2000000-0000-4000-8000-000000000003', 'speech',               'Speech',               'competency',         3),
  ('b2000000-0000-4000-8000-000000000004', 'tonality',             'Tonality',             'competency',         4),
  ('b2000000-0000-4000-8000-000000000005', 'eye_contact',          'Eye Contact',          'speech_linguistics', 5),
  ('b2000000-0000-4000-8000-000000000006', 'vocal_projection',     'Vocal Projection',     'speech_linguistics', 6),
  ('b2000000-0000-4000-8000-000000000007', 'emotional_expression', 'Emotional Expression', 'speech_linguistics', 7),
  ('b2000000-0000-4000-8000-000000000008', 'sentence_flow',        'Sentence Flow',        'speech_linguistics', 8),
  ('b2000000-0000-4000-8000-000000000009', 'audience_awareness',   'Audience Awareness',   'speech_linguistics', 9);

-- =====================================================================
-- SECTION 14 -- Deterministic seed verification (fail, never absorb)
-- =====================================================================
-- Anonymous DO block only. It creates NO persisted function and NO trigger.
-- Its sole job is to abort the migration if the reference data does not match
-- the ratified values exactly -- silent acceptance of divergent reference
-- data is the failure mode this check exists to prevent.

DO $seed_verification$
DECLARE
  v_centres    integer;
  v_grades     integer;
  v_dimensions integer;
BEGIN
  -- Exactly one centre, with the ratified identity.
  SELECT count(*) INTO v_centres FROM public.centres;
  IF v_centres <> 1 THEN
    RAISE EXCEPTION 'Step 7E seed verification failed: expected exactly 1 centre, found %', v_centres;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.centres
    WHERE id = 'b0000000-0000-4000-8000-000000000001'
      AND code = 'ispeak'
      AND display_name = 'iSpeak Academy'
  ) THEN
    RAISE EXCEPTION 'Step 7E seed verification failed: centre id/code/display_name does not match the ratified values (ispeak / iSpeak Academy)';
  END IF;

  -- Exactly three Class Grades, with the ratified codes, labels and order.
  SELECT count(*) INTO v_grades FROM public.class_grades;
  IF v_grades <> 3 THEN
    RAISE EXCEPTION 'Step 7E seed verification failed: expected exactly 3 class grades, found %', v_grades;
  END IF;

  IF (
    SELECT count(*) FROM public.class_grades g
    WHERE (g.id, g.centre_id, g.code, g.display_name, g.sort_order) IN (
      ('b1000000-0000-4000-8000-000000000001'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid, 'beginner'::public.class_grade_code,     'Beginner',     1::smallint),
      ('b1000000-0000-4000-8000-000000000002'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid, 'intermediate'::public.class_grade_code, 'Intermediate', 2::smallint),
      ('b1000000-0000-4000-8000-000000000003'::uuid, 'b0000000-0000-4000-8000-000000000001'::uuid, 'advanced'::public.class_grade_code,     'Advanced',     3::smallint)
    )
  ) <> 3 THEN
    RAISE EXCEPTION 'Step 7E seed verification failed: class grade rows do not match the ratified values exactly';
  END IF;

  -- Exactly nine assessment dimensions, with the ratified codes, labels,
  -- groups and order.
  SELECT count(*) INTO v_dimensions FROM public.assessment_dimensions;
  IF v_dimensions <> 9 THEN
    RAISE EXCEPTION 'Step 7E seed verification failed: expected exactly 9 assessment dimensions, found %', v_dimensions;
  END IF;

  IF (
    SELECT count(*) FROM public.assessment_dimensions d
    WHERE (d.id, d.code, d.display_name, d.group_code, d.sort_order) IN (
      ('b2000000-0000-4000-8000-000000000001'::uuid, 'body'::public.dimension_code,                 'Body',                 'competency'::public.dimension_group,         1::smallint),
      ('b2000000-0000-4000-8000-000000000002'::uuid, 'emotion'::public.dimension_code,              'Emotion',              'competency'::public.dimension_group,         2::smallint),
      ('b2000000-0000-4000-8000-000000000003'::uuid, 'speech'::public.dimension_code,               'Speech',               'competency'::public.dimension_group,         3::smallint),
      ('b2000000-0000-4000-8000-000000000004'::uuid, 'tonality'::public.dimension_code,             'Tonality',             'competency'::public.dimension_group,         4::smallint),
      ('b2000000-0000-4000-8000-000000000005'::uuid, 'eye_contact'::public.dimension_code,          'Eye Contact',          'speech_linguistics'::public.dimension_group, 5::smallint),
      ('b2000000-0000-4000-8000-000000000006'::uuid, 'vocal_projection'::public.dimension_code,     'Vocal Projection',     'speech_linguistics'::public.dimension_group, 6::smallint),
      ('b2000000-0000-4000-8000-000000000007'::uuid, 'emotional_expression'::public.dimension_code, 'Emotional Expression', 'speech_linguistics'::public.dimension_group, 7::smallint),
      ('b2000000-0000-4000-8000-000000000008'::uuid, 'sentence_flow'::public.dimension_code,        'Sentence Flow',        'speech_linguistics'::public.dimension_group, 8::smallint),
      ('b2000000-0000-4000-8000-000000000009'::uuid, 'audience_awareness'::public.dimension_code,   'Audience Awareness',   'speech_linguistics'::public.dimension_group, 9::smallint)
    )
  ) <> 9 THEN
    RAISE EXCEPTION 'Step 7E seed verification failed: assessment dimension rows do not match the ratified values exactly';
  END IF;
END;
$seed_verification$;

-- =====================================================================
-- SECTION 15 -- Row-Level Security: ENABLED on all 22 tables, ZERO policies
-- =====================================================================
-- RLS is enabled in the same migration that creates each table. Because no
-- policy exists, RLS denies every row to every non-bypassing role. Policies
-- arrive in Step 7G, each paired with its minimum matching grant -- neither
-- is ever added alone.

ALTER TABLE public.centres                            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_dimensions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts                           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centre_memberships                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_profiles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_profiles                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students                           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_grades                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_modules                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrolments                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_session_assignments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_ratings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports                            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_versions                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_version_ratings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_version_checklist_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_version_approvals           ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- SECTION 16 -- Explicit client privilege revocation (deny-by-default)
-- =====================================================================
-- Privilege and policy are separate layers, so the tables are made
-- unreachable by privilege as well as by policy. After this migration NO
-- client role holds SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES or
-- TRIGGER on any application table.
--
-- service_role is included deliberately: it carries BYPASSRLS, so RLS alone
-- would not stop it -- only the absence of an object privilege does.
--
-- Ownership and the PostgreSQL/Supabase platform roles are otherwise left
-- untouched.

REVOKE ALL ON TABLE
  public.centres,
  public.assessment_dimensions,
  public.accounts,
  public.centre_memberships,
  public.trainer_profiles,
  public.parent_profiles,
  public.students,
  public.parent_student_links,
  public.class_grades,
  public.class_modules,
  public.class_sessions,
  public.enrolments,
  public.class_session_assignments,
  public.attendance,
  public.invitations,
  public.observations,
  public.observation_ratings,
  public.reports,
  public.report_versions,
  public.report_version_ratings,
  public.report_version_checklist_progress,
  public.report_version_approvals
FROM PUBLIC, anon, authenticated, service_role;

COMMIT;

-- =====================================================================
-- END OF STEP 7E GOVERNED CORE
-- =====================================================================
-- Deliberately NOT enforced here, because these rules need the Step 7I
-- transition functions and cannot be expressed as constraints. The schema
-- SUPPORTS them; it does not yet claim to enforce them:
--   * exactly-nine rating completeness before progression / approval
--   * approval freezing of a version and its canonical children
--   * write-once enforcement of submitted_at / submitted_by_membership_id
--   * compare-and-set state transitions using lock_version
--   * "no report for an absent student" and mid-cycle absence progression
--     blocking, and the refusal to change submitted attendance to Absent
--   * invitation effective-expiry evaluation and acceptance
--   * report cloning into a new mutable version on edit after approval
--   * "the previous submitted version stays canonical during correction"
--
-- Deliberately NOT enforced here, because it is Step 7G:
--   * every row-visibility rule (parent sees only linked students, trainer
--     sees only live assignments, management sees only its centre)
-- =====================================================================
