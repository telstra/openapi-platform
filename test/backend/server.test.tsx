import { createServer } from 'backend/server';
import * as sdkGeneration from 'client/sdkGeneration';
import { Plan, BuildStatus } from 'model/Plan';
import { Spec } from 'model/Spec';

/*
 * Test services are registered and any hooks.
 */
describe('test server', () => {
  let app;
  beforeAll(async () => {
    // TODO: Might need to change to beforeEach if data is stored and queried.
    app = await createServer();
  });

  describe('test specification service', () => {
    test('specification service registered', () => {
      const s = app.service('specifications');
      expect(s).toEqual(expect.anything());
    });
  });

  describe('test plans service', () => {
    let planData: Plan;
    const specData: Spec = {
      title: 'title',
      description: 'desc',
      path: 'path',
    };
    let createdSpecId: number;
    beforeAll(async () => {
      // Need a spec to add plans to.
      const createdSpec = await app.service('specifications').create(specData);
      createdSpecId = createdSpec.id;
    });

    beforeEach(() => {
      planData = {
        specId: createdSpecId,
        target: 'java is ew',
        version: 'v1.0.0',
        options: 'my options here',
        buildStatus: BuildStatus.NotRun,
      };
    });

    test('plans service registered', () => {
      const s = app.service('plans');
      expect(s).toEqual(expect.anything());
    });

    test('plan created', async () => {
      const createdPlan = await app.service('plans').create(planData);
      expect(app.service('plans').get(createdPlan.id)).resolves.toEqual(createdPlan);
    });

    test('plan created hook sets buildStatus to BuildStatus.NotRun', async () => {
      const planDataWithBuildStatus = planData;
      planDataWithBuildStatus.buildStatus = BuildStatus.Success; // This changes to NotRun.
      const createdPlan = await app.service('plans').create(planDataWithBuildStatus);
      expect((await app.service('plans').get(createdPlan.id)).buildStatus).toEqual(
        BuildStatus.NotRun,
      );
    });
  });

  describe('test sdks service', () => {
    test('sdks service registered', () => {
      const s = app.service('sdks');
      expect(s).toEqual(expect.anything());
    });

    describe('test creating/generating sdks', () => {
      // A spec and plan need to be created before a SDK can be.
      // TODO: Should there be a model for SDK?

      test('create a sdk success', async () => {
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
          code: 'unique-download-hash-here',
          link: 'base-url-here/download/unique-download-hash-here',
        };

        // Mock the response of generateSdk to be successful.
        const spy = jest.spyOn(sdkGeneration, 'generateSdk').mockImplementation(() => {
          return expectedGenerationResponse;
        });

        const createdSdk = await app.service('sdks').create(sdkData);

        // generateSdk() called once.
        expect(spy).toHaveBeenCalledTimes(1);
        // SDK created for the right plan.
        expect(createdSdk.planId).toBe(createdPlan.id);
        // SDK created & stored in memory.
        expect(app.service('sdks').get(createdSdk.id)).resolves.toEqual(createdSdk);
        // Check return info.
        expect(createdSdk.info).toEqual(expectedGenerationResponse);
      });

      test('create a sdk error, bad options', async () => {
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

        const spy = jest.spyOn(sdkGeneration, 'generateSdk').mockImplementation(() => {
          const swaggerCodegenMalformedOptionsResponse = {
            code: 500,
            type: 'unknown',
            message: 'something bad happened',
          };
          throw new Error(swaggerCodegenMalformedOptionsResponse.message);
        });

        // Errors.
        expect(app.service('sdks').create(sdkData)).rejects.toEqual(expect.any(Error));
        // generateSdk() not called because it threw an error.
        expect(spy).toHaveBeenCalledTimes(0);
      });

      test('create a sdk error, invalid path', async () => {
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
        const spy = jest.spyOn(sdkGeneration, 'generateSdk').mockImplementation(() => {
          const swaggerCodegenInvalidSpecificationResponse = {
            code: 1,
            type: 'error',
            message: 'The swagger specification supplied was not valid',
          };
          throw new Error(swaggerCodegenInvalidSpecificationResponse.message);
        });

        // Errors.
        expect(app.service('sdks').create(sdkData)).rejects.toEqual(expect.any(Error));
        // generateSdk() not called because it threw an error.
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });
});
