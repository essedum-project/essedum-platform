/**
 * Git Utility Functions
 *
 * Branch name helpers, SHA parsers, storage key builders.
 * Output of buildSessionBranchName must be byte-identical to the web editor's
 * equivalent function for the same inputs so both clients target the same branch.
 */

import { GITHUB, GITHUB_STORAGE_KEYS } from '../constants/github-constants';

/**
 * Converts an arbitrary string into a Git branch-name-safe segment.
 * Rules: lower-case, only [a-z0-9], runs of unsafe chars → single dash,
 * leading/trailing dashes stripped. Empty result falls back to `fallback`.
 */
export function toBranchSafeSegment(value: string, fallback: string): string {
  const safe = (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return safe || fallback;
}

/**
 * Builds the session branch name used by both the web editor and this extension.
 * Format: session/{sessionId}-{pipelineKey}-{gitUser}-YYYY-MM-DD
 */
export function buildSessionBranchName(
  sessionId: string,
  pipelineKey: string,
  gitUser: string
): string {
  const id   = toBranchSafeSegment(sessionId, 'session');
  const key  = toBranchSafeSegment(pipelineKey, 'pipeline');
  const user = toBranchSafeSegment(gitUser, 'user');
  const date = new Date().toISOString().slice(0, 10);
  return `${GITHUB.SESSION_BRANCH_PREFIX}/${id}-${key}-${user}-${date}`;
}

/**
 * Extracts the first commit SHA (7–40 hex chars) from a push response string.
 */
export function parseCommitShaFromPushResponse(response: string): string | undefined {
  return response?.match(/[a-f0-9]{7,40}/i)?.[0];
}

/**
 * Builds the workspaceState key for a SessionBranchState entry.
 * @deprecated Use buildSimpleStateKey — the username-in-key approach breaks when
 * the auth method changes (e.g. PAT vs OAuth). Kept for backwards compatibility.
 */
export function buildSessionStateKey(
  gitUser: string,
  sessionId: string,
  pipelineKey: string
): string {
  return `${GITHUB_STORAGE_KEYS.SESSION_BRANCH_STATE_PREFIX}:${gitUser}:${sessionId}:${pipelineKey}`;
}

/**
 * Pipeline-key-only storage key. Survives username/auth-method changes and is
 * the canonical key written by persistState from VS Code extension v19+.
 */
export function buildSimpleStateKey(pipelineKey: string): string {
  return `${GITHUB_STORAGE_KEYS.SESSION_BRANCH_STATE_PREFIX}:${pipelineKey}`;
}

/**
 * Extracts owner/repo from a GitHub HTTPS URL.
 * Accepts trailing .git and trailing slashes.
 */
export function extractRepoFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') { return undefined; }
    const parts = parsed.pathname.replace(/\.git$/, '').split('/').filter(Boolean);
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : undefined;
  } catch { return undefined; }
}

/**
 * Strips a GitHub token from any string before logging.
 * Leaves the last 4 characters visible for debugging.
 */
export function redactToken(value: string, token?: string): string {
  if (!token || token.length < 5) { return value; }
  const mask = '*'.repeat(token.length - 4) + token.slice(-4);
  return value.replace(
    new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
    mask
  );
}

/**
 * Generates a short random session ID (12 hex chars).
 */
export function generateSessionId(): string {
  return Math.random().toString(16).slice(2, 8) +
         Math.random().toString(16).slice(2, 8);
}

/**
 * Sanitizes a commit message: strips control characters, caps at 72 chars for
 * the subject line.
 */
export function sanitizeCommitMessage(msg: string, maxLength = 72): string {
  return msg
    .replace(/[\x00-\x1f\x7f]/g, ' ')
    .trim()
    .slice(0, maxLength);
}
