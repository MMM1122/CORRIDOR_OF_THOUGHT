# Corridor of Thought

**Explore how ideas evolve.** A local-first research application for reading and revising papers, inspecting their arguments, comparing perspectives, documenting feedback, and reflecting on knowledge construction.

The four original PDFs in this directory have been imported into the local workspace. Their contents are never fabricated. Any DOCX originals remain in the local project folder; they are not required by the application or included in the GitHub upload.

## Live demo

**[Open the public showcase and interactive demo →](https://corridor-of-thought.yvettewu2017.chatgpt.site)**

Try argument inspection, revision comparison, and reflection with illustrative sample content. No installation or sign-in is required. The full research workspace runs locally using the instructions below.

## Run locally

Requires **Node.js 22.13 or newer** and npm. Node 22.21 was used for verification. Node's built-in SQLite module may print an experimental-feature warning on Node 22; no separate database service is required.

```sh
npm ci
npm run seed
npm run dev
```

Open **http://127.0.0.1:3000**. The server binds only to loopback.

For a production build running locally:

```sh
npm run build
npm start
```

If port 3000 is occupied:

```sh
npm run dev -- --port 3001
```

`npm run seed` checks `seed-papers/` and the project root for the four specified PDFs, imports them, extracts their text, and creates working copies and initial analyses. Re-running it deduplicates by file checksum. Missing seed files are reported; additional PDFs can always be imported from Library or dropped anywhere in the workspace.

## What you can do

- **Corridor:** orbit a real Three.js scene, select a document, break it into source-linked argument and concept nodes, reassemble it, or open its editor. Accessible document buttons and a 2D fallback provide equivalent source access. Argument scenes paginate at 30 passages to keep long documents navigable.
- **Library:** import PDFs (25 MB / 500 pages per file), preserve the originals, filter by text/title/tag, edit titles, tags and source context. Encrypted/malformed PDFs fail explicitly; scanned documents are retained with an OCR notice.
- **Reader:** view the original PDF, inspect extracted or historical text, edit working copies with Tiptap, use headings/lists/quotes/links/highlights, undo/redo, find/replace, manual snapshots, autosave, revision differences, and branching from a prior revision. Split view provides two editable documents and lexical passage suggestions from selected text.
- **Anatomy:** inspect an actual outline, collapse/rename/reorder sections, review multiple argument roles, edit labels and summaries, inspect concepts, add custom vocabulary, review integrity prompts, and explore the same nodes in 2D and 3D. Drag graph handles to create directed relationships; click an edge to edit, verify, or delete it. Layout positions persist.
- **Compare:** select any papers (including all four), use all pairwise text comparisons, inspect an editable evidence-backed matrix, review lexical matches, and create one-to-one, one-to-many, or many-to-many alignments. Elaboration and restructuring are explicitly reviewable classifications.
- **Knowledge Graph:** filter by selected documents, shared/unique concepts, distinctive argument patterns, feedback, elaboration, or restructuring. Click nodes and edges for evidence. Concept and relationship annotations persist. The 3D chamber uses the same records.
- **Feedback:** record internal reflection, human–AI iteration, cross-model, instructor, or other external feedback. Link exact argument nodes and before/after revisions; inspect diffs, evidence, classifications, and verification status. Dates and model identities are user-entered, never inferred.
- **Reflection:** save observations, interpretations, hypotheses and open questions, optionally link passages, inspect shared vocabulary and confirmed comparisons, and revisit the eight academic research questions.
- **Search:** use the header or Cmd/Ctrl+K for papers, source passages, roles, concepts, notes, feedback, and reflections. Search results open their actual records.

## Sources, revisions, and honest analysis

An argument anchor includes document ID, immutable revision ID, block ID, exact quote, offsets, and PDF page where available. Source panels show historical revision status. Working-copy edits create new snapshots; unchanged passages retain page references and reviewed labels. Changed passages receive fresh nodes. Annotations retain their original anchors and are marked for re-anchoring if their quoted text disappears from the current revision.

The local engine uses layout cues, phrase matching, vocabulary matching, and lexical overlap. Adjacent passage cues can suggest directed relationships, shown as unconfirmed until reviewed. **These are suggestions, not semantic certainty.** It supports manual interpretation without any API key. It does not infer the papers' generation chronology or causal feedback history. Differences in AI-generated papers do not establish mechanisms in human cognition.

Original source, extracted text, working copy, snapshots, and generated analysis are distinct. Reordering the outline creates a new working revision and rebuilds paragraph formatting; use editor cut/paste to preserve detailed inline formatting during complex rearrangements.

## Export and backup

- Reader: Markdown, sanitized HTML, original PDF.
- Anatomy: outline Markdown and argument graph JSON.
- Compare: matrix CSV, evidence-backed Markdown report, print / Save as PDF.
- Knowledge Graph: graph JSON with source anchors and verification states.
- Feedback: full feedback history JSON.
- Sidebar: complete JSON backup and restore, including original PDFs (base64), all revisions, analyses, comments, comparisons, reflections, and audit records.

Restore validates the complete structure, foreign references, exact source quotes, and PDF SHA-256 checksums before committing. Restore replaces the project; the app asks for confirmation and advises downloading a current backup first. Maximum backup restore size is 150 MB. Keep backups somewhere separate from the project folder.

## Storage and optional configuration

Default storage is `data/corridor.sqlite` and immutable `data/originals/<sha256>.pdf`. SQLite transactions, foreign keys, WAL, a busy timeout, and optimistic project versions protect persistence. The `data/` directory is ignored by Git. Source PDFs in the repository root are separate from the application's stored copies.

Copy `.env.example` to `.env.local` only if you need custom settings:

```dotenv
CORRIDOR_DATA_DIR=/absolute/private/path/corridor-data
# Optional, explicitly enabled external analysis:
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your-key
AI_MODEL=your-provider-model
```

With AI configured, Anatomy can request additional role/summary suggestions from an OpenAI-compatible chat-completions endpoint supporting JSON output. It sends the selected document's blocks to that provider **only when the AI action is clicked**. Keys remain server-side. Responses are schema-validated, and the entire result is rejected if a quote does not match one stored source block. A 45-second timeout or provider error leaves local analysis unchanged. Live provider behavior was not verified with real credentials.

This is a **single-user local application**, not an authenticated hosted service. Host/origin checks and loopback binding prevent the default editing APIs from being exposed publicly. Do not override the bind address or put this behind a public proxy without implementing authentication and authorization.

## Tests

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

Unit/integration tests use a temporary database. Playwright automatically seeds a **separate disposable database**, starts a test server at `127.0.0.1:3100` with a separate `.next-e2e` build directory, and stops that server afterward. It does not mutate the normal `data/` workspace. Port 3100 must be free.

If you already have a compatible Chromium installation, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its executable path. `TEST_BASE_URL` overrides the isolated test server for CI; use it only with a disposable seeded workspace because the browser workflow edits and restores data.

Tests cover parsing, exact anchors, multi-role analysis, inferred edges, bibliography exclusion, diffs, graph validation, feedback categories and revision links, sanitization, transactional import/save, conflicts, persistent annotations, export, checksum-protected restore, textless-PDF OCR notices, absent AI credentials, mocked provider failures and invented-quote rejection. Browser tests exercise fresh PDF import, editing/reload, anatomy-to-source navigation, annotations, four-paper matrix, pairwise diff and alignments, feedback/revision linking, corridor/exploded view, reflection, downloads, backup/restore, malformed PDF, unavailable AI, WebGL fallback, and mobile navigation. See `docs/VERIFICATION.md` for executed results.

## Practical limits

- OCR is not bundled. Run OCR externally and import the searchable PDF.
- PDF extraction is heuristic. Multi-column layouts, equations, inline font changes and paragraphs crossing pages may require manual cleanup. Original PDFs are always available for checking.
- No DOCX export is claimed. Markdown and HTML are the editable export formats; PDF reports use browser print.
- Local analysis cannot establish semantic equivalence, causation, contradiction, or objective argument correctness. Integrity checks are review prompts; argument edges and transformation classifications require review.
- Exact diffs use line alignment followed by bounded word refinement. Heavily rewritten passages can be shown as whole-block additions/removals, preserving exact text without freezing the UI.
- The SQLite store rewrites a transactional project snapshot across normalized document/revision/entity tables. It is designed for a personal research corpus, not concurrent multi-user or million-document operation. Autosaved revisions are retained, so storage grows with editing.
- No generation dates, model names, prompts, quotations, or feedback histories are invented. The initial papers remain related artifacts until you supply documented provenance.

Architecture, schema mapping, source-anchoring rules and extension points: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
