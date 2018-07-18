import fs from 'mz/fs';
import os from 'os';
import { join } from 'path';

import del from 'del';

export async function makeTempDir(prefix: string) {
  const dir = await fs.mkdtemp(join(os.tmpdir(), prefix));
  return dir;
}

export async function deletePaths(paths) {
  return await del(paths);
}

export async function downloadToDir(sdkDir, remoteSdkPath: string) {}
