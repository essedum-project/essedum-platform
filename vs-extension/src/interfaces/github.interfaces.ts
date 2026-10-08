/**
 * GitHub Integration Interfaces
 *
 * All TypeScript types for the GitHub integration feature.
 * No token field in SessionBranchState — tokens stay in secrets/auth provider only.
 */

export type PrStatus = 'none' | 'open' | 'merged';
export type BranchCreationStatus = 'pending' | 'creating' | 'ready' | 'failed';
export type SessionHistorySource = 'web' | 'vscode';
export type SessionHistoryAction = 'session-start' | 'file-save';
export type SessionEndReason = 'switch-pipeline' | 'folder-removed' | 'explicit' | 'logout' | 'deactivate';

export interface SessionBranchState {
  sessionId: string;
  pipelineKey: string;
  org: string;
  repoName: string;
  mainBranch: string;
  sessionBranch: string;
  gitUsername: string;
  prStatus: PrStatus;
  prNumber: number | null;
  prUrl?: string;
  lastCommitId: string;
  branchCreationStatus: BranchCreationStatus;
  updatedAt: string;
}

export interface SessionHistoryEntry {
  actor: string;
  source: SessionHistorySource;
  action: SessionHistoryAction;
  message: string;
  filesChanged: string[];
  timestamp?: string;
}

export interface PushFileEntry {
  path: string;
  fileName: string;
  id?: number | string;
  content: string;
}

export interface PushRequest {
  repoName: string;
  branch: string;
  commitMessage: string;
  files: PushFileEntry[];
  sessionHistoryEntry?: SessionHistoryEntry;
}

export interface CreateBranchRequest {
  repoName: string;
  branchName: string;
  sourceBranch?: string;
}

export interface CreateBranchResponse {
  success: boolean;
  branchName: string;
  commitSha: string;
  alreadyExisted: boolean;
}

export interface CreatePullRequestRequest {
  repoName: string;
  title: string;
  body: string;
  sourceBranch: string;
  targetBranch: string;
  reviewers?: string[];
  draft?: boolean;
}

export interface CreatePullRequestResponse {
  pullRequestNumber: number;
  pullRequestUrl: string;
}

export interface SessionBranchPrStatusResponse {
  prStatus: PrStatus;
  pullRequestNumber: number | null;
  pullRequestUrl?: string;
}

export interface GitHubRepository {
  fullName: string;
  htmlUrl: string;
  private: boolean;
  description?: string;
}

export interface GitHubInfoDTO {
  id: number | null;
  cname: string;
  org: string;
  bname: string;
  repo: string;
  gituser: string;
  /** Active session branch — persisted so VS Code and web editor share the same branch. */
  sessionBranch?: string;
  createdby: string;
  createdat: string;
  updatedby: string;
  updatedat: string;
}

export interface GitStatusPayload {
  pipelineId: string;
  linked: boolean;
  repoName?: string;
  mainBranch?: string;
  sessionBranch?: string;
  prStatus?: PrStatus;
  prNumber?: number | null;
  prUrl?: string;
  pendingChanges?: number;
  busy?: boolean;
  error?: string;
}

export interface GitHubAuthStatusPayload {
  signedIn: boolean;
  username?: string;
}
