import { BuildStatus, Sdk } from 'model/Sdk';
import { OldSpec } from 'model/Spec';
let count = 0;

// TODO: Replace this list
export async function initDummyData(specifications, sdks): Promise<void> {
  const spec1 = await specifications.create({
    title: 'Birds',
    description: 'A Bird API, for Birds',
    path: 'git.example.com/swagger-specs/birds.yaml'
  });
  const addToSpec = async (spec, ...specSdks) => {
    for (const specSdk of specSdks) {
      console.log(
        await sdks.create({
          specId: spec.id,
          ...specSdk
        })
      );
    }
  };
  await addToSpec(
    spec1,
    {
      name: 'Java',
      latestVersion: 'v1.0.34',
      buildStatus: BuildStatus.SUCCESS
    },
    {
      name: 'Node.js',
      latestVersion: 'v1.0.35',
      buildStatus: BuildStatus.RUNNING
    },
    {
      name: 'Haskell',
      latestVersion: 'v0',
      buildStatus: BuildStatus.NOTRUN
    }
  );
  const spec2 = await specifications.create({
    title: 'Test',
    description:
      'A test API for testing with a very long description that should truncate when displayed in the list',
    path: 'git.example.com/swagger-specs/test.yaml'
  });
  await addToSpec(spec2, {
    name: 'FORTRAN',
    latestVersion: 'alpha',
    buildStatus: BuildStatus.FAIL
  });
  const spec3 = await specifications.create({
    title: 'Swagger API Example Uber',
    description: 'A test API for Uber',
    path:
      'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/yaml/uber.yaml'
  });
  await addToSpec(
    spec3,
    {
      name: 'Python',
      latestVersion: 'alpha',
      buildStatus: BuildStatus.SUCCESS
    },
    {
      name: 'java',
      latestVersion: 'alpha',
      buildStatus: BuildStatus.SUCCESS
    }
  );
}
