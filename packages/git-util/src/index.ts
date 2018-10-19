import oldFs from 'fs';
import { relative, join } from 'path';

import { clone, push, add, commit } from 'isomorphic-git';

import { move } from 'fs-extra';
import globby from 'globby';
import { listFiles } from 'isomorphic-git';

import {
  deletePaths,
  makeTempDir,
  downloadToPath,
  extractSdkArchiveFileToDir,
} from '@openapi-platform/file-util';
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

// Note: dir = directory

export async function getAllStageableFilepathsInRepo(repoDir: string) {
  return await globby([join(repoDir, '**'), join(repoDir, '**', '.*')], {
    gitignore: true,
  });
}

export async function getAllFilepathsInDir(dir: string) {
  return await globby([join(dir, '**'), join(dir, '**', '.*')]);
}

export async function moveFilesIntoLocalRepo(repoDir, sdkDir) {
  // Unfortunately you have to move each file individualy (to knowledge)
  const paths = await getAllFilepathsInDir(sdkDir);
  for (const path of paths) {
    const fromPath = path;
    const relativePath = relative(sdkDir, path);
    const toPath = join(repoDir, relativePath);
    await move(fromPath, toPath, { overwrite: true });
  }
}

async function deleteAllFilesInLocalRepo(dir) {
  const filePaths = await listFiles({ fs: oldFs, dir });
  const fullFilePaths = filePaths.map(path => join(dir, path));
  await deletePaths(fullFilePaths);
}

/**
 * Tries to put the files of a remotely stored sdk ZIP file into a locally stored
 * repository.
 */
export async function migrateSdkIntoLocalRepo(
  repoDir: string,
  remoteSdkUrl: string,
  fileCleaningGlobs: string[],
  options,
) {
  const { logger } = options;
  logger.verbose(`Deleting all files ${repoDir}`);
  await deleteAllFilesInLocalRepo(repoDir);
  /*
   * We make folders for each step of the process,
   * one for downloading, one for unzipping.
   */
  const downloadDir = await makeTempDir('download');
  try {
    const sdkArchiveFilePath = join(downloadDir, 'sdk.zip');
    await downloadToPath(sdkArchiveFilePath, remoteSdkUrl);
    const sdkDir = await makeTempDir('sdk');
    try {
      logger.verbose(`Extracting ${sdkArchiveFilePath} to ${sdkDir}`);
      await extractSdkArchiveFileToDir(sdkDir, sdkArchiveFilePath);

      for (let glob of fileCleaningGlobs) {
        glob = join(sdkDir, glob);
      }
      logger.verbose(
        `Deleting files from ${sdkDir} which match globs: ${fileCleaningGlobs}`,
      );
      await deletePaths(fileCleaningGlobs);

      logger.verbose(`Moving files from ${sdkDir} to ${repoDir}`);
      await moveFilesIntoLocalRepo(repoDir, sdkDir);
    } catch (err) {
      throw err;
    } finally {
      await deletePaths([sdkDir]);
    }
  } catch (err) {
    throw err;
  } finally {
    await deletePaths([downloadDir]);
  }
}
