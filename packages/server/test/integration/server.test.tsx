import { Plan, BuildStatus } from '@openapi-platform/model';
import { Spec } from '@openapi-platform/model';
import { createServer } from '../../src/createServer';
jest.mock('../../src/config/readConfig');
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

  describe('test plans service', () => {
    let createdSpecId: number;
    let planData: Plan;
    const specData: Spec = {
      title: 'title',
      description: 'desc',
      path: 'path',
    };
    beforeEach(async () => {
      // Need a spec to add plans to.
      const createdSpec = await app.service('specifications').create(specData);
      createdSpecId = createdSpec.id;
      planData = {
        specId: createdSpecId,
        target: 'java is ew',
        version: 'v1.0.0',
        options: { 'a choice': 'my options here' },
        buildStatus: BuildStatus.Success,
      };
    });

    it('plans service registered', () => {
      const s = app.service('plans');
      expect(s).toEqual(expect.anything());
    });

    it('plan created', async () => {
      const createdPlan = await app.service('plans').create(planData);
      const retrievedPlan = await app.service('plans').get(createdPlan.id);
      const basicFields = ['specId', 'target', 'version', 'buildStatus'];
      // Compare the objects, need to do it this way because objects are stored as strings.
      basicFields.forEach(key => {
        expect(planData[key]).toBe(createdPlan[key]);
        expect(planData[key]).toBe(retrievedPlan[key]);
      });
      expect(planData.options).toEqual(createdPlan.options);
    });

    it('plan created hook sets buildStatus to BuildStatus.NotRun', async () => {
      const { buildStatus, ...planDataWithoutBuildStatus } = planData;
      const createdPlan = await app.service('plans').create(planDataWithoutBuildStatus);
      const bs = (await app.service('plans').get(createdPlan.id)).buildStatus;
      expect(bs).toEqual(BuildStatus.NotRun);
    });
  });

  describe('test sdks service', () => {
    it('sdks service registered', () => {
      const s = app.service('sdks');
      expect(s).toEqual(expect.anything());
    });

    describe('test creating/generating sdks', () => {
      // A spec and plan need to be created before a SDK can be.
      // TODO: Should there be a model for SDK?

      it('create a sdk success', async () => {
        const specData: Spec = {
          title: 'Dummy specification title',
          description: 'A description of my specification',
          path:
            'this fake path will actually lead to an error but that is ok since we are mocking it',
        };
        const createdSpec = await app.service('specifications').create(specData);

        const planData: Plan = {
          specId: createdSpec.id,
          target: 'Kewl kids use Haskell',
          version: 'v1.1.1',
          buildStatus: BuildStatus.NotRun,
          options: {
            additionalProp1: 'string',
            additionalProp2: 'string',
          },
        };
        const createdPlan = await app.service('plans').create(planData);

        const sdkData = { planId: createdPlan.id };

        const expectedGenerationResponse = {
          planId: 1,
          path: 'base-url-here/download/unique-download-hash-here',
        };

        // Mock the response of generateSdk to be successful.
        sdkGeneration.generateSdk.mockImplementation(async () => {
          return expectedGenerationResponse;
        });

        const createdSdk = await app.service('sdks').create(sdkData);

        expect(sdkGeneration.generateSdk).toHaveBeenCalledTimes(1);
        // SDK created for the right plan.
        expect(createdSdk.planId).toBe(createdPlan.id);
        // SDK created & stored in memory.
        const retrievedSdk = await app.service('sdks').get(createdSdk.id);
        // Check return link, it is called path in the sdk model.
        expect(createdSdk.path).toBe(expectedGenerationResponse.path);
        expect(createdSdk.path).toBe(retrievedSdk.path);

        expect(createdSdk.id).toBe(retrievedSdk.id);
      });

      it('create a sdk error, bad options', async () => {
        const specData: Spec = {
          title: 'Dummy specification title',
          description: 'A description of my specification',
          path:
            'this fake path will actually lead to an error but that is ok since we are mocking it',
        };
        const createdSpec = await app.service('specifications').create(specData);

        const planData: Plan = {
          specId: createdSpec.id,
          target: 'Kewl kids use Haskell',
          version: 'v1.1.1',
          options: 'options should be an object and not a string',
          buildStatus: BuildStatus.NotRun,
        };

        const createdPlan = await app.service('plans').create(planData);

        const sdkData = { planId: createdPlan.id };

        sdkGeneration.generateSdk.mockImplementation(async () => {
          const swaggerCodegenMalformedOptionsResponse = {
            code: 500,
            type: 'unknown',
            message: 'something bad happened',
          };
          throw new Error(swaggerCodegenMalformedOptionsResponse.message);
        });
        await expect(app.service('sdks').create(sdkData)).rejects.toThrowError();

        // generateSdk() called once.
        expect(sdkGeneration.generateSdk).toHaveBeenCalledTimes(1);
      });

      it('create a sdk error, invalid path', async () => {
        const specData: Spec = {
          title: 'Dummy specification title',
          description: 'A description of my specification',
          path: 'this fake path will lead to an error this time yay',
        };
        const createdSpec = await app.service('specifications').create(specData);

        const planData: Plan = {
          specId: createdSpec.id,
          target: 'Kewl kids use Haskell',
          version: 'v1.1.1',
          buildStatus: BuildStatus.NotRun,
        };

        const createdPlan = await app.service('plans').create(planData);

        const sdkData = { planId: createdPlan.id };
        sdkGeneration.generateSdk.mockImplementation(async () => {
          const swaggerCodegenInvalidSpecificationResponse = {
            code: 1,
            type: 'error',
            message: 'The swagger specification supplied was not valid',
          };
          throw new Error(swaggerCodegenInvalidSpecificationResponse.message);
        });

        await expect(app.service('sdks').create(sdkData)).rejects.toThrowError();

        expect(sdkGeneration.generateSdk).toHaveBeenCalledTimes(1);
      });
    });
  });
});
