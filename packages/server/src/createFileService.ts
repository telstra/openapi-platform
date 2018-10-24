import blobService from 'feathers-blob';
import fsBlobStore from 'fs-blob-store';
import { resolve } from 'path';
export function createFileService() {
  const blobStorageModel = fsBlobStore(resolve(__dirname, '../files'));
  return blobService({ Model: blobStorageModel });
}
