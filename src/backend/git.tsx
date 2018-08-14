import oldFs from 'fs';
import { join } from 'path';

import { move } from 'fs-extra';
import git from 'isomorphic-git';
import AdmZip from 'adm-zip';

import { downloadToPath, deletePaths, makeTempDir } from 'backend/file/index';
import { GitInfo } from 'model/GitInfo';

// Note: dir = directory

async function makeTempRepoDir() {
  return await makeTempDir('repo');
}
// Note: To knowledge, it's not necessary to have different prefixes for repo and sdk folders
async function makeTempSdkDir() {
  return await makeTempDir('sdk');
}

async function makeTempDownloadDir() {
  return await makeTempDir('download');
}

export async function moveFilesIntoLocalRepo(repoDir, sdkDir) {
  await move(repoDir, sdkDir, { overwrite: true });
}

async function deleteAllFilesInLocalRepo(dir) {
  const filePaths = await git.listFiles({ fs: oldFs, dir });
  const fullFilePaths = filePaths.map(path => join(dir, path));
  await deletePaths(fullFilePaths);
}

/**
 * SDKs are downloaded as a zip file so they need to be extracted.
 * Use this method to do so.
 * @param archiveFilePath
 * The archive file path
 * @param extractToDir 
 * Where you want the archive files to be extracted to
 */
async function extractSdkArchiveFileToDir(archiveFilePath: string, extractToDir: string) {
  const zip = new AdmZip(archiveFilePath);
  zip.extractAllTo(extractToDir, true);
}

/**
 * Tries to put the files of a remotely stored sdk ZIP file into a locally stored
 * repository.
 */
export async function migrateSdkIntoLocalRepo(repoDir, remoteSdkPath: string) {
  await deleteAllFilesInLocalRepo(repoDir);
  /*
   * We make folders for each step of the process,
   * one for downloading, one for unzipping.
   */
  const downloadDir = await makeTempDownloadDir();
  const sdkArchiveFilePath = join(downloadDir, 'sdk.zip');
  await downloadToPath(sdkArchiveFilePath, remoteSdkPath);
  try {
    const sdkDir = await makeTempSdkDir();
    try {
      await extractSdkArchiveFileToDir(sdkArchiveFilePath, sdkDir);
      await moveFilesIntoLocalRepo(repoDir, sdkDir);
    } catch(err) {
      throw err;
    } finally {
      await deletePaths([sdkDir]);
    }
  } catch(err) {
    throw err
  } finally {
      /*
       * TODO: Confirm if this is necessary, 
       * do temp folders ever get deleted if they aren't explicitly told to be deleted?
       */
      await deletePaths([downloadDir]);
  }
}

export async function updateRepoWithNewSdk(gitInfo: GitInfo, localSdkPath: string) {
  const repoDir = await makeTempRepoDir();
  try {
    /*
      TODO: This isn't great. We clone the repo everytime we generate an SDK.
      Preferably, we'd only do it once or have some kind of cache for repos we've already cloned.
      Would have to probably git reset --hard HEAD~ or something before adding the SDK to the cloned repo
      just to make sure there aren't any stray files lying around in the cached repo.
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
      // TODO: Could have a better message
      message: 'Updated SDK',
    });
    await git.push({
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
