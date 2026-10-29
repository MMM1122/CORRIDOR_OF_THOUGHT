# Verification

Executed locally on 2026-10-28 using Node 22.21, macOS, and Chromium (Playwright-controlled).

## Automated checks

- `npm test`: **24 tests passed**, 2 files.
  - Structural parsing and paragraph/heading detection.
  - Exact quote offsets, page anchors and rejection of unsupported quotes.
  - Multi-role nodes, unconfirmed relationship inference, bibliography exclusion.
  - Exact added/removed text and custom concept matching.
  - Reviewable integrity prompts, feedback category validation and HTML sanitization.
  - Real PDF import, duplicate detection, malformed PDF rejection and textless-PDF OCR notice.
  - Persistent working-copy edits, immutable revisions and annotation re-anchor flags.
  - Stale project/revision rejection and argument graph reference validation.
  - Feedback-to-revision links and full backup/restore with checksum rejection.
  - Absent AI credentials, mocked service failure and mocked fabricated-quote rejection.
- `npm run test:e2e`: **4 tests passed** in the final Chromium run.
  - Full fresh PDF upload → library → original PDF → working copy → save → reload.
  - 2D argument selection → exact source passage → annotation → source navigation.
  - Four-paper matrix → edited evidence cell → pairwise differences → reviewed alignment.
  - Comparison-report download → feedback with before/after revisions and affected argument.
  - Corridor → exploded view → editor → reflection → backup download and browser restore → reload.
  - Malformed PDF, unavailable AI and WebGL-disabled fallback.
  - Mobile navigation and document library at 390×844, without horizontal overflow.
  - Actual WebGL portal click, source selection from the exploded view, shared-concept filter, 3D chamber, global search and comparison screenshot.
- `npm run typecheck`: passed.
- `npm run build`: passed (Next.js production build, static shell and all server API routes).

Browser tests use a separate temporary database and build directory. The normal research workspace contains only the four actual source papers and generated local analysis, with no synthetic test annotations, feedback, comparisons or reflections.

## Source and visual inspection

- All four original PDFs were imported and remain stored unchanged by SHA-256 hash.
- A source PDF page was rendered with Poppler and inspected against extracted reading order.
- Heading extraction was corrected after detecting false wrapped-line headings; a further correction separates mixed-font I Ching headings from following body text.
- Desktop corridor and mobile library screenshots were visually inspected. The corridor screenshot waits for actual 3D text synchronization before capture.
- Current seed workspace: 4 documents, 8 initial source/working revisions, 190 argument passages and 44 explicitly unconfirmed relationship suggestions.
- The final evidence report generated in about 32 ms in one direct local measurement. This is an observation on the supplied corpus, not a general performance guarantee. Larger changes fall back to exact block-level diff rather than unbounded word matching.

Screenshots are supplementary evidence, not substitutes for the working application:

- `docs/corridor-desktop.png`
- `docs/library-mobile.png`
- `docs/comparison-desktop.png`

## Verification limits

No live AI credentials were used. Provider failures and unsupported AI quotations were tested with mocked responses. Browser testing used Chromium, not Safari or Firefox. No public deployment, multi-user authentication, built-in OCR or DOCX export is claimed. PDF layout reconstruction and local role/concept/relationship detection remain reviewable heuristics.
