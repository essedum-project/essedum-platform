export interface GitHubRepository {
  name: string;
  fullName: string;
  cloneUrl: string;
  htmlUrl: string;
  description: string;
}

export interface AuthStatus {
  authenticated: boolean;
  githubUsername?: string;
  githubToken?: string;
  sessionId: string;
  username?: string;
}

export interface OAuthResponse {
  authorizationUrl: string;
  state: string;
}

export interface PushRequest {
  repoName: string;
  branch: string;
  commitMessage: string;
  files: any;
}

export interface PullRequest {
  repoUrl: string;
  branch: string;
}

export interface BranchToBranchPushRequest {
  repoName: string;
  sourceBranch: string;
  destinationBranch: string;
  commitMessage: string;
  createBranchIfNotExists?: boolean;
  forcePush?: boolean;
}

export interface BranchPushResponse {
  success: boolean;
  message: string;
  repoName: string;
  sourceBranch: string;
  destinationBranch: string;
  commitSha: string;
  filesChanged: number;
  branchCreated: boolean;
}

export interface PullOperationSummary {
  repoName: string;
  repoUrl: string;
  branch: string;
  githubUsername: string;
  requestedAt: string;
  completedAt?: string;
  commitHash?: string;
  filesCount?: number;
  status: 'started' | 'success' | 'failed';
  message?: string;
}

export interface PushOperationSummary {
  repoName: string;
  branch: string;
  githubUsername: string;
  commitMessage: string;
  filesCount: number;
  requestedAt: string;
  completedAt?: string;
  commitSha?: string;
  status: 'started' | 'success' | 'failed';
  message?: string;
}