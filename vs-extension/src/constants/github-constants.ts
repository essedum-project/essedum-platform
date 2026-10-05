/**
 * GitHub Integration Constants
 */

export const GITHUB = {
  AUTH_PROVIDER_ID: 'github',
  AUTH_SCOPES: ['repo', 'read:user'],
  AUTO_PUSH_DEBOUNCE_MS: 1500,
  PR_POLL_INTERVAL_MS: 60000,
  MAX_PUSH_PAYLOAD_BYTES: 25 * 1024 * 1024,
  SESSION_BRANCH_PREFIX: 'session',
} as const;

export const GITHUB_STORAGE_KEYS = {
  PAT:                        'essedum.github.pat',
  SESSION_ID:                 'essedum.git.sessionId',
  SESSION_BRANCH_STATE_PREFIX:'essedum.sessionBranchState',
  LAST_REPO:                  'essedum.git.lastRepo',
  LAST_BRANCH:                'essedum.git.lastBranch',
  LAST_GIT_USERNAME:          'essedum.git.lastUsername',
} as const;

export const GITHUB_HEADERS = {
  GITHUB_TOKEN: 'X-GitHub-Token',
} as const;

export const SESSION_HISTORY_ACTIONS = {
  SESSION_START: 'session-start',
  FILE_SAVE:     'file-save',
} as const;

export const GITHUB_COMMANDS = {
  SIGN_IN:              'essedum.github.signIn',
  SIGN_OUT:             'essedum.github.signOut',
  CLONE_REPOSITORY:     'essedum.github.cloneRepository',
  LINK_REPOSITORY:      'essedum.github.linkRepository',
  COMMIT_AND_PUSH:      'essedum.github.commitAndPush',
  RAISE_PULL_REQUEST:   'essedum.github.raisePullRequest',
  OPEN_PULL_REQUEST:    'essedum.github.openPullRequest',
  REFRESH_PR_STATUS:    'essedum.github.refreshPrStatus',
  END_SESSION:          'essedum.github.endSession',
  SHOW_SESSION_ACTIONS: 'essedum.github.showSessionActions',
} as const;

export const GITHUB_CONTEXT_KEYS = {
  SIGNED_IN:              'essedum.githubSignedIn',
  SESSION_BRANCH_ACTIVE:  'essedum.sessionBranchActive',
  PR_OPEN:                'essedum.prOpen',
  HAS_UNPUSHED_CHANGES:   'essedum.hasUnpushedChanges',
} as const;
