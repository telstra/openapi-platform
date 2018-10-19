import os from 'os';
import { join } from 'path';

import AdmZip from 'adm-zip';
import del from 'del';
import fs from 'mz/fs';
import fetch from 'node-fetch';

export async function makeTempDir(prefix: string) {
  const dir = await fs.mkdtemp(join(os.tmpdir(), 'openapi-platform-' + prefix));
  return dir;
}

export async function deletePaths(paths) {
  return await del(paths, { force: true });
}

/**
 * Downloads a file and writes it to a particular path
 * @param localPath Where you want to download the file to
 * @param remotePath The place you want to download the file from
 */
export async function downloadToPath(localPath: string, remotePath: string) {
  const response = await fetch(remotePath);

  const stream = fs.createWriteStream(localPath);

  // Pipes the response to a file, wrapped a promise so we can use await
  response.body.pipe(stream);
  const writeToFilePromise = new Promise((resolve, reject) => {
    response.body.on('error', err => {
      stream.destroy();
      reject(err);
    });
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  await writeToFilePromise;
}

/**
 * SDKs are downloaded as a zip file so they need to be extracted.
 * Use this method to do so.
 * @param archiveFilePath The archive file path
 * @param extractToDir Where you want the archive files to be extracted to
 */
export async function extractSdkArchiveFileToDir(
  extractToDir: string,
  archiveFilePath: string,
) {
  const zip = new AdmZip(archiveFilePath);
  await zip.extractAllTo(extractToDir, true);
}
