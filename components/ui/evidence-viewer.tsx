"use client";

/**
 * ⛔ THE ONE EVIDENCE PLAYER. P1-3 / P1-4 / P1-5.
 * =====================================================================
 * `PRESENTATION-ONLY` over P1-2's existing read path. It adds no RPC, no
 * schema, no policy and no authority: it renders what
 * `listReportEvidence` returned and mints a URL through
 * `mintEvidenceViewUrl`, both of which resolve the caller's role live in
 * the database on every call (ADR-4).
 *
 * ⚠️ ONE COMPONENT, THREE SURFACES, AND THAT IS DELIBERATE. Screen `08`
 * (trainer attach), the trainer review surface and screen `19` (management
 * final review) all render this. ▶ The alternative — three copies of a
 * `<video>` with three sets of attributes — is exactly how ONE of them
 * quietly acquires a `download` attribute that D-5 forbids, on a surface
 * nobody re-checked. `RATING_TILE_STYLE` was extracted for the same reason
 * one phase earlier.
 *
 * ⛔ NO DOWNLOAD CONTROL, FOR ANY ROLE (D-5). `controlsList="nodownload"`
 * removes the browser's own menu item and `disablePictureInPicture` removes
 * the detach affordance. ⚠️ NEITHER MAKES THE STREAM UNRETRIEVABLE, and the
 * copy says so: the product provides no download affordance; it does not
 * claim technical impossibility. ⛔ No surface may say otherwise.
 *
 * ⚠️ THE URL IS MINTED ON PLAY, NOT ON RENDER. One mint is one
 * `evidence.accessed` event — the only trace that a URL to a child's video
 * existed, for whom and when. Minting on render would fabricate an access
 * on every page view and leave a live URL in the document for visits nobody
 * made.
 *
 * ⛔ THIS COMPONENT IS NOT A GATE AND MUST NEVER BECOME ONE. On the
 * management surface `C-5` governs: **visibility is required, attestation
 * is absent, and it is enforced by nothing.** Rendering it satisfies no
 * precondition; `report_management_approve_and_submit` has no viewing
 * requirement and no management checklist item exists — `A-036`'s checklist
 * stays trainer-only. A `prove:portal-3` leg asserts that non-gate
 * explicitly, because an unasserted non-gate is how a phantom gate gets
 * built later.
 */

import { useState } from "react";
import type { ReportEvidenceClipDto } from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";
import type { EvidenceViewUrlDto } from "@/lib/frontend/contracts/physical-test";

export type EvidenceMintFn = (evidenceId: string) => Promise<UiActionResult<EvidenceViewUrlDto>>;

/** MB, one decimal. The stored value is bytes; nothing here re-derives it. */
function sizeLabel(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenceClipPlayer({
  clip,
  mint,
}: {
  readonly clip: ReportEvidenceClipDto;
  readonly mint: EvidenceMintFn;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function play() {
    if (busy || url) return;
    setBusy(true);
    const result = await mint(clip.id);
    setBusy(false);
    // ⛔ A REFUSAL IS NOT AN EMPTY PLAYER, and no reason is disclosed: every
    // denial reads the same to the caller, exactly as the RPC answers it.
    if (result.outcome !== "success") {
      setFailed(true);
      return;
    }
    setUrl(result.data.url);
  }

  if (failed) {
    return (
      <p data-evidence-state="unavailable" className="mt-3 text-small leading-6 text-ink">
        This recording is not available to view right now.
      </p>
    );
  }

  if (!url) {
    return (
      <div className="mt-3">
        <button
          type="button"
          data-evidence-play={clip.id}
          onClick={() => void play()}
          disabled={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-field border border-line bg-surface px-4 py-2.5 text-small font-semibold text-ink disabled:opacity-60"
        >
          {busy ? "Preparing…" : "Play recording"}
        </button>
        <p className="mt-2 text-small text-neutral-on">
          {clip.mediaType === "video/mp4" ? "MP4" : "MOV"} · {sizeLabel(clip.byteSize)}
        </p>
      </div>
    );
  }

  return (
    <video
      data-evidence-player={clip.id}
      src={url}
      controls
      controlsList="nodownload"
      disablePictureInPicture
      preload="none"
      className="mt-3 w-full rounded-card"
    />
  );
}

/**
 * The whole region: heading, the clips, and D-5's retrievability sentence.
 *
 * ⛔ THE HEADING IS NOT THE FRAME'S. The `19`-era frame draws "Class Video
 * Evidence"; `G-8` REFUSED class footage and `D-5` authorizes PER-CHILD
 * evidence only. Building the heading as drawn would put the refused thing
 * on the page with the frame apparently agreeing. `REGISTERED-OMISSION`:
 * the class framing and the frame's 500 MB figure NEVER END.
 */
export function EvidenceRegion({
  clips,
  mint,
  headingId,
  emptyLabel,
}: {
  readonly clips: readonly ReportEvidenceClipDto[] | null;
  readonly mint: EvidenceMintFn;
  readonly headingId: string;
  readonly emptyLabel: string;
}) {
  return (
    <section className="card p-5 sm:p-6" aria-labelledby={headingId}>
      <h2 id={headingId}>
        <span className="text-card-title font-extrabold text-ink-strong">
          Video Evidence for This Learner
        </span>
      </h2>
      <p className="mt-1 text-small text-neutral-on">
        One recording of this learner&rsquo;s own presentation turn, attached to this
        session&rsquo;s report.
      </p>

      {clips === null ? (
        // ⚠️ Q-7: a rejected read is NOT an empty list. "Cannot be shown" and
        // "no recording attached" are different facts, and showing the second
        // when the first is true tells a reviewer nothing exists when it does.
        <p
          data-evidence-state="unavailable"
          className="mt-4 rounded-panel border border-dashed border-line-strong bg-surface-muted px-6 py-8 text-center text-small leading-6 text-ink"
        >
          Attached recordings cannot be shown right now.
        </p>
      ) : clips.length === 0 ? (
        <p
          data-evidence-state="empty"
          className="mt-4 rounded-panel border border-dashed border-line-strong bg-surface-muted px-6 py-8 text-center text-small leading-6 text-ink"
        >
          {emptyLabel}
        </p>
      ) : (
        <div data-evidence-state="attached">
          {clips.map((clip) => (
            <EvidenceClipPlayer key={clip.id} clip={clip} mint={mint} />
          ))}
        </div>
      )}

      {/*
        ⛔ D-5's retrievability limitation, stated and never denied. The
        product provides NO download control for any role — and it does NOT
        claim technical impossibility. No surface may say otherwise.
      */}
      <p data-evidence-notice="no-download" className="mt-4 text-small leading-6 text-ink-subtle">
        Video is streamed for review only. There is no download control for any role. Streamed
        video remains technically retrievable by a determined user with browser tooling; this is a
        deliberate limitation of the affordance, not a technical guarantee.
      </p>
    </section>
  );
}
