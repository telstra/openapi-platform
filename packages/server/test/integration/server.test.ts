import { SdkConfig, BuildStatus } from '@openapi-platform/model';
import { Spec } from '@openapi-platform/model';
import { createServer } from '../../src/createServer';
jest.mock('@openapi-platform/config');
jest.mock('@openapi-platform/logger');

jest.mock('sequelize');
jest.mock('feathers-sequelize');
jest.mock('../../src/db/connection');

jest.mock('@openapi-platform/openapi-sdk-gen-client');
/*
  Have to use require syntax as es6 imports currently makes TypeScript
  complain about missing mockImplementation, etc.
  TODO: Might be fixed in TypeScript 3? Go check
*/
// tslint:disable:no-var-requires
const sdkGeneration: any = require('@openapi-platform/openapi-sdk-gen-client');

/*
 * Test services are registered and any hooks.
 */
describe('test server', () => {
  let app;
  beforeEach(async () => {
    app = await createServer();
  });

  it('app is defined', () => {
    expect(app).not.toBeUndefined();
  });

  describe('test specification service', () => {
    it('specification service registered', () => {
      const s = app.service('specifications');
      expect(s).toEqual(expect.anything());
    });
  });

  describe('test SDK configuration service', () => {
    let createdSpecId: number;
    let sdkConfigData: SdkConfig;
    const specData: Spec = {
      title: 'title',
      description: 'desc',
      path: 'path',
    };
    beforeEach(async () => {
      // Need a spec to add SDK configurations to.
      const createdSpec = await app.service('specifications').create(specData);
      createdSpecId = createdSpec.id;
      sdkConfigData = {
        specId: createdSpecId,
        target: 'java is ew',
        version: 'v1.0.0',
        options: { 'a choice': 'my options here' },
        buildStatus: BuildStatus.Success,
      };
    });

    it('SDK configuration service registered', () => {
      const s = app.service('sdkConfigs');
      expect(s).toEqual(expect.anything());
    });

    it('SDK configuration created', async () => {
      const createdSdkConfig = await app.service('sdkConfigs').create(sdkConfigData);
      const retrievedSdkConfig = await app.service('sdkConfigs').get(createdSdkConfig.id);
      const basicFields = ['specId', 'target', 'version', 'buildStatus'];
      // Compare the objects, need to do it this way because objects are stored as strings.
      basicFields.forEach(key => {
        expect(sdkConfigData[key]).toBe(createdSdkConfig[key]);
        expect(sdkConfigData[key]).toBe(retrievedSdkConfig[key]);
      });
      expect(sdkConfigData.options).toEqual(createdSdkConfig.options);
    });

    it('SDK configuration created hook sets buildStatus to BuildStatus.NotRun', async () => {
      const { buildStatus, ...sdkConfigDataWithoutBuildStatus } = sdkConfigData;
      const createdSdkConfig = await app
        .service('sdkConfigs')
        .create(sdkConfigDataWithoutBuildStatus);
      const bs = (await app.service('sdkConfigs').get(createdSdkConfig.id)).buildStatus;
      expect(bs).toEqual(BuildStatus.NotRun);
    });
  });

  describe('test sdks service', () => {
    it('sdks service registered', () => {
      const s = app.service('sdks');
      expect(s).toEqual(expect.anything());
    });

    describe('test creating/generating sdks', () => {
      // A specification and SDK configuration need to be created before an SDK can be.
      // TODO: Should there be a model for SDK?

      it('create an sdk success', async () => {
        const specData: Spec = {
          title: 'Dummy specification title',
          description: 'A description of my specification',
          path:
            'this fake path will actually lead to an error but that is ok since we are mocking it',
        };
        const createdSpec = await app.service('specifications').create(specData);

        const sdkConfigData: SdkConfig = {
          specId: createdSpec.id,
          target: 'Kewl kids use Haskell',
          version: 'v1.1.1',
          buildStatus: BuildStatus.NotRun,
          options: {
            additionalProp1: 'string',
            additionalProp2: 'string',
          },
        };
        const createdSdkConfig = await app.service('sdkConfigs').create(sdkConfigData);

        const sdkData = { sdkConfigId: createdSdkConfig.id };

        const expectedGenerationResponse = {
          sdkConfigId: 1,
          path: 'base-url-here/download/unique-download-hash-here',
        };

        // Mock the response of generateSdk to be successful.
        sdkGeneration.generateSdk.mockImplementation(async () => {
          return expectedGenerationResponse;
        });

        const createdSdk = await app.service('sdks').create(sdkData);

        expect(sdkGeneration.generateSdk).toHaveBeenCalledTimes(1);
        // SDK created for the right SDK configuration.
        expect(createdSdk.sdkConfigId).toBe(createdSdkConfig.id);
        // SDK created & stored in memory.
        const retrievedSdk = await app.service('sdks').get(createdSdk.id);
        // Check return link, it is called path in the sdk model.

        expect(createdSdk.id).toBe(retrievedSdk.id);

        //TODO: Need to check if the sdk path is set in the after hook
        //expect(createdSdk.path).toBe(expectedGenerationResponse.path);
        //expect(createdSdk.path).toBe(retrievedSdk.path);
      });

      it('create an sdk error, bad options', async () => {
        const specData: Spec = {
          title: 'Dummy specification title',
          description: 'A description of my specification',
          path:
            'this fake path will actually lead to an error but that is ok since we are mocking it',
        };
        const createdSpec = await app.service('specifications').create(specData);

        const sdkConfigData: SdkConfig = {
          specId: createdSpec.id,
          target: 'Kewl kids use Haskell',
          version: 'v1.1.1',
          options: 'options should be an object and not a string',
          buildStatus: BuildStatus.NotRun,
        };

        const createdSdkConfig = await app.service('sdkConfigs').create(sdkConfigData);

        const sdkData = { sdkConfigId: createdSdkConfig.id };

        sdkGeneration.generateSdk.mockImplementation(async () => {
          const swaggerCodegenMalformedOptionsResponse = {
            code: 500,
            type: 'unknown',
            message: 'something bad happened',
          };
          throw new Error(swaggerCodegenMalformedOptionsResponse.message);
        });

        const sdk = await app.service('sdks').create(sdkData);
        expect(sdk.buildStatus).toEqual(BuildStatus.Fail);
        // TODO: Need to check if the after hook sets the build status to FAIL
      });

      it('create an sdk error, invalid path', async () => {
        const specData: Spec = {
          title: 'Dummy specification title',
          description: 'A description of my specification',
          path: 'this fake path will lead to an error this time yay',
        };
        const createdSpec = await app.service('specifications').create(specData);

        const sdkConfigData: SdkConfig = {
          specId: createdSpec.id,
          target: 'Kewl kids use Haskell',
          version: 'v1.1.1',
          buildStatus: BuildStatus.NotRun,
          options: {},
        };

        const createdSdkConfig = await app.service('sdkConfigs').create(sdkConfigData);

        const sdkData = { sdkConfigId: createdSdkConfig.id };
        sdkGeneration.generateSdk.mockImplementation(async () => {
          const swaggerCodegenInvalidSpecificationResponse = {
            code: 1,
            type: 'error',
            message: 'The swagger specification supplied was not valid',
          };
          throw new Error(swaggerCodegenInvalidSpecificationResponse.message);
        });

        const sdk = await app.service('sdks').create(sdkData);
        expect(sdk.buildStatus).toEqual(BuildStatus.Fail);
      });
    });
  });
});
