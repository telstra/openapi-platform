import oldFs from 'fs';
import { join, relative } from 'path';

import AdmZip from 'adm-zip';
import { move } from 'fs-extra';
import globby from 'globby';
import { listFiles } from 'isomorphic-git';

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
 * SDKs are downloaded as a zip file so they need to be extracted.
 * Use this method to do so.
 * @param archiveFilePath The archive file path
 * @param extractToDir Where you want the archive files to be extracted to
 */
async function extractSdkArchiveFileToDir(extractToDir: string, archiveFilePath: string) {
  const zip = new AdmZip(archiveFilePath);
  await zip.extractAllTo(extractToDir, true);
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
