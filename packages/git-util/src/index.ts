import oldFs from 'fs';
import { join, relative } from 'path';

import AdmZip from 'adm-zip';
import { move } from 'fs-extra';
import globby from 'globby';
import { clone, push, add, listFiles, commit } from 'isomorphic-git';

import { GitInfo } from '@openapi-platform/model';
import { downloadToPath, deletePaths, makeTempDir } from './file/index';

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
  // Unfortunately you have to move each file individual (to knowledge)
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
  return filePaths;
}

/**
 * SDKs are downloaded as a zip file so they need to be extracted.
 * Use this method to do so.
 * @param archiveFilePath The archive file path
 * @param extractToDir Where you want the archive files to be extracted to
 */
async function extractSdkArchiveFileToDir(extractToDir: string, archiveFilePath: string) {
  const zip = new AdmZip(archiveFilePath);
  await zip.extractAllTo(extractToDir, true);
}
type HookCallback<P = any | undefined, T = any> = (input: P) => Promise<T>;
interface Hook<B = any, BR = any, A = any, AR = any> {
  before: HookCallback<B, BR>;
  after: HookCallback<A, AR>;
}

type HookKeys =
  | 'stage'
  | 'push'
  | 'commit'
  | 'clone'
  | 'downloadSdk'
  | 'moveSdkFilesToRepo'
  | 'cleanRepo'
  | 'extractSdk';
const hookKeys = [
  'stage',
  'push',
  'commit',
  'clone',
  'downloadSdk',
  'moveSdkFilesToRepo',
  'cleanRepo',
  'extractSdk',
];
type HookOptions = { [key in HookKeys]?: Partial<Hook> };

type Hooks = { [key in HookKeys]: Hook };

interface Options {
  hooks?: HookOptions;
}

function defaultHook(): HookCallback {
  return async () => {};
}

/**
 * This lets us avoid having to do undefined checks everywhere
 */
function withDefaultHooks(hooks: HookOptions = {}): Hooks {
  return hookKeys.reduce((obj, key) => {
    const { before = defaultHook(), after = defaultHook() }: Hook = hooks[key]
      ? hooks[key]
      : {};
    obj[key] = {
      before,
      after,
    };
    return obj;
  }, {}) as Hooks;
}

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
  const hooks = withDefaultHooks(options.hooks);
  options.hooks = hooks;

  context.remoteSdkUrl = remoteSdkUrl;
  context.repoDir = repoDir;

  await hooks.cleanRepo.before(context);
  const deletedPaths = await deleteAllFilesInLocalRepo(context.repoDir);
  context.deletedPaths = deletedPaths;
  await hooks.cleanRepo.after(deletedPaths);

  /*
   * We make folders for each step of the process,
   * one for downloading, one for unzipping.
   */
  context.downloadDir = await makeTempDir('download');
  context.sdkArchivePath = join(context.downloadDir, 'sdk.zip');
  try {
    await hooks.downloadSdk.before(context);
    await downloadToPath(context.sdkArchivePath, remoteSdkUrl);
    await hooks.downloadSdk.after(context);

    context.sdkDir = await makeTempDir('sdk');
    try {
      await hooks.extractSdk.before(context);
      await extractSdkArchiveFileToDir(context.sdkDir, context.sdkArchivePath);
      await hooks.extractSdk.after(context);

      await hooks.moveSdkFilesToRepo.before(context);
      await moveFilesIntoLocalRepo(context.repoDir, context.sdkDir);
      await hooks.moveSdkFilesToRepo.after(context);
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

  const hooks = withDefaultHooks(options.hooks);
  options.hooks = hooks;

  context.repoDir = await makeTempDir('repo');
  try {
    /*
      TODO: This isn't great. We clone the repo everytime we generate an SDK.
      Preferably, we'd only do it once or have some kind of cache for repos we've already cloned.
      Would have to probably git reset --hard HEAD~ or something before adding the SDK to the cloned repo
      just to make sure there aren't any stray files lying around in the cached repo.
    */
    await hooks.clone.before(context);
    await clone({
      ref: gitInfo.branch,
      dir: context.repoDir,
      // Could use mz/fs but I don't trust it guarentees compatibility with isomorphic git
      fs: oldFs,
      url: gitInfo.repoUrl,
      singleBranch: true,
      depth: 1,
      ...gitInfo.auth,
    });
    await hooks.clone.after(context);

    await migrateSdkIntoLocalRepo(context.repoDir, remoteSdkUrl, options, context);

    context.stagedPaths = await getAllStageableFilepathsInRepo(context.repoDir);
    await hooks.stage.before(context);
    for (const addedPath of context.stagedPaths) {
      const relativeFilePath = relative(context.repoDir, addedPath);
      // TODO: Got a lot of "oldFs: fs", maybe make some sort of wrapper to avoid this?
      await add({
        fs: oldFs,
        dir: context.repoDir,
        filepath: relativeFilePath,
      });
    }
    await hooks.stage.after(context);

    await hooks.commit.before(context);
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
    await hooks.commit.after(context);

    await hooks.push.before(context);
    await push({
      fs: oldFs,
      dir: context.repoDir,
      ...gitInfo.auth,
    });
    await hooks.push.after(context);
  } catch (err) {
    throw err;
  } finally {
    await deletePaths([context.repoDir]);
  }
}
