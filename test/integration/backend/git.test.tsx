import { updateRepoWithNewSdk, migrateSdkIntoLocalRepo } from 'backend/git';
import { deletePaths, makeTempDir } from 'backend/file/index';
// jest.mock('fs');

// Could put the following mocks in a __mocks__ folder but these mocks are somewhat specific to these tests
jest.mock('isomorphic-git', () => {
  const actualModule = require.requireActual('isomorphic-git');
  const { mockFunctions } = require('jest-mock-functions');
  const mockedGitModule = mockFunctions(
    actualModule, { onMockedFunction: (fn, ogFn) => fn.mockImplementation((...other) => ogFn(...other))}
  );
  mockedGitModule.checkout = jest.fn().mockImplementation((options) => {
    // We don't want to clone a real repo, just pretend the init-ed one is cloned from somewhere
    actualModule.init(options);
  });
  mockedGitModule.push = jest.fn().mockResolvedValue(undefined);
  return mockedGitModule;
});

jest.mock('../../../src/backend/file/index', () => {
  const actualModule = require.requireActual('../../../src/backend/file/index');
  const { mockFunctions } = require('jest-mock-functions');
  const mockedModule = mockFunctions(
    actualModule, { onMockedFunction: (fn, ogFn) => fn.mockImplementation((...other) => ogFn(...other))}
  );
  mockedModule.downloadToPath.mockImplementation(async (path) => {
    // Just put a file in the sdkDir to simulate 'downloading'
    const testContent = 'some test content';
    const zip = require('adm-zip');
    zip.addFile('test.txt', Buffer.alloc(testContent.length, testContent), '');
    zip.writeZip(path);
  });
  return mockedModule;
});
it('temp dir actually works', async () => {
  const os = require('os');
  expect(os.tmpdir()).not.toBeUndefined();
  // This is actually a test to make sure the other tests are going to work
  const testDir = await makeTempDir('test');
  expect(testDir).not.toBeUndefined();
});
describe('git', () => {
  let sdkDir = '';
  beforeEach(async () => {
    sdkDir = await makeTempDir('test');
  });
  afterEach(async () => {
    await deletePaths([sdkDir]);
  });
  describe('updateRepoWithNewSdk', () => {
    it("doesn't crash", async () => {
      // TODO: Need to test the outputs of this method
      await updateRepoWithNewSdk({
        repoUrl: 'test',
        auth: {
          username: 'test-username'
        }
      }, sdkDir);
    });  
  })

  /*describe('migrateSdkIntoLocalRepo', () => {
    it('moves files correctly', async () => {
      const repoDir = await makeTempDir('repo-test');
    });
  });*/
})