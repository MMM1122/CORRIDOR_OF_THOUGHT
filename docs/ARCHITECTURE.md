# Architecture

## Runtime

Next.js App Router, React, TypeScript, custom accessible CSS, Tiptap, React Flow, Three.js / React Three Fiber / Drei, PDF.js, Zod, jsdiff, sanitize-html, Turndown, and Node's built-in SQLite. Exact dependency versions are pinned in `package-lock.json`. There is no remote database, mandatory account, CDN font dependency, or browser-only persistence.

Using Node SQLite instead of Prisma keeps local installation small and eliminates generated-client/native-addon configuration. SQL migration `migrations/001_initial.sql` is applied idempotently by `src/lib/db.ts`. The immutable original binaries are content-addressed local files.

## Modules

- `model.ts`: shared types used by every visualization and workflow.
- `pdf.ts`: validated upload, PDF extraction, paragraph/page segmentation, content-addressed storage, initial revision and analysis creation.
- `content.ts`: HTML sanitization, Markdown conversion and readable text extraction.
- `analysis.ts`: structural parsing, concept occurrences, multi-role cues, lexical ranking, integrity prompts, exact diff, matrix candidates and graph serialization.
- `graph.ts`: shared deterministic graph filters for both 2D and 3D.
- `actions.ts`: revision creation/branching, unchanged-quote label/edge preservation, annotation re-anchor flags, metadata and reviewed entity updates.
- `validation.ts`: Zod request and backup schemas.
- `db.ts`: SQLite transactions, relational references, exact-anchor validation and optimistic concurrency.
- `ai.ts`: optional server-side provider adapter; strict parsing and source-quote verification.
- `export.ts`, `backup.ts`: evidence-backed exports, checksum verification and atomic project restoration.
- React components: independent screen modules sharing one AppContext project and queued action dispatcher. Expensive 3D and argument-map modules are dynamically loaded.

## Persistent model mapping

The schema uses explicit `projects`, `documents`, and `revisions` tables plus an indexed typed `entities` table with foreign keys into documents/revisions. Entity payloads are validated JSON. This preserves flexible heterogeneous research records without maintaining a separate ORM schema for every annotation shape.

- Project: project metadata, monotonic version and custom concept vocabulary.
- Document: source filename, SHA-256 hash, immutable extraction revision reference, current working revision, tags, metadata, import timestamp.
- DocumentRevision: parent revision, extracted/working kind, label, sanitized HTML, canonical text, timestamp.
- DocumentBlock: persisted inside its revision with exact offsets, page, order and heading metadata.
- DocumentSection: heading blocks and their subsequent child blocks define the persisted section tree. The outline derives hierarchy from these records; it does not invent IMRaD sections.
- SourceAnchor: embedded immutable document/revision/block/quote/offset/page references on nodes and annotations.
- ArgumentNode / ArgumentEdge: typed entities, including multiple roles, status, origin, concepts, positions and directed relation type.
- Concept / ConceptOccurrence: vocabulary plus persisted node concept associations and source anchors; occurrences point to the corresponding argument's exact source passage.
- Annotation: typed target (paper, block, argument, concept, connection or feedback), source revision, optional exact anchor, kind, tags and re-anchor state.
- CrossDocumentAlignment: many-to-many node ID sets, participating documents/revisions, notes, classification and review status.
- Comparison: matrix-cell entities, per document/revision/dimension, storing selected evidence nodes, summary, annotation and status. Text/lexical comparisons are deterministic projections from the selected revisions.
- FeedbackEvent / FeedbackRelationship: event entities with category/source/time/prompt/interpretation/evidence, affected argument IDs and explicit before/after revision references.
- AnalysisRun: revision, mode, time and method disclosure.
- Reflection: observation/interpretation/hypothesis/open question, evidence IDs and timestamp.
- AuditEvent: local action identifier and timestamp; not a cryptographically signed provenance ledger.

## Write path and concurrency

The browser serializes mutation requests. Each includes the current project version; editor saves also include the base revision. The server validates the action and every cross-reference, checks exact quoted offsets, opens `BEGIN IMMEDIATE`, verifies the database version, writes the project, and commits. A stale tab receives HTTP 409 instead of overwriting another tab's work. All previous revisions are retained.

A failed editor save retains its draft in browser local storage as a recovery aid, while successful records live in SQLite. Switching screens flushes pending edits. A dirty browser tab warns before unloading. Long-running PDF or AI processing checks the database version again before committing.

Imports extract before inserting database records. Original PDFs are stored exclusively under a server-generated SHA-256 filename using exclusive create. A crash after file creation but before commit can leave an unreferenced binary; it does not expose a partially imported document. The app does not delete original binaries automatically.

## Evidence invariants

1. `revision.text.slice(anchor.start, anchor.end) === anchor.quote`.
2. The anchor lies inside its referenced block and document/revision.
3. Argument edges refer to different nodes from the same document revision.
4. Cross-document alignments refer to known nodes from their stated documents/revisions.
5. Feedback before/after references and affected arguments belong to the feedback's document.
6. Matrix evidence belongs to the matrix cell's exact document revision.
7. Old quotes remain attached to old revisions. Changed quotes do not silently inherit verification.
8. An annotation whose quote is absent from the current text is flagged; manual re-anchoring chooses an exact current passage.
9. AI quotations must be exact contiguous text within one source block. Unsupported results are rejected as a unit.
10. Similarity and import order never produce causal or chronological feedback edges.

## Spatial and graph design

Three.js meshes and local-font text render the corridor. No embedded React DOM roots are mounted inside the scene. Orbit controls support keyboard-accessible parallel source lists and a 2D fallback. Camera focus respects reduced motion. Source nodes, concepts, relationships, and feedback all derive from the shared project, with no visualization-only argument records. Node pages bound scene complexity; historical nodes remain available through their source inspector.

React Flow supports pan/zoom, persisted argument-node positions, automatic grid layout, directed edge creation, source selection, and edge review. Adjacent-passage role cues can suggest edges; these are dashed and explicitly unconfirmed. The knowledge graph uses shared/unique concept occurrence and role-pattern filters. These are explicitly heuristic distinctions, not established semantic contradictions.

## Security boundary

This is local single-user software. Development and production scripts bind `127.0.0.1`; API requests validate Host and Origin and reject cross-site mutation traffic. No arbitrary uploaded filename becomes a path. Rich HTML is allowlisted; unsafe URL schemes, scripts, handlers and styles are removed. All SQL uses bound parameters. Backup restores validate payloads and PDF checksums before a transaction. AI keys are accessed only in server modules.

A public/multi-user deployment requires authentication, authorization, upload rate limiting, per-user storage isolation and an appropriate deployment database. None is implied by this local build.
