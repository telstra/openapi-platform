import { withDefaultHooksOptions } from '../../src/hooks';
import { mockFunctions } from 'jest-mock-functions';
// TODO: Would be really nice to have a in-memory-fs

// Could put the following mocks in a __mocks__ folder but these mocks are somewhat specific to these tests
jest.mock('isomorphic-git', () => {
  const actualModule = require.requireActual('isomorphic-git');
  const jestMockFunctions = require('jest-mock-functions');
  const mockedGitModule = jestMockFunctions.mockFunctions(actualModule, {
    onMockedFunction: (fn, ogFn) => fn.mockImplementation((...other) => ogFn(...other)),
  });
  mockedGitModule.clone = jest.fn().mockImplementation((...options) => {
    // We don't want to clone a real repo, just pretend the init-ed one is cloned from somewhere
    return actualModule.init(...options);
  });
  mockedGitModule.push = jest.fn().mockResolvedValue(Promise.resolve());
  return mockedGitModule;
});

jest.mock('@openapi-platform/file-util', () => {
  const actualModule = require.requireActual('@openapi-platform/file-util');
  const { mockFunctions } = require('jest-mock-functions');
  const mockedModule = mockFunctions(actualModule, {
    onMockedFunction: (fn, ogFn) => fn.mockImplementation((...other) => ogFn(...other)),
  });
  mockedModule.downloadToPath.mockImplementation(async path => {
    // Just put a file in the sdkDir to simulate 'downloading'
    const testContent = 'some test content';
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    zip.addFile('test.txt', Buffer.alloc(testContent.length, testContent), '');
    zip.writeZip(path);
  });
  return mockedModule;
});

/**
 * This is actually a test to make sure the other tests are going to work.
 */
it('temp dir actually works', async () => {
  const { makeTempDir } = require('@openapi-platform/file-util');
  await expect(makeTempDir('test')).resolves.not.toBeUndefined();
});

describe('git', () => {
  describe('updateRepoWithNewSdk', () => {
    it('valid inputs', async () => {
      // TODO: ES6 didn't work
      const { updateRepoWithNewSdk } = require('../../src');
      const hooks = mockFunctions(withDefaultHooksOptions(), { recursive: true });
      // TODO: Need to test the outputs of this method
      await updateRepoWithNewSdk(
        {
          repoUrl: 'test',
          auth: {
            username: 'test-username',
          },
        },
        "This SDK URL shouldn't be used",
        { hooks },
      );
      ['before', 'after'].forEach(tense => {
        Object.keys(hooks[tense]).forEach(hookKey => {
          expect(hooks[tense][hookKey]).toBeCalledTimes(1);
        });
      });
    });
  });
});
