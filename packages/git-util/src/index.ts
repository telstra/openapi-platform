import oldFs from 'fs';
import { relative, join } from 'path';

import { move } from 'fs-extra';
import globby from 'globby';
import { clone, push, add, remove, listFiles, commit } from 'isomorphic-git';

import {
  deletePaths,
  makeTempDir,
  downloadToPath,
  extractSdkArchiveFileToDir,
} from '@openapi-platform/file-util';
import { GitInfo } from '@openapi-platform/model';

import { HookOptions, schema } from '@openapi-platform/hooks';

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

async function deleteAllFilesInLocalRepo(repoDir) {
  const filePaths = await listFiles({ fs: oldFs, dir: repoDir });
  for (const filePath of filePaths) {
    remove({ filepath: filePath, fs: oldFs, dir: repoDir });
  }
  const fullFilePaths = filePaths.map(path => join(repoDir, path));
  await deletePaths(fullFilePaths);
  return filePaths;
}

export const gitHookSchema = {
  stage: null,
  push: null,
  commit: null,
  clone: null,
  downloadSdk: null,
  moveSdkFilesToRepo: null,
  cleanRepo: null,
  extractSdk: null,
};

export interface Options {
  hooks?: HookOptions<typeof gitHookSchema>;
}

const withDefaults = schema(gitHookSchema);
/**
 * Tries to put the files of a remotely stored sdk ZIP file into a locally stored
 * repository.
 */
export async function migrateSdkIntoLocalRepo(
  repoDir: string,
  remoteSdkUrl: string,
  options: Options = {},
  context: any = {},
) {
  const hooks = withDefaults(options.hooks);
  options.hooks = hooks;

  context.remoteSdkUrl = remoteSdkUrl;
  context.repoDir = repoDir;
  await hooks.before.cleanRepo(context);
  const deletedPaths = await deleteAllFilesInLocalRepo(context.repoDir);
  context.deletedPaths = deletedPaths;
  await hooks.after.cleanRepo(deletedPaths);

  /*
   * We make folders for each step of the process,
   * one for downloading, one for unzipping.
   */
  context.downloadDir = await makeTempDir('download');
  context.sdkArchivePath = join(context.downloadDir, 'sdk.zip');
  try {
    await hooks.before.downloadSdk(context);
    await downloadToPath(context.sdkArchivePath, remoteSdkUrl);
    await hooks.after.downloadSdk(context);

    context.sdkDir = await makeTempDir('sdk');
    try {
      await hooks.before.extractSdk(context);
      await extractSdkArchiveFileToDir(context.sdkDir, context.sdkArchivePath);
      await hooks.after.extractSdk(context);

      await hooks.before.moveSdkFilesToRepo(context);
      await moveFilesIntoLocalRepo(context.repoDir, context.sdkDir);
      await hooks.after.moveSdkFilesToRepo(context);
    } catch (err) {
      throw err;
    } finally {
      await deletePaths([context.sdkDir]);
    }
  } catch (err) {
    throw err;
  } finally {
    await deletePaths([context.downloadDir]);
  }
}

export async function updateRepoWithNewSdk(
  gitInfo: GitInfo,
  remoteSdkUrl: string,
  options: Options = {},
) {
  const context: any = {};

  const hooks = withDefaults(options.hooks);
  options.hooks = hooks;

  context.gitInfo = gitInfo;
  context.remoteSdkUrl = remoteSdkUrl;
  context.repoDir = await makeTempDir('repo');
  try {
    /*
      TODO: This isn't great. We clone the repo everytime we generate an SDK.
      Preferably, we'd only do it once or have some kind of cache for repos we've already cloned.
      Would have to probably git reset --hard HEAD~ or something before adding the SDK to the cloned repo
      just to make sure there aren't any stray unstaged files lying around in the cached repo.
    */
    await hooks.before.clone(context);
    await clone({
      ref: gitInfo.branch,
      dir: context.repoDir,
      // Could use mz/fs but I don't trust it guarentees compatibility with isomorphic git
      fs: oldFs,
      url: gitInfo.repoUrl,
      singleBranch: true,
      ...gitInfo.auth,
    });
    await hooks.after.clone(context);

    await migrateSdkIntoLocalRepo(context.repoDir, remoteSdkUrl, options, context);

    context.stagedPaths = await getAllStageableFilepathsInRepo(context.repoDir);
    await hooks.before.stage(context);
    for (const addedPath of context.stagedPaths) {
      const relativeFilePath = relative(context.repoDir, addedPath);
      // TODO: Got a lot of "oldFs: fs", maybe make some sort of wrapper to avoid this?
      await add({
        fs: oldFs,
        dir: context.repoDir,
        filepath: relativeFilePath,
      });
    }
    await hooks.after.stage(context);

    await hooks.before.commit(context);
    await commit({
      fs: oldFs,
      dir: context.repoDir,
      // TODO: This should be configurable
      author: {
        name: 'Swagger Platform',
        email: 'N/A',
      },
      // TODO: Could have a better message
      message: 'Updated SDK',
    });
    await hooks.after.commit(context);

    await hooks.before.push(context);
    await push({
      fs: oldFs,
      dir: context.repoDir,
      ...gitInfo.auth,
    });
    await hooks.after.push(context);
  } catch (err) {
    throw err;
  } finally {
    await deletePaths([context.repoDir]);
  }
}
