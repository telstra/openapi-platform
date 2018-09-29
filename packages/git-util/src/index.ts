import oldFs from 'fs';
import { relative } from 'path';

import { clone, push, add, commit } from 'isomorphic-git';

import {
  getAllStageableFilepathsInRepo,
  migrateSdkIntoLocalRepo,
} from '@openapi-platform/download-util';
import { deletePaths, makeTempDir } from '@openapi-platform/download-util/lib/file';
import { GitInfo } from '@openapi-platform/model';

export async function updateRepoWithNewSdk(
  gitInfo: GitInfo,
  remoteSdkUrl: string,
  options,
  fileCleaningGlobs = [],
) {
  // TODO: Rather than taking a logger, just provide callbacks
  const { logger } = options;
  const repoDir = await makeTempDir('repo');
  try {
    /*
      TODO: This isn't great. We clone the repo everytime we generate an SDK.
      Preferably, we'd only do it once or have some kind of cache for repos we've already cloned.
      Would have to probably git reset --hard HEAD~ or something before adding the SDK to the cloned repo
      just to make sure there aren't any stray files lying around in the cached repo.
    */
    // TODO: Should also be able to configure which branch to checkout, maybe?
    logger.verbose(`Cloning ${remoteSdkUrl} into ${repoDir}`);
    await clone({
      ref: gitInfo.branch,
      dir: repoDir,
      // Could use mz/fs but I don't trust it guarentees compatibility with isomorphic git
      fs: oldFs,
      url: gitInfo.repoUrl,
      singleBranch: true,
      depth: 1,
      ...gitInfo.auth,
    });

    await migrateSdkIntoLocalRepo(repoDir, remoteSdkUrl, fileCleaningGlobs, options);
    const addedPaths = await getAllStageableFilepathsInRepo(repoDir);
    logger.verbose(`Staging ${addedPaths.length} paths`);
    for (const addedPath of addedPaths) {
      const relativeFilePath = relative(repoDir, addedPath);
      // TODO: Got a lot of "oldFs: fs", maybe make some sort of wrapper to avoid this?
      await add({
        fs: oldFs,
        dir: repoDir,
        filepath: relativeFilePath,
      });
    }
    logger.verbose(`Committing changes...`);
    await commit({
      fs: oldFs,
      dir: repoDir,
      // TODO: This should be configurable
      author: {
        name: 'Swagger Platform',
        email: 'N/A',
      },
      // TODO: Could have a better message
      message: 'Updated SDK',
    });

    logger.verbose(`Pushing commits...`);
    await push({
      fs: oldFs,
      dir: repoDir,
      ...gitInfo.auth,
    });
  } catch (err) {
    throw err;
  } finally {
    await deletePaths([repoDir]);
  }
}
