export interface GitHubRepository {
  name: string;
  fullName: string;
  cloneUrl: string;
  htmlUrl: string;
  description: string;
}

export interface AuthStatus {
  authenticated: boolean;
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
  localPath: string;
}