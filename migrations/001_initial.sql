-- Applied idempotently by src/lib/db.ts. SQLite 3.37+.
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY, version INTEGER NOT NULL, payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS revisions(id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id), payload TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS entities(id TEXT PRIMARY KEY, kind TEXT NOT NULL, document_id TEXT REFERENCES documents(id), revision_id TEXT REFERENCES revisions(id), payload TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS entities_kind ON entities(kind);
CREATE INDEX IF NOT EXISTS entities_revision ON entities(revision_id);
INSERT OR IGNORE INTO schema_migrations VALUES(1, datetime('now'));
