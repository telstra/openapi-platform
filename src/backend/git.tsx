import oldFs from 'fs';
import { join } from 'path';

import git from 'isomorphic-git';

import { downloadToDir, deletePaths, makeTempDir } from 'backend/file/index';
import { GitInfo } from 'model/GitInfo';

// Note: dir = directory

async function makeTempRepoDir() {
  return await makeTempDir('repo');
}
// Note: To knowledge, it's not necessary to have different prefixes for repo and sdk folders
async function makeTempSdkDir() {
  return await makeTempDir('sdk');
}

async function moveFilesIntoLocalRepo(repoDir, sdkDir) {}

async function deleteAllFilesInLocalRepo(dir) {
  const filePaths = await git.listFiles({ fs: oldFs, dir });
  const fullFilePaths = filePaths.map(path => join(dir, path));
  await deletePaths(fullFilePaths);
}

export async function migrateSdkIntoLocalRepo(repoDir, remoteSdkPath: string) {
  // TODO: Maybe we should allow pushing to a specific folder?
  await deleteAllFilesInLocalRepo(repoDir);
  const sdkDir = await makeTempSdkDir();
  await downloadToDir(sdkDir, remoteSdkPath);
  await moveFilesIntoLocalRepo(repoDir, sdkDir);
  await deletePaths([sdkDir]);
}

export async function updateRepoWithNewSdk(gitInfo: GitInfo, localSdkPath: string) {
  const repoDir = await makeTempRepoDir();
  /*
    TODO: This isn't great. We clone the repo everytime we generate an SDK.
    Preferably, we'd only do it once or have some kind of cache for repos we've already cloned.
    Would have to probably git reset --hard HEAD~ before adding the SDK to the cloned repo.
  */
  // TODO: Should also be able to configure which branch to checkout, maybe?
  await git.clone({
    dir: repoDir,
    // Could use mz/fs but I don't trust it guarentees compatibility with isomorphic git
    fs: oldFs,
    url: gitInfo.repoUrl,
    singleBranch: true,
    depth: 1,
    ...gitInfo.auth,
  });
  await migrateSdkIntoLocalRepo(repoDir, localSdkPath);
  // TODO: Got a lot of "oldFs: fs", maybe make some sort of wrapper to avoid this?
  await git.add({
    fs: oldFs,
    dir: repoDir,
    filepath: '*',
  });
  await git.commit({
    fs: oldFs,
    dir: repoDir,
    // TODO: This should be configurable
    author: {
      name: 'Swagger Platform',
    },
    message: 'TODO: Variable message',
  });
  await git.push({
    fs: oldFs,
    dir: repoDir,
    ...gitInfo.auth,
  });
  await deletePaths([repoDir]);
}
