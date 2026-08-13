-- =====================================================================
-- P2-7 -- A FORWARD CORRECTION TO ONE COMMENT STRING.
-- =====================================================================
-- ⚠️ `20260814140000` wrote `P2-7 screen 14 KPI tiles` into the function's
--    COMMENT. **The screen is `11`**, not `14` -- `14` is the LESSON PLAN
--    surface shipped one phase earlier, so the wrong number names a REAL
--    OTHER SCREEN rather than nothing. ▶ A reader looking for screen `11`'s
--    function would not find it by that comment, and a reader of screen `14`
--    would find a function that has nothing to do with it.
--
-- ⛔ WHY THIS IS A NEW FILE RATHER THAN A ONE-WORD EDIT UPSTREAM. `R-1`:
--    a committed migration is corrected by a NEW FORWARD MIGRATION. And the
--    project's own recorded rule -- *"an applied migration is not edited to
--    make a later test pass"* -- exists because an edited applied file
--    DIVERGES FROM WHAT ACTUALLY RAN. `20260814140000` had already been
--    applied when this was caught; editing it would have left the file
--    saying `11` while the live catalogue said `14`, which is a worse defect
--    than the typo.
--
-- ⚠️ It changes NO behaviour, NO signature, NO grant and NO ACL. Census
--    unmoved at 30 tables · 12 enums · 30 policies · registry 23.
-- =====================================================================

COMMENT ON FUNCTION public.report_centre_dashboard_summary() IS
  'P2-7 screen 11 Management Dashboard KPI tiles. FOUR INTEGERS, centre '
  'resolved from the caller''s own active management membership and never '
  'from a parameter. Returns NULLs to any other caller. Carries no rating, '
  'roll-up, panel field, note, checklist value or hash -- assertion W-4 '
  'fails the build if it ever does.';

DO $verify$
DECLARE
  v_comment text;
BEGIN
  SELECT pg_catalog.obj_description(p.oid) INTO v_comment
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'report_centre_dashboard_summary';

  IF v_comment IS NULL OR v_comment !~ 'screen 11' THEN
    RAISE EXCEPTION 'P2-7 comment fix failed: the comment does not name screen 11';
  END IF;
  -- ⛔ And it must no longer name the WRONG screen, which is the actual defect.
  IF v_comment ~ 'screen 14' THEN
    RAISE EXCEPTION 'P2-7 comment fix failed: the comment still names screen 14';
  END IF;

  RAISE NOTICE 'P2-7 comment corrected: screen 14 -> screen 11, no behaviour changed';
END
$verify$;
