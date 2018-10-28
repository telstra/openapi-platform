import { streamToPromise } from '@openapi-platform/file-util';
import sequelize from 'feathers-sequelize';
import fsBlobStore from 'fs-blob-store';
import { resolve } from 'path';
import Sequelize from 'sequelize';
export function createBlobStore() {
  const store = fsBlobStore(resolve(__dirname, '../../files'));
  return store;
}

/**
 * Creates a Sequelize database model for storing a file.
 *
 * @param dbConnection The Sequelize connection to create the model for.
 * @returns The created Sequelize model.
 */
export function createBlobMetadataModel(dbConnection: Sequelize.Sequelize) {
  return dbConnection.define(
    'blob_metadata',
    {
      // Name of the file
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      // E.g. application/json
      contentType: {
        type: Sequelize.STRING,
      },
    },
    {
      freezeTableName: true,
    },
  );
}

export function createBlobMetadataService(blobMetadataModel) {
  return sequelize({
    Model: blobMetadataModel,
  });
}

/**
 * Creates a Feathers service to access file, using the given database model.
 * This is meant for internal use
 * @param sdkModel The database model representing an SDK.
 * @returns The created Feathers service.
 */
export function createBlobService(blobMetadataServiceName, blobStore) {
  let app: any;
  return {
    async setup(application, path) {
      app = application;
    },
    async find(params) {
      throw new Error('Not implemented');
    },
    async get(id, params) {
      const metadata = await app.service(blobMetadataServiceName).get(id);
      const stream = blobStore.createReadStream({
        key: id.toString(),
      });
      return {
        metadata,
        stream,
      };
    },
    async create(data, params) {
      const stream = data.stream;
      if (stream === undefined || stream == null) {
        throw new Error(`Stream was ${stream}`);
      }
      const contentType = data.metadata.contentType;
      if (contentType === undefined || contentType === null) {
        throw new Error(`contentType cannot be ${contentType}`);
      }
      const metadata = await app.service('blobMetadataServiceName').create(data.metadata);
      const writeStream = blobStore.createWriteStream({
        key: metadata.id.toString(),
      });
      stream.pipe(writeStream);
      await streamToPromise(writeStream);
      return {
        metadata,
        stream: writeStream,
      };
    },
    async update(id, data, params) {
      throw new Error('Not implemented');
    },
    async patch(id, data, params) {
      throw new Error('Not implemented');
    },
    async remove(id, params) {
      const result = await app.service('blobMetadataServiceName').remove({
        where: {
          id,
        },
      });
      blobStore.remove(id);
      return result;
    },
  };
}
