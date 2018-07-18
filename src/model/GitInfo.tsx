/**
 * Note: At the moment this is pretty much an exact replica of the auth fields from
 * isomorphic-git https://isomorphic-git.github.io/docs/en/push
 */

export interface GitAuth {
  username: string;
  token?: string;
  password?: string;
  oauth2format?: 'github' | 'bitbucket' | 'gitlab';
}

export interface GitInfo {
  repoUrl: string;
  auth: GitAuth;
}
