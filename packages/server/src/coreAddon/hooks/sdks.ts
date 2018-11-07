import { updateRepoWithNewSdk } from '@openapi-platform/git-util';
import { BuildStatus } from '@openapi-platform/model';
import { generateSdk } from '@openapi-platform/openapi-sdk-gen-client';
import { store } from '@openapi-platform/server-addons';
import fetch from 'node-fetch';

const hooks = {
  before: {
    async create(c, context) {
      if (context.data.sdkConfigId === undefined || context.data.sdkConfigId === null) {
        throw new Error(`The sdkConfigId was ${context.data.sdkConfigId}`);
      }
      context.sdkConfig = await c.app.service('sdkConfigs').get(context.data.sdkConfigId);
      if (!context.sdkConfig) {
        throw new Error(`Sdk ${context.data.sdkConfigId} does not exist`);
      }
      context.data.buildStatus = BuildStatus.Building;
      return context;
    },
    git: {
      async clone(c, context, gitHookContext) {
        c.logger.verbose(
          `Cloning ${gitHookContext.remoteSdkUrl} into ${gitHookContext.repoDir}`,
        );
        await c.app.service('sdks').patch(context.result.id, {
          buildStatus: BuildStatus.Cloning,
        });
      },
      async downloadSdk(c, context, gitHookContext) {
        c.logger.verbose('Dowloading SDK');
      },
      async extractSdk(c, context, gitHookContext) {
        c.logger.verbose(
          `Extracting ${gitHookContext.sdkArchivePath} to ${gitHookContext.sdkDir}`,
        );
      },
      async moveSdkFilesToRepo(c, context, gitHookContext) {
        c.logger.verbose(
          `Moving files from ${gitHookContext.sdkDir} to ${gitHookContext.repoDir}`,
        );
      },
      async stage(c, context, gitHookContext) {
        c.logger.verbose(`Staging ${gitHookContext.stagedPaths.length} paths`);
        await c.app.service('sdks').patch(context.result.id, {
          buildStatus: BuildStatus.Staging,
        });
      },
      async commit(c, context, gitHookContext) {
        // Maybe state the commit message and hash
        c.logger.verbose(`Committing changes`);
      },
      async push(c, context, gitHookContext) {
        c.logger.verbose(`Pushing commits...`);
        await c.app.service('sdks').patch(context.result.id, {
          buildStatus: BuildStatus.Pushing,
        });
      },
    },
  },
  after: {
    async create(c, context) {
      try {
        const spec = await c.app
          .service('specifications')
          .get(context.sdkConfig.specId, {});
        c.logger.verbose(`Generating sdk for sdk ID ${context.result.id}...`);

        await store().addonHooks.before.sdks.generateSdk(c, context);
        const sdkUrl = await generateSdk(spec, context.sdkConfig);
        context.sdkUrl = sdkUrl;
        await store().addonHooks.after.sdks.generateSdk(c, context);

        c.logger.verbose(`Downloading ${sdkUrl}`);
        const sdkResponse = await fetch(sdkUrl);
        c.logger.verbose('Storing sdk');
        const sdkVersion = context.sdkConfig.version;
        const sdkTarget = context.sdkConfig.target;
        const blob = await c.app.service('blobs').create({
          metadata: {
            // TODO: Maybe add the spec title on the start or something
            name: `${sdkTarget}${sdkVersion ? `-${sdkVersion}` : ''}.zip`,
            contentType: sdkResponse.headers.get('Content-Type'),
          },
          stream: sdkResponse.body,
        });
        await c.app.service('sdks').patch(context.result.id, {
          fileId: blob.metadata.id,
        });
        /*
          TODO: The linkside of the info object is probably temporary.
          Might need to consider downloading the object from
          wherever the Swagger gen API stores it.
        */
        if (context.sdkConfig.gitInfo) {
          await updateRepoWithNewSdk(context.sdkConfig.gitInfo, sdkUrl, {
            hooks: {
              before: store().addonHooks.after.sdks.git,
              after: store().addonHooks.before.sdks.git,
            },
          });
        }
        c.logger.verbose(`Successfully built sdk ${context.result.id}`);
        await c.app.service('sdks').patch(context.result.id, {
          buildStatus: BuildStatus.Success,
        });
      } catch (err) {
        await c.app.service('sdks').patch(context.result.id, {
          buildStatus: BuildStatus.Fail,
          // TODO: should include a failure error
        });
        c.logger.error('Failed to generate SDK', err);
      }
    },
  },
};
export default hooks;
