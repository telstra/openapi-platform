import { BuildStatus } from 'model/Plan';
export async function initDummyData(specs, plans): Promise<void> {
  const spec1 = await specs.create({
    title: 'Birds',
    description: 'A Bird API, for Birds',
    path: 'git.example.com/swagger-specs/birds.yaml',
  });
  const addToSpec = async (spec, ...specPlans) => {
    for (const specPlan of specPlans) {
      await plans.create({
        specId: spec.id,
        ...specPlan,
      });
    }
  };
  await addToSpec(
    spec1,
    {
      target: 'java',
      version: 'v1.0.34',
      buildStatus: BuildStatus.SUCCESS,
    },
    {
      target: 'javascript',
      version: 'v1.0.35',
      buildStatus: BuildStatus.RUNNING,
    },
    {
      target: 'haskell-http-client',
      version: 'v0',
      buildStatus: BuildStatus.NOTRUN,
    },
  );
  const spec2 = await specs.create({
    title: 'Test',
    description:
      'A test API for testing with a very long description that should truncate when displayed in the list',
    path: 'git.example.com/swagger-specs/test.yaml',
  });
  await addToSpec(spec2, {
    target: 'go',
    version: 'alpha',
    buildStatus: BuildStatus.FAIL,
  });
  const spec3 = await specs.create({
    title: 'Swagger API Example Uber',
    description: 'A test API for Uber',
    path:
      'https://raw.githubusercontent.com/OAI/OpenAPI-Spec/master/examples/v2.0/yaml/uber.yaml',
  });
  await addToSpec(
    spec3,
    {
      target: 'python',
      version: 'alpha',
      buildStatus: BuildStatus.SUCCESS,
    },
    {
      target: 'java',
      version: 'alpha',
      buildStatus: BuildStatus.SUCCESS,
    },
  );
}
