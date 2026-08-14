"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BackLink } from "@/components/ui/back-link";
import { Icon } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { LessonPlanSessionDto, ManagementLessonPlansDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `14` — Management Lesson Plan Management (PORTAL COMPLETION PLAN phase `P2-6`).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED FOR THIS BUILD (`CLAUDE.md` §7.4.1 — every claim below names one)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *   · `reference/Management - Lesson Plan Management/….png`   — geometry and visual truth
 *   · `reference/Management - Lesson Plan Management/….html`  — every measured value below
 *   · `UI_REFERENCE_FINAL_MVP/14-…/screen.md`                 — governance and provenance
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ WHAT THE `.png` DRAWS
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * A breadcrumb (`Classes / Junior · Public Speaking / Lesson Plans`), the title `Lesson Plan
 * Management`, and a `← Class Overview` control at top right. Below it a class header card:
 * a square `PS` monogram, the class name, a grey detail line, and a `Term 1 · 2025` control on
 * the right. Then `Weekly Lessons` with a three-dot legend (`Completed` green, `This week`
 * pink, `Upcoming` grey), and five lesson cards. Each card has a `LESSON n` pill, a title, a
 * `date · room` line, a status chip at right, and a two-column body: `KEY FOCUS POINTS` chips
 * on the left and `SLIDES & MATERIALS` on the right — file rows carrying a type badge, name,
 * size and a download arrow, or a dashed `Slides not uploaded yet` placeholder, then a pink
 * `Upload slides & materials` button. The `This week` card carries a pink border.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ WHAT THE PACK'S `screen.md` SAID, AND WHY BUILDING THIS IS NOT DEFIANCE OF IT
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The numbered pack records *"Prohibited invention: Do not create a lesson-plan table, column,
 * enum or RPC"* and *"Blocked on unratified governance"*. ▶ That prohibition is **DISCHARGED,
 * not overridden**: the gap was RECORDED (plan §13), ESCALATED with every table, column,
 * policy, grant and registry string STATED IN ADVANCE, and RULED by the Operator on
 * 2026-08-13/14. ⚠️ That is precisely the path the same pack prescribes — *"Missing backend or
 * governance requirements are recorded, never invented."* Nothing here was inferred from the
 * frame.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ THREE THINGS THE FRAME DRAWS THAT ARE NOT BUILT. EVERY ONE IS RULED, NOT DRIFT
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * 1. ⛔ THE ENTIRE `KEY FOCUS POINTS` COLUMN — title, chips and all. **RAISED BY THIS PHASE
 *    AND DECLINED BY THE OPERATOR**, answering a NEW-QUESTION rather than assuming: *"`D-4`
 *    gave them a purpose and a position constraint and never named an author. There is no
 *    authoring surface in the ratified inventory and the frame draws them read-only. Building
 *    a read for a field nobody can write produces a permanently empty panel — worse than
 *    absent."* ⚠️ Recorded as **DECLINED WITH THE REASON so a later phase does not read
 *    `D-4`'s mention as licence.** There is no `class_sessions.key_focus`; migration assertion
 *    `M-6` FAILS THE BUILD if one appears. ⛔ `observations.focus_chips` IS NOT THIS FIELD —
 *    that is the trainer's POST-session observation, while KEY FOCUS is lesson-plan INTENT
 *    (`G-3`). ▶ `REGISTERED-OMISSION`. It ends only if the academy names an author, which
 *    returns as its own question with its own schema authorization.
 *    ⚠️ Because the left column is gone, materials take the full card width rather than
 *    leaving a `400px` void where the chips were.
 *
 * 2. ⛔ `6-week persuasive speaking unit` ON THE HEADER LINE. `class_modules` has **no
 *    description column** — measured at HEAD, not assumed — and schema'ing one from a frame is
 *    exactly what `A-022` bars. It is the `C-14` family (`Class code`, `Capacity`, `Program`),
 *    already ruled out at `P2-2`. `REGISTERED-OMISSION`, NEVER ENDS.
 *
 * 3. ⛔ THE FRAME'S `Junior` GRADE, in the breadcrumb and the class name. The ratified Class
 *    Grade vocabulary is `Beginner` / `Intermediate` / `Advanced` (`A-016`; `A-026`/`A-054`),
 *    and `A-054` prohibits global keyword replacement over it. ⚠️ Every label here is READ from
 *    `class_grades.display_name`, never written as a literal, so a fourth value cannot appear
 *    even by editing this file.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ TWO ELEMENTS OMITTED FOR ABSENCE OF DATA, WHICH IS A DIFFERENT THING ENTIRELY
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * `LESSON n` + the lesson title, and `Studio 2`. ⚠️ ALL THREE COLUMNS EXIST — `lesson_number`,
 * `lesson_title` and `room` — and `G-3` ruled the first two IN SCOPE. They are simply **NULL on
 * all 17 live sessions**, measured. ▶ hero `0B`: NULL means NOT RECORDED, so the ELEMENT IS
 * OMITTED and the card's identity falls back to its DATE. ⛔ An invented `Lesson 1` is exactly
 * what `0B` forbids, and a rendered-but-empty pill is how one gets written.
 * ⚠️ THIS IS NOT A `REGISTERED-OMISSION` — it ends the moment a session records a lesson, and
 * the fixture mode already renders the populated branch, which is the only way the omission is
 * proved to be a DECISION rather than an accident of empty data.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ✅ ONE CONTROL THE FRAME DOES NOT DRAW, ADDED BY OPERATOR RULING
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ **REMOVE, on the same grounds as the back affordance on `13`/`26`/`27`** — an Operator
 * ADDITION, cited here so a later visual pass does not delete it for fidelity. The reasoning is
 * recorded because it decides the clause: *"the `27` day-strip discipline protects against
 * destroying GOVERNED RECORDS — removing a session discards attendance, observations and
 * reports. A lesson slide deck is none of those. And a file nobody can remove is a worse
 * outcome than an undrawn control, which is the same reasoning that made `D-5`'s evidence
 * removable."* ⚠️ MANAGEMENT ONLY, and the server re-resolves that independently — a trainer
 * downloads, a trainer never removes.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ ONE MICROCOPY DIVERGENCE, RECORDED RATHER THAN SILENTLY RESOLVED
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The frame's control reads `← Class Overview`; the shared `BackLink` renders `Back to Class
 * Overview`. ▶ The shared control WINS, under the standing Operator ruling that *"a second
 * treatment for the same act is the divergence I keep ruling against"* — screens `13`, `26` and
 * `27` all render this exact component. Recorded so the wording gap is a known trade, not drift.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * MEASURED FROM THE `.html` — values, never markup
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * Card radius `12px`; card border `1px #EDEFF4` (the `line` token). Chips and pills
 * `border-radius: 999px`, `padding: 7px 12px`, `font-size: 12px`. Materials panel `400px`.
 * Materials row fill `#F7F8FB`. Status chips: Completed `#E4F3E4`, This week `#FCE7F0`,
 * Upcoming `#EEF1F5`. Lesson pill `#EC4B96` (brand) or `#1B2A4A` (ink). Legend dots `9px`.
 * File-type badges `#FBE9D2` / `#DCE9F5` / `#FCE4DE`. Body gaps `14–16px`, card padding `20–22px`.
 */

/** The frame's three lesson states, derived from the date alone — deterministic, never stored. */
type LessonPhase = "completed" | "current" | "upcoming";

const PHASE_CHIP: Record<LessonPhase, { readonly label: string; readonly className: string }> = {
  completed: { label: "Completed", className: "bg-[#E4F3E4] text-[#2F6B37]" },
  current: { label: "This week", className: "bg-[#FCE7F0] text-brand-700" },
  upcoming: { label: "Upcoming", className: "bg-[#EEF1F5] text-ink-muted" },
};

const PHASE_DOT: Record<LessonPhase, string> = {
  completed: "bg-[#67B26F]",
  current: "bg-brand-500",
  upcoming: "bg-[#AEB6C4]",
};

/**
 * ⚠️ THE WEEK IS COMPUTED IN LOCAL TIME, never through `toISOString()` — the same defect
 * `P2-5` had to fix on the calendar grid, where a UTC round-trip shifted every date by a day
 * for anyone east of Greenwich, which is everyone using this product.
 */
function isoDate(value: Date): string {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function lessonPhase(sessionDate: string, today: string): LessonPhase {
  const start = new Date(`${today}T00:00:00`);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  if (sessionDate >= isoDate(start) && sessionDate <= isoDate(end)) return "current";
  return sessionDate < today ? "completed" : "upcoming";
}

/** `Tue 25 Feb`, matching the frame. Parsed as local midnight, never as UTC. */
function dateLabel(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** `3:00–4:00 PM` from two `HH:MM[:SS]` values. */
function timeLabel(startsAt: string | null, endsAt: string | null): string | null {
  if (startsAt === null) return null;
  const clock = (value: string) => {
    const [hours = "0", minutes = "00"] = value.split(":");
    const hour = Number(hours);
    const suffix = hour < 12 ? "AM" : "PM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display}:${minutes} ${suffix}`;
  };
  return endsAt === null ? clock(startsAt) : `${clock(startsAt)} – ${clock(endsAt)}`;
}

/**
 * The frame's `PPTX` / `PDF` / `KEY` badges.
 *
 * ⚠️ DERIVED FROM THE STORED MIME TYPE, not from a file extension in the display name — the
 * display name is management-authored text and can say anything, while `media_type` was read
 * off the STORED OBJECT by `material_attach_confirm` and re-validated against the ruled eight.
 */
const MEDIA_BADGE: Record<string, { readonly label: string; readonly className: string }> = {
  "application/pdf": { label: "PDF", className: "bg-[#FCE4DE] text-[#9A4A34]" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    label: "PPTX",
    className: "bg-[#FBE9D2] text-[#8A5A1E]",
  },
  "application/vnd.ms-powerpoint": { label: "PPT", className: "bg-[#FBE9D2] text-[#8A5A1E]" },
  "application/vnd.apple.keynote": { label: "KEY", className: "bg-[#DCE9F5] text-[#2C5B85]" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    label: "DOCX",
    className: "bg-[#DCE9F5] text-[#2C5B85]",
  },
  "application/msword": { label: "DOC", className: "bg-[#DCE9F5] text-[#2C5B85]" },
  "image/png": { label: "PNG", className: "bg-[#E4F3E4] text-[#2F6B37]" },
  "image/jpeg": { label: "JPEG", className: "bg-[#E4F3E4] text-[#2F6B37]" },
};

/** `4.2 MB`, matching the frame's one-decimal form. */
function sizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/*
 * ⛔ THE EIGHT RULED MIME TYPES, and this list is a PICKER FILTER ONLY. The
 * authority is `material_attach_confirm`, which reads the type off the STORED
 * object — a caller bypassing this input entirely is refused by the database,
 * not by the browser.
 */
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "text/plain",
].join(",");

function LessonCard({
  session,
  today,
  onChanged,
}: {
  readonly session: LessonPlanSessionDto;
  readonly today: string;
  readonly onChanged: () => void;
}) {
  const port = usePhysicalTestPort();
  const fileInput = useRef<HTMLInputElement>(null);
  const phase = lessonPhase(session.sessionDate, today);
  const chip = PHASE_CHIP[phase];
  const time = timeLabel(session.startsAt, session.endsAt);

  /*
   * ⛔ `P2-6R` — ONE `busy` id AND ONE `notice`, NOT A MAP. Only one material
   * control can be in flight at a time on this card, and the refusal message is
   * rendered rather than swallowed: `Q-7` — a refusal is an answer, and a
   * control that fails silently is the defect this phase exists to repair.
   */
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /*
   * ⚠️ THE URL IS OPENED, NEVER STORED AND NEVER RENDERED. It is short-TTL and
   * server-minted; putting it in the document would leave a live storage URL in
   * the DOM for as long as the page is open.
   */
  async function openMaterial(materialId: string, displayName: string): Promise<void> {
    setBusyId(materialId);
    setNotice(null);
    const result = await port.readMaterialViewUrl(materialId);
    setBusyId(null);
    if (result.outcome !== "success") {
      setNotice(`${displayName} could not be opened.`);
      return;
    }
    globalThis.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  /**
   * ⛔ `P2-6R` — THE UPLOAD, RELAYED THROUGH A SERVER ACTION (Operator ruling).
   *
   * ⚠️ NOT RESUMABLE, AND THE SURFACE SAYS SO rather than letting a trainer or
   * an administrator discover it by losing a 25 MiB transfer. The notice below
   * is written in the same register as the unscanned notice: it states what
   * happens, once, without softening it.
   */
  async function uploadMaterial(sessionId: string, file: File): Promise<void> {
    setBusyId(sessionId);
    setNotice(null);
    const form = new FormData();
    form.set("classSessionId", sessionId);
    // ⚠️ The file's own name is the display name. It is re-trimmed, re-length-
    // checked and re-validated server-side; nothing here is trusted.
    form.set("displayName", file.name);
    form.set("file", file);
    const result = await port.uploadMaterial(form);
    setBusyId(null);
    if (result.outcome !== "success") {
      /*
       * ⛔ ONE MESSAGE FOR EVERY REFUSAL. The server does not distinguish "not
       * your session" from "no such session", and neither does this — the
       * non-disclosure discipline the whole adapter surface already holds.
       */
      setNotice(`${file.name} was not accepted. Check it is a supported document under 25 MB.`);
      return;
    }
    onChanged();
  }

  async function removeMaterial(materialId: string, displayName: string): Promise<void> {
    // ⛔ A GOVERNED, AUDITED DELETION (`material.removed`) — confirmed first.
    if (!globalThis.confirm(`Remove ${displayName} from this lesson?`)) return;
    setBusyId(materialId);
    setNotice(null);
    const result = await port.removeMaterial(materialId);
    setBusyId(null);
    if (result.outcome !== "success") {
      setNotice(`${displayName} could not be removed.`);
      return;
    }
    // Re-read rather than splicing local state: the server is authoritative
    // about what is attached, and a local splice would diverge on a partial.
    onChanged();
  }

  /*
   * ⚠️ THE CARD'S IDENTITY, hero `0B`. Where a lesson number and title exist the frame's
   * `LESSON n` + title render; where they are NULL — which is every live session at HEAD —
   * the DATE becomes the heading rather than an empty pill sitting above an empty string.
   */
  const hasLesson = session.lessonNumber !== null || session.lessonTitle !== null;

  return (
    <article
      className={`rounded-[12px] bg-surface p-5 sm:p-[22px] ${
        phase === "current" ? "border-2 border-brand-500" : "border border-line"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {session.lessonNumber !== null ? (
            <span
              className={`rounded-full px-3 py-[7px] text-[11px] font-bold uppercase tracking-wide text-white ${
                phase === "upcoming" ? "bg-[#1B2A4A]" : "bg-brand-500"
              }`}
            >
              Lesson {session.lessonNumber}
            </span>
          ) : null}
          <div>
            <h3 className="text-[16px] font-bold text-ink">
              {hasLesson ? (session.lessonTitle ?? dateLabel(session.sessionDate)) : dateLabel(session.sessionDate)}
            </h3>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              {/* ⚠️ `room` is omitted, not blanked — no dangling separator (hero `0B`). */}
              {[hasLesson ? dateLabel(session.sessionDate) : null, time, session.room]
                .filter((part): part is string => part !== null && part !== "")
                .join(" · ")}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-[7px] text-[11px] font-semibold ${chip.className}`}>
          {chip.label}
        </span>
      </div>

      {/*
        ⛔ NO `KEY FOCUS POINTS` COLUMN — see the header block. The materials panel therefore
        takes the full width instead of leaving a `400px` void where the chips were drawn.
      */}
      <section className="mt-4">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">
          Slides &amp; materials
        </h4>
        {session.materials.length === 0 ? (
          <p className="mt-2 rounded-[10px] border border-dashed border-line px-4 py-3 text-[12px] text-ink-subtle">
            {/* The frame's own empty state, kept verbatim. */}
            Slides not uploaded yet
          </p>
        ) : (
          <ul className="mt-2 flex list-none flex-col gap-2 p-0">
            {session.materials.map((material) => {
              const badge = MEDIA_BADGE[material.mediaType] ?? {
                label: "FILE",
                className: "bg-[#EEF1F5] text-ink-muted",
              };
              return (
                <li
                  key={material.materialId}
                  className="flex items-center gap-3 rounded-[10px] bg-[#F7F8FB] px-3 py-2.5"
                >
                  <span className={`rounded-[6px] px-2 py-1 text-[0.625rem] font-bold ${badge.className}`}>
                    {badge.label}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-semibold text-ink">
                      {material.displayName}
                    </span>
                    <span className="block text-[10px] text-ink-subtle">{sizeLabel(material.byteSize)}</span>
                  </span>
                  {/*
                    ✅ `P2-6R` — BOTH CONTROLS ARE NOW LIVE. `P2-6` rendered them `disabled`
                    with a tooltip while the RPCs behind them sat granted and unreachable from
                    any application code, and reported the phase COMPLETE — the limit stated in
                    a source comment and nowhere the Operator reads. ⛔ That is the defect
                    `PDTa-WIRED` and plan §12.12 now exist to prevent.
                  */}
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => void openMaterial(material.materialId, material.displayName)}
                    className="inline-flex min-h-9 items-center gap-1 rounded-[8px] px-2 text-ink-subtle transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Icon name="download" size={16} />
                    <span className="sr-only">Open {material.displayName}</span>
                  </button>
                  {/* ⛔ OPERATOR ADDITION — the frame draws no removal. See the header block. */}
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => void removeMaterial(material.materialId, material.displayName)}
                    className="inline-flex min-h-9 items-center rounded-[8px] px-2 text-ink-subtle transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Icon name="close" size={16} />
                    <span className="sr-only">Remove {material.displayName}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {/*
          ✅ `P2-6R` — UPLOAD IS LIVE, VIA A SERVER-ACTION RELAY (Operator ruling, 2026-08-15).

          ⛔ ROUTE (a) — a browser-direct resumable upload — WAS REFUSED, and the guard that
          refused it stands unchanged: *"I scoped that exception to `evidence-upload.ts`
          SPECIFICALLY, and route (a) needs precisely the widening I refused. The guard firing
          is the guard working."* ▶ The relay needs no widening at all, because the upload runs
          on the CALLER'S OWN request-scoped client and ADR-3 records that the database role
          follows the credential, not the code location.

          ⚠️ `accept` IS A CONVENIENCE, NOT A GATE. It only pre-filters the OS picker; the
          transport, the bucket, the CHECK constraint and `material_attach_confirm` each
          re-check the type and the size server-side against the STORED object.
        */}
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(event) => {
            const chosen = event.target.files?.[0];
            // Reset first: picking the SAME file twice must fire `change` again.
            event.target.value = "";
            if (chosen) void uploadMaterial(session.classSessionId, chosen);
          }}
        />
        <button
          type="button"
          disabled={busyId !== null}
          onClick={() => fileInput.current?.click()}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-brand-500 px-4 text-[13px] font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Icon name="upload" size={16} />
          {busyId === session.classSessionId ? "Uploading…" : "Upload slides & materials"}
        </button>
        {/*
          ⛔ THE NON-RESUMABILITY NOTICE, IN THE SAME HONEST REGISTER AS THE UNSCANNED NOTICE.
          Operator: *"A dropped upload retries from the start, and the copy should not imply
          otherwise."* ▶ It is stated where the control is, permanently — not surfaced only
          after a failure, when it would read as an excuse rather than as a property.
        */}
        {/*
          ⚠️ THE WORDING AVOIDS "beginning" DELIBERATELY, AND THE REASON IS RECORDED SO IT IS NOT
          "improved" BACK. The first draft read *"it starts again from the beginning"* and turned
          `PLMa-RATINGS` RED — that leg matches the four rating labels as BARE WORDS, and
          `beginning` is one of them. ▶ Rewording was the honest fix; NARROWING THE DETECTOR TO
          FIT THIS COPY IS THE MOVE THE OPERATOR REFUSED AT `AR-4` — *"a rule relaxed to fit one
          frame stops measuring the next."* ⛔ The detector's bare-word shape IS a real finding —
          `A-052` prohibits exactly it for the leak guard, because it rejects valid English — and
          it is REPORTED rather than quietly patched here.
        */}
        <p className="mt-2 text-[11px] text-ink-subtle">
          PDF, Word, PowerPoint, image or text, up to 25 MB. Uploads do not resume — an
          interrupted upload must be started again from scratch.
        </p>
        {notice !== null ? (
          <p role="status" className="mt-2 text-[12px] text-ink-muted">
            {notice}
          </p>
        ) : null}
      </section>
    </article>
  );
}

export function ManagementLessonPlans({ classModuleId }: { readonly classModuleId: string }) {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<ManagementLessonPlansDto | null>>({ kind: "loading" });
  const today = useMemo(() => isoDate(new Date()), []);
  /*
   * ⛔ `P2-6R` — A RE-READ COUNTER, NOT A LOCAL SPLICE. After a governed removal
   * the SERVER is authoritative about what is attached; editing the list in
   * place would diverge from it on any partial failure and show management a
   * material that is still there, or hide one that is.
   */
  const [reloads, setReloads] = useState(0);

  useEffect(() => {
    let cancelled = false;
    /*
     * ⚠️ NO SYNCHRONOUS `setState` HERE — the same rule `P2-5` recorded.
     * Resetting to `loading` on entry looks right and is a cascading render;
     * the effect already re-runs when the module changes.
     */
    void port.readManagementLessonPlans(classModuleId).then((result) => {
      if (cancelled) return;
      setState(
        result.outcome === "success"
          ? { kind: "ready" as const, data: result.data }
          : { kind: "failed" as const, result: asFailure(result) },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [port, classModuleId, reloads]);

  const plans = state.kind === "ready" ? state.data : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {/*
            The frame's breadcrumb. ⚠️ The grade segment is READ, never a literal — the frame's
            `Junior` is not a ratified Class Grade (`A-016`, `A-026`/`A-054`).
          */}
          <p className="text-[11.5px] text-ink-subtle">
            {["Classes", plans?.moduleTitle ?? null, "Lesson Plans"]
              .filter((part): part is string => part !== null && part !== "")
              .join(" / ")}
          </p>
          <PageHeading title="Lesson Plan Management" />
        </div>
        {/* ⚠️ The shared control; the frame's `← Class Overview` wording divergence is recorded above. */}
        <BackLink href={`/management/classes/${classModuleId}`} label="Class Overview" />
      </div>

      {/*
        ⚠️ THE `label` IS NOT DECORATION. Without it the loading state paints
        bare skeleton bars with NO accessible text — a screen reader announces
        nothing at all. `S3-M7-t` caught the omission, which is the leg working
        rather than the leg being wrong.
      */}
      {state.kind === "loading" ? <LoadingSkeleton rows={4} label="Loading lesson plans" /> : null}
      {state.kind === "failed" ? <StatePanel result={state.result} /> : null}

      {/*
        ⚠️ AN UNKNOWN MODULE AND A REFUSED READ ARE DIFFERENT ANSWERS (`Q-7`), and they render
        differently: a refusal reaches `StatePanel` above, while `null` says the module is not
        there. Collapsing them would tell management a class has no lessons when the read was
        simply rejected.
      */}
      {state.kind === "ready" && plans === null ? (
        <p className="rounded-[12px] border border-line bg-surface p-5 text-body text-ink-muted">
          That class module could not be found.
        </p>
      ) : null}

      {plans !== null ? (
        <>
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-line bg-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-brand-500 text-[13px] font-bold text-white">
                {/* The frame's `PS` monogram, derived from the module title rather than stored. */}
                {plans.moduleTitle
                  .split(/\s+/)
                  .filter((word) => /[A-Za-z]/.test(word))
                  .slice(0, 2)
                  .map((word) => word[0]?.toUpperCase() ?? "")
                  .join("")}
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink">{plans.moduleTitle}</h2>
                {/*
                  ⛔ NO `6-week persuasive speaking unit` — no description column exists
                  (`A-022`, `C-14`). The learner count is real and is kept.
                */}
                <p className="mt-0.5 text-[12px] text-ink-muted">
                  {[
                    plans.classGradeName === "" ? null : plans.classGradeName,
                    `${plans.learnerCount} ${plans.learnerCount === 1 ? "learner" : "learners"}`,
                  ]
                    .filter((part): part is string => part !== null)
                    .join(" · ")}
                </p>
              </div>
            </div>
            {/* ⚠️ Omitted where the module's sessions do not agree on one term (hero `0B`). */}
            {plans.termLabel === null ? null : (
              <span className="rounded-full bg-canvas px-3 py-[7px] text-[13px] font-semibold text-ink-muted">
                {plans.termLabel}
              </span>
            )}
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-ink">Weekly Lessons</h2>
            <ul className="flex list-none flex-wrap items-center gap-4 p-0 text-[11px] text-ink-muted">
              {(["completed", "current", "upcoming"] as const).map((phase) => (
                <li key={phase} className="flex items-center gap-1.5">
                  <span className={`h-[9px] w-[9px] rounded-full ${PHASE_DOT[phase]}`} aria-hidden="true" />
                  {PHASE_CHIP[phase].label}
                </li>
              ))}
            </ul>
          </div>

          {plans.sessions.length === 0 ? (
            // ⚠️ A POSITIVE CLAIM about this module, reachable only on a SUCCESSFUL read.
            <p className="rounded-[12px] border border-line bg-surface p-5 text-body text-ink-muted">
              No lessons are scheduled for this class yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {plans.sessions.map((session) => (
                <LessonCard
                  key={session.classSessionId}
                  session={session}
                  today={today}
                  onChanged={() => setReloads((n) => n + 1)}
                />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
