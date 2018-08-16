/**
 * Follows Basic authentication - Just a username and password
 */
interface GitAuthBasic {
  username: string;
  password: string;
  token?: never;
  oauth2format?: never;
}

/**
 * Follows personal access token authentication
 * @see https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/
 * @see https://confluence.atlassian.com/bitbucket/app-passwords-828781300.html
 * @see https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html
 */
interface GitAuthToken {
  username: string;
  password?: never;
  token: string;
  oauth2format?: never;
}

/**
 * For OAuth2 authentication
 */
interface GitAuthOAuth2 {
  username?: never;
  password?: never;
  token: string;
  oauth2format: 'github' | 'bitbucket' | 'gitlab';
}

export type GitAuth = GitAuthBasic | GitAuthToken | GitAuthOAuth2;

export interface GitInfo {
  repoUrl: string;
  auth: GitAuth;
}
