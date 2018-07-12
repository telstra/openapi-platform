import assert from 'assert';
import { createServer } from '../../src/backend/server';
import * as dependencyToMock from '../../src/client/sdkGeneration';
import { Plan, BuildStatus } from '../../src/model/Plan';
import { Spec } from '../../src/model/Spec';

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
      assert.ok(s, 'Registered the service');
    });
  });

  describe('test plans service', () => {
    let planData: Plan;
    beforeEach(() => {
      planData = {
        specId: 1,
        target: 'java is ew',
        version: 'v1.0.0',
        options: 'my options here',
        buildStatus: BuildStatus.NOTRUN,
      };
    });

    test('plans service registered', () => {
      const s = app.service('plans');
      assert.ok(s, 'Registered the service');
    });

    test('plan created', async () => {
      const createdPlan = await app.service('plans').create(planData); // HTTP Create/
      expect(
        await app.service('plans').get(createdPlan.id), // HTTP Get.
      ).toEqual(createdPlan);
    });

    test('plan created hook sets buildStatus to BuildStatus.NOTRUN', async () => {
      const planDataWithBuildStatus = planData;
      planDataWithBuildStatus.buildStatus = BuildStatus.SUCCESS; // This changes to NOTRUN.
      const createdPlan = await app.service('plans').create(planDataWithBuildStatus);
      expect((await app.service('plans').get(createdPlan.id)).buildStatus).toEqual(
        BuildStatus.NOTRUN,
      );
    });
  });

  describe('test sdks service', () => {
    test('sdks service registered', () => {
      const s = app.service('sdks');
      assert.ok(s, 'Registered the service');
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
          buildStatus: BuildStatus.NOTRUN,
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
        const spy = jest.spyOn(dependencyToMock, 'generateSdk').mockImplementation(() => {
          return expectedGenerationResponse;
        });

        const createdSdk = await app.service('sdks').create(sdkData);

        // generateSdk() called once.
        expect(spy).toHaveBeenCalledTimes(1);
        // SDK created for the right plan.
        expect(createdSdk.planId).toBe(createdPlan.id);
        // SDK created & stored in memory.
        expect(createdSdk).toEqual(await app.service('sdks').get(createdSdk.id));
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
          buildStatus: BuildStatus.NOTRUN,
        };

        const createdPlan = await app.service('plans').create(planData);

        const sdkData = { planId: createdPlan.id };

        const spy = jest.spyOn(dependencyToMock, 'generateSdk').mockImplementation(() => {
          const swaggerCodegenMalformedOptionsResponse = {
            code: 500,
            type: 'unknown',
            message: 'something bad happened',
          };
          throw new Error(swaggerCodegenMalformedOptionsResponse.message);
        });

        let createdSdk;
        let errorMessage;
        try {
          createdSdk = await app.service('sdks').create(sdkData);
        } catch (err) {
          errorMessage = err.toString();
        }

        // generateSdk() called once.
        expect(spy).toHaveBeenCalledTimes(1);
        // SDK not created.
        expect(createdSdk).toBe(undefined);
        // Error throw with right message.
        expect(errorMessage).toEqual('Error: something bad happened');
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
          buildStatus: BuildStatus.NOTRUN,
        };

        const createdPlan = await app.service('plans').create(planData);

        const sdkData = { planId: createdPlan.id };
        const spy = jest.spyOn(dependencyToMock, 'generateSdk').mockImplementation(() => {
          const swaggerCodegenInvalidSpecificationResponse = {
            code: 1,
            type: 'error',
            message: 'The swagger specification supplied was not valid',
          };
          throw new Error(swaggerCodegenInvalidSpecificationResponse.message);
        });

        let createdSdk;
        let errorMessage;
        try {
          createdSdk = await app.service('sdks').create(sdkData);
        } catch (err) {
          errorMessage = err.toString();
        }

        // generateSdk() called once.
        expect(spy).toHaveBeenCalledTimes(1);
        // SDK not created.
        expect(createdSdk).toBe(undefined);
        // Error throw with right message.
        expect(errorMessage).toEqual(
          'Error: The swagger specification supplied was not valid',
        );
      });
    });
  });
});
